/**
 * My Bookings Page - View booking history
 */

let allBookings = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    // Check login
    if (!AuthManager.requireLogin()) return;

    const user = AuthManager.getUser();
    DOM.$('#nav-greeting').innerHTML = `Halo, <b style="color:var(--primary);">${user.nama?.split(' ')[0] || 'User'}</b>`;

    // Load bookings
    loadBookings();
});

/**
 * Load user bookings
 */
async function loadBookings() {
    const user = AuthManager.getUser();
    const container = DOM.$('#bookings-container');

    try {
        // Show skeleton loaders
        showSkeletonLoaders();

        // Simulate small delay for loading state visibility
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const response = await APIService.getUserBookings(user.id);
        const rawBookings = response.data || [];

        // Fetch client reviews to know which bookings have reviews
        const reviewsRes = await APIService.getClientReviews(user.id).catch(() => ({ data: [] }));
        const clientReviews = reviewsRes.data || [];

        // Fetch additional details for each booking
        const enhancedBookings = await Promise.all(rawBookings.map(async (booking) => {
            // Calculate duration
            const start = new Date(booking.waktuMulai);
            const end = new Date(booking.waktuSelesai);
            const diffMs = end - start;
            let calcDuration = Math.round(diffMs / (1000 * 60 * 60));
            if (isNaN(calcDuration)) calcDuration = 1;
            booking.duration = Math.max(1, calcDuration);

            // Fetch talent info
            try {
                const talentRes = await APIService.getTalentDetail(booking.talentId);
                booking.talent = talentRes.data || {};
            } catch (e) {
                booking.talent = { nama: 'Unknown Talent' };
            }

            // Fetch service info
            try {
                const servicesRes = await APIService.getTalentServices(booking.talentId);
                const services = servicesRes.data || [];
                booking.service = services.find(s => s.id === booking.serviceId) || {};
                booking.price = booking.service.harga || booking.service.tarifDasar || 0;
            } catch (e) {
                booking.service = { nama: 'Unknown Service' };
                booking.price = 0;
            }

            booking.totalAmount = booking.price * booking.duration;

            // Check if review submitted
            const review = clientReviews.find(r => r.bookingId === booking.id);
            if (review) {
                booking.reviewSubmitted = true;
                booking.reviewId = review.id;
            } else {
                booking.reviewSubmitted = false;
            }

            return booking;
        }));

        allBookings = enhancedBookings;
        renderBookings(allBookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
        UIUtils.showAlert('Gagal memuat pesanan', 'error');
        container.innerHTML = '<div class="empty-state"><h3>❌ Terjadi kesalahan</h3></div>';
    }
}

/**
 * Show skeleton loading placeholders
 */
function showSkeletonLoaders() {
    const container = DOM.$('#bookings-container');
    container.innerHTML = '';
    
    for (let i = 0; i < 3; i++) {
        const skeleton = DOM.createElement('div', 'skeleton-card');
        skeleton.innerHTML = `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 15px; margin-bottom: 15px;">
                <div style="flex: 1;">
                    <div class="skeleton skeleton-title" style="width: 150px;"></div>
                    <div class="skeleton skeleton-text short" style="width: 100px;"></div>
                </div>
                <div class="skeleton" style="width: 80px; height: 24px; border-radius: 12px;"></div>
            </div>
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <div class="skeleton" style="width: 40px; height: 40px; border-radius: 50%;"></div>
                <div class="skeleton" style="width: 40px; height: 40px; border-radius: 50%;"></div>
                <div class="skeleton" style="width: 40px; height: 40px; border-radius: 50%;"></div>
                <div class="skeleton" style="width: 40px; height: 40px; border-radius: 50%;"></div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text short"></div></div>
                <div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text short"></div></div>
                <div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text short"></div></div>
                <div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text short"></div></div>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--border); padding-top: 15px;">
                <div class="skeleton" style="width: 100px; height: 32px; border-radius: var(--radius-md);"></div>
                <div class="skeleton" style="width: 100px; height: 32px; border-radius: var(--radius-md);"></div>
            </div>
        `;
        container.appendChild(skeleton);
    }
}

/**
 * Render bookings
 */
function renderBookings(bookings) {
    const container = DOM.$('#bookings-container');
    const emptyState = DOM.$('#empty-state');

    const filtered = currentFilter === 'all' 
        ? bookings 
        : bookings.filter(b => (b.status || '').toLowerCase() === currentFilter.toLowerCase());

    if (filtered.length === 0) {
        container.innerHTML = '';
        DOM.show(emptyState);
        return;
    }

    DOM.hide(emptyState);
    container.innerHTML = '';

    filtered.forEach(booking => {
        const card = createBookingCard(booking);
        container.appendChild(card);
    });
}

/**
 * Create booking card element
 */
function createBookingCard(booking) {
    const card = DOM.createElement('div', 'booking-card');

    const talent = booking.talent || {};
    const service = booking.service || {};
    const normalizedStatus = (booking.status || '').toLowerCase();
    const statusClass = `status-${normalizedStatus}`;

    // Timeline status
    const statusSteps = ['Pending', 'Dibayar', 'Dikonfirmasi', 'Selesai'];
    let currentStep = 0;
    if (normalizedStatus === 'paid') currentStep = 1;
    else if (normalizedStatus === 'confirmed') currentStep = 2;
    else if (normalizedStatus === 'completed') currentStep = 3;

    let timelineHTML = '<div class="timeline-status">';
    for (let i = 0; i < 4; i++) {
        const isActive = i <= currentStep ? 'active' : '';
        timelineHTML += `
            <div class="timeline-step ${isActive}">
                <div class="step-circle">${i + 1}</div>
                <div class="step-label">${statusSteps[i]}</div>
            </div>
        `;
    }
    timelineHTML += '</div>';

    // Action buttons based on status
    let actionButtons = '';
    const isTalent = AuthManager.getUser()?.role?.toLowerCase() === 'talent';

    if (isTalent) {
        if (normalizedStatus === 'paid' || normalizedStatus === 'pending') {
            actionButtons = `
                <button class="btn btn-sm btn-primary" onclick="approveBooking('${booking.id}', this)">
                    Setujui
                </button>
                <button class="btn btn-sm btn-danger" onclick="rejectBooking('${booking.id}', this)">
                    Tolak
                </button>
            `;
        }
    } else {
        if (normalizedStatus === 'pending') {
            actionButtons = `
                <button class="btn btn-sm btn-primary" onclick="window.location.href='/payment.html?bookingId=${booking.id}'">
                    💳 Bayar
                </button>
                <button class="btn btn-sm btn-secondary" onclick="cancelBooking('${booking.id}', this)">
                    Batalkan
                </button>
            `;
        } else if (normalizedStatus === 'completed' && !booking.reviewSubmitted) {
            actionButtons = `
                <button class="btn btn-sm btn-primary" onclick="window.location.href='/review.html?bookingId=${booking.id}'">
                    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align: text-bottom;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> Beri Review
                </button>
            `;
        } else if (normalizedStatus === 'completed' && booking.reviewSubmitted) {
            actionButtons = `
                <button class="btn btn-sm btn-outline-primary" onclick="window.location.href='/reviews-list.html'">
                    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 2px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> Lihat Review
                </button>
            `;
        }
    }

    card.innerHTML = `
        <div class="booking-card-header">
            <div>
                <strong>${talent.nama || 'Unknown Talent'}</strong>
                <p style="margin-bottom: 0; color: var(--text-secondary); font-size: var(--font-size-sm);">
                    ID: ${booking.bookingNumber || booking.id?.slice(-6).toUpperCase()}
                </p>
            </div>
            <span class="booking-status ${statusClass}">${booking.status?.toUpperCase()}</span>
        </div>
        <div class="booking-card-body">
            ${timelineHTML}
            
            <div class="booking-info">
                <div class="info-item">
                    <div class="info-label">Layanan</div>
                    <div class="info-value">${service.namaLayanan || service.nama || 'Unknown Service'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Tanggal & Waktu</div>
                    <div class="info-value">${UIUtils.formatDate(booking.waktuMulai)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Durasi</div>
                    <div class="info-value">${booking.duration || 1} jam</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Total Pembayaran</div>
                    <div class="info-value" style="color: var(--primary);">${UIUtils.formatCurrency(booking.totalAmount || 0)}</div>
                </div>
            </div>

            ${booking.notes ? `
                <div style="background-color: var(--bg-input); padding: var(--spacing-md); border-radius: 8px;">
                    <strong style="display: block; margin-bottom: var(--spacing-xs);">Catatan:</strong>
                    <p style="margin-bottom: 0; font-size: var(--font-size-sm);">${booking.notes}</p>
                </div>
            ` : ''}
        </div>
        <div class="booking-card-footer">
            <button class="btn btn-sm btn-secondary" onclick="viewBookingDetails('${booking.id}')">
                 Lihat Detail
            </button>
            ${actionButtons}
        </div>
    `;

    return card;
}

/**
 * Filter bookings by status
 */
function filterBookings(status) {
    currentFilter = status;

    // Update filter UI
    DOM.$$('.filter-chip').forEach(chip => {
        if (chip.dataset.filter === status) {
            DOM.addClass(chip, 'active');
        } else {
            DOM.removeClass(chip, 'active');
        }
    });

    // Re-render
    renderBookings(allBookings);
}

/**
 * View booking details
 */
function viewBookingDetails(bookingId) {
    const booking = allBookings.find(b => b.id === bookingId);
    if (!booking) return;

    const modalBody = DOM.$('#booking-detail-modal-body');
    if (!modalBody) return;

    modalBody.innerHTML = `
        <div style="display: grid; gap: var(--spacing-md);">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: var(--spacing-sm);">
                <span style="color: var(--text-secondary);">ID Pesanan:</span>
                <strong>${booking.bookingNumber || bookingId.slice(-6).toUpperCase()}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: var(--spacing-sm);">
                <span style="color: var(--text-secondary);">Talent:</span>
                <strong>${booking.talent?.nama || 'Unknown Talent'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: var(--spacing-sm);">
                <span style="color: var(--text-secondary);">Layanan:</span>
                <strong>${booking.service?.namaLayanan || booking.service?.nama || 'Unknown Service'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: var(--spacing-sm);">
                <span style="color: var(--text-secondary);">Tanggal:</span>
                <strong>${UIUtils.formatDate(booking.waktuMulai)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: var(--spacing-sm);">
                <span style="color: var(--text-secondary);">Durasi:</span>
                <strong>${booking.duration} jam</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: var(--spacing-sm);">
                <span style="color: var(--text-secondary);">Status:</span>
                <strong style="color: ${UIUtils.getStatusColor(booking.status)}; text-transform: uppercase;">${booking.status}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: var(--spacing-sm);">
                <span style="color: var(--text-secondary);">Total Pembayaran:</span>
                <strong style="color: var(--primary); font-size: var(--font-size-lg);">${UIUtils.formatCurrency(booking.totalAmount)}</strong>
            </div>
            ${booking.notes ? `
            <div style="background-color: var(--bg-input); padding: var(--spacing-md); border-radius: var(--radius-md); margin-top: var(--spacing-sm);">
                <span style="display: block; color: var(--text-secondary); margin-bottom: var(--spacing-xs); font-size: var(--font-size-sm);">Catatan:</span>
                <p style="margin: 0;">${booking.notes}</p>
            </div>
            ` : ''}
        </div>
    `;

    DOM.$('#booking-detail-modal').style.display = 'flex';
}

/**
 * Close booking detail modal
 */
function closeBookingDetailModal() {
    DOM.$('#booking-detail-modal').style.display = 'none';
}

/**
 * Approve booking
 */
async function approveBooking(bookingId, btn) {
    if (!confirm('Setujui pesanan ini?')) return;

    if (btn) btn.classList.add('btn-loading');
    try {
        await new Promise(r => setTimeout(r, 600)); // Simulate delay
        await APIService.updateBookingStatus(bookingId, 'CONFIRMED');
        
        UIUtils.showAlert('Pesanan disetujui!', 'success');
        await loadBookings();
    } catch (error) {
        UIUtils.showAlert('Gagal menyetujui pesanan', 'error');
        if (btn) btn.classList.remove('btn-loading');
    }
}

/**
 * Reject booking
 */
async function rejectBooking(bookingId, btn) {
    const reason = prompt('Alasan penolakan:');
    if (!reason) return;

    if (btn) btn.classList.add('btn-loading');
    try {
        await new Promise(r => setTimeout(r, 600)); // Simulate delay
        await APIService.updateBookingStatus(bookingId, 'CANCELLED');
        
        UIUtils.showAlert('Pesanan ditolak', 'success');
        await loadBookings();
    } catch (error) {
        UIUtils.showAlert('Gagal menolak pesanan', 'error');
        if (btn) btn.classList.remove('btn-loading');
    }
}

/**
 * Cancel booking
 */
async function cancelBooking(bookingId, btn) {
    if (!confirm('Yakin ingin membatalkan pesanan ini?')) return;

    const reason = prompt('Alasan pembatalan (opsional):');

    if (btn) btn.classList.add('btn-loading');
    try {
        await new Promise(r => setTimeout(r, 600)); // Simulate delay
        await APIService.updateBookingStatus(bookingId, 'CANCELLED');
        UIUtils.showAlert('Pesanan berhasil dibatalkan', 'success');
        await loadBookings();
    } catch (error) {
        UIUtils.showAlert('Gagal membatalkan pesanan: ' + error.message, 'error');
        if (btn) btn.classList.remove('btn-loading');
    }
}

/**
 * Logout
 */
function logout() {
    if (confirm('Yakin ingin keluar?')) {
        AuthManager.logout();
        window.location.href = '/login.html';
    }
}
