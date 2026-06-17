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
        allBookings = response.data || [];

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
        : bookings.filter(b => b.status === currentFilter);

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
    const statusClass = `status-${booking.status}`;

    // Timeline status
    const statusSteps = ['Pending', 'Dikonfirmasi', 'Selesai'];
    const currentStep = booking.status === 'pending' ? 0 : booking.status === 'confirmed' ? 1 : 2;

    let timelineHTML = '<div class="timeline-status">';
    for (let i = 0; i < 3; i++) {
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
    if (booking.status === 'pending') {
        actionButtons = `
            <button class="btn btn-sm btn-secondary" onclick="cancelBooking('${booking.id}')">
                Batalkan
            </button>
        `;
    } else if (booking.status === 'completed' && !booking.reviewSubmitted) {
        actionButtons = `
            <button class="btn btn-sm btn-primary" onclick="window.location.href='/review.html?bookingId=${booking.id}'">
                ⭐ Beri Review
            </button>
        `;
    } else if (booking.status === 'completed' && booking.reviewSubmitted) {
        actionButtons = `
            <span class="badge badge-success">✓ Review Sudah Dikirim</span>
        `;
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
                    <div class="info-value">${service.nama || 'Unknown Service'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Tanggal & Waktu</div>
                    <div class="info-value">${UIUtils.formatDate(booking.bookingDate)} ${booking.bookingTime || ''}</div>
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
Layanan: ${booking.service?.nama}
Tanggal: ${UIUtils.formatDate(booking.bookingDate)}
Waktu: ${booking.bookingTime}
Durasi: ${booking.duration} jam
Status: ${booking.status}
Total: ${UIUtils.formatCurrency(booking.totalAmount)}

Catatan: ${booking.notes || '-'}
    `);
}

/**
 * Cancel booking
 */
async function cancelBooking(bookingId) {
    if (!confirm('Yakin ingin membatalkan pesanan ini?')) return;

    const reason = prompt('Alasan pembatalan (opsional):');

    try {
        // In a real app, call API
        // await APIService.cancelBooking(bookingId);

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
