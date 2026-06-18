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
        const response = await APIService.getUserBookings(user.id);
        const rawBookings = response.data || [];

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
                <button class="btn btn-sm btn-primary" onclick="approveBooking('${booking.id}')">
                    Setujui
                </button>
                <button class="btn btn-sm btn-danger" onclick="rejectBooking('${booking.id}')">
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
                <button class="btn btn-sm btn-secondary" onclick="cancelBooking('${booking.id}')">
                    Batalkan
                </button>
            `;
        } else if (normalizedStatus === 'completed' && !booking.reviewSubmitted) {
            actionButtons = `
                <button class="btn btn-sm btn-primary" onclick="window.location.href='/review.html?bookingId=${booking.id}'">
                    ⭐ Beri Review
                </button>
            `;
        } else if (normalizedStatus === 'completed' && booking.reviewSubmitted) {
            actionButtons = `
                <span class="badge badge-success">✓ Review Sudah Dikirim</span>
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
                👁️ Lihat Detail
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
    // For now, just show in alert or could redirect to detail page
    const booking = allBookings.find(b => b.id === bookingId);
    if (!booking) return;

    alert(`
Pesanan: ${booking.bookingNumber || bookingId}
Talent: ${booking.talent?.nama}
Layanan: ${booking.service?.namaLayanan || booking.service?.nama}
Tanggal: ${UIUtils.formatDate(booking.waktuMulai)}
Durasi: ${booking.duration} jam
Status: ${booking.status}
Total: ${UIUtils.formatCurrency(booking.totalAmount)}

Catatan: ${booking.notes || '-'}
    `);
}

/**
 * Approve booking
 */
async function approveBooking(bookingId) {
    if (!confirm('Setujui pesanan ini?')) return;

    try {
        await APIService.updateBookingStatus(bookingId, 'CONFIRMED');
        
        UIUtils.showAlert('Pesanan disetujui!', 'success');
        await loadBookings();
    } catch (error) {
        UIUtils.showAlert('Gagal menyetujui pesanan', 'error');
    }
}

/**
 * Reject booking
 */
async function rejectBooking(bookingId) {
    const reason = prompt('Alasan penolakan:');
    if (!reason) return;

    try {
        await APIService.updateBookingStatus(bookingId, 'CANCELLED');
        
        UIUtils.showAlert('Pesanan ditolak', 'success');
        await loadBookings();
    } catch (error) {
        UIUtils.showAlert('Gagal menolak pesanan', 'error');
    }
}

/**
 * Cancel booking
 */
async function cancelBooking(bookingId) {
    if (!confirm('Yakin ingin membatalkan pesanan ini?')) return;

    const reason = prompt('Alasan pembatalan (opsional):');

    try {
        await APIService.updateBookingStatus(bookingId, 'CANCELLED');
        UIUtils.showAlert('Pesanan berhasil dibatalkan', 'success');
        await loadBookings();
    } catch (error) {
        UIUtils.showAlert('Gagal membatalkan pesanan: ' + error.message, 'error');
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
