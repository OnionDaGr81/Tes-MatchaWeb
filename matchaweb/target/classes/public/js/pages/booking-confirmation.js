/**
 * Booking Confirmation Page
 */

let bookingData = null;

document.addEventListener('DOMContentLoaded', () => {
    // Check login
    if (!AuthManager.requireLogin()) return;

    // Get booking ID from URL
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('bookingId');

    if (!bookingId) {
        alert('Booking ID tidak ditemukan!');
        window.location.href = '/catalog.html';
        return;
    }

    // Load booking confirmation details
    loadBookingDetails(bookingId);
});

/**
 * Load booking details
 */
async function loadBookingDetails(bookingId) {
    try {
        const response = await APIService.getBookingDetail(bookingId);
        bookingData = response.data;

        // Calculate duration
        const start = new Date(bookingData.waktuMulai);
        const end = new Date(bookingData.waktuSelesai);
        const diffMs = end - start;
        let calcDuration = Math.round(diffMs / (1000 * 60 * 60));
        if (isNaN(calcDuration)) calcDuration = 1;
        bookingData.duration = Math.max(1, calcDuration);

        // Fetch talent info
        try {
            const talentRes = await APIService.getTalentDetail(bookingData.talentId);
            bookingData.talent = talentRes.data || {};
        } catch (e) {
            bookingData.talent = { nama: 'Unknown Talent' };
        }

        // Fetch service info
        try {
            const servicesRes = await APIService.getTalentServices(bookingData.talentId);
            const services = servicesRes.data || [];
            bookingData.service = services.find(s => s.id === bookingData.serviceId) || {};
            bookingData.price = bookingData.service.harga || bookingData.service.tarifDasar || 0;
        } catch (e) {
            bookingData.service = { nama: 'Unknown Service' };
            bookingData.price = 0;
        }

        bookingData.totalAmount = bookingData.price * bookingData.duration;

        // Generate booking number if not exists
        if (!bookingData.bookingNumber) {
            bookingData.bookingNumber = `MTH-${new Date().getFullYear()}-${bookingId.slice(-5).toUpperCase()}`;
        }

        // Update page with booking details
        updateBookingDisplay();
    } catch (error) {
        console.error('Error loading booking:', error);
        UIUtils.showAlert('Gagal memuat detail booking', 'error');
    }
}

/**
 * Update booking display
 */
function updateBookingDisplay() {
    if (!bookingData) return;

    const talent = bookingData.talent || {};
    const service = bookingData.service || {};

    // Update booking number
    DOM.$('#booking-number').textContent = bookingData.bookingNumber || 'MTH-2024-XXXXX';

    // Update details
    DOM.$('#detail-talent').textContent = talent.nama || 'Unknown Talent';
    DOM.$('#detail-service').textContent = service.namaLayanan || service.nama || 'Unknown Service';
    DOM.$('#detail-datetime').textContent = `${UIUtils.formatDate(bookingData.waktuMulai)}`;
    DOM.$('#detail-duration').textContent = `${bookingData.duration || 1} jam`;
    DOM.$('#detail-amount').textContent = UIUtils.formatCurrency(bookingData.totalAmount || 0);
}

/**
 * Copy booking code to clipboard
 */
function copyBookingCode() {
    const bookingNumber = DOM.$('#booking-number').textContent;
    
    navigator.clipboard.writeText(bookingNumber).then(() => {
        UIUtils.showAlert('Nomor pesanan disalin!', 'success');
    }).catch(() => {
        alert('Gagal menyalin, silakan copy manual: ' + bookingNumber);
    });
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
