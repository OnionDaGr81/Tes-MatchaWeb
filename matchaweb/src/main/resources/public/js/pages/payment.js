/**
 * Payment Page - Handle payment processing
 */

let currentPaymentMethod = 'card';
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

    // Load booking details
    loadBookingDetails(bookingId);

    // Setup card input formatting
    setupCardInputFormatting();
});

/**
 * Load booking details
 */
async function loadBookingDetails(bookingId) {
    try {
        const response = await APIService.getBookingDetail(bookingId);
        bookingData = response.data;

        // Render order summary
        renderOrderSummary();
    } catch (error) {
        UIUtils.showAlert('Gagal memuat detail booking: ' + error.message, 'error');
        console.error(error);
    }
}

/**
 * Render order summary
 */
function renderOrderSummary() {
    if (!bookingData) return;

    const talent = bookingData.talent || {};
    const service = bookingData.service || {};
    const totalAmount = bookingData.totalAmount || (bookingData.price * bookingData.duration);

    const html = `
        <div class="order-item">
            <div class="order-label">Talent</div>
            <div class="order-value">${talent.nama || 'N/A'}</div>
        </div>

        <div class="order-item">
            <div class="order-label">Layanan</div>
            <div class="order-value">${service.nama || 'N/A'}</div>
        </div>

        <div class="order-item">
            <div class="order-label">Tanggal</div>
            <div class="order-value">${UIUtils.formatDate(bookingData.bookingDate) || 'N/A'}</div>
        </div>

        <div class="order-item">
            <div class="order-label">Durasi</div>
            <div class="order-value">${bookingData.duration || 1} jam</div>
        </div>

        <div class="order-item">
            <div class="order-label">Harga/jam</div>
            <div class="order-value">${UIUtils.formatCurrency(service.harga || bookingData.price)}</div>
        </div>

        <div class="order-item">
            <div class="order-label">Subtotal</div>
            <div class="order-value">${UIUtils.formatCurrency(totalAmount || 0)}</div>
        </div>

        <div class="order-total">
            <span>Total</span>
            <span>${UIUtils.formatCurrency(totalAmount || 0)}</span>
        </div>
    `;

    DOM.$('#booking-details').innerHTML = html;

    // Update submit button with amount
    const submitBtn = DOM.$('#submit-btn');
    if (submitBtn) {
        submitBtn.textContent = `Bayar ${UIUtils.formatCurrency(totalAmount || 0)}`;
    }
}

/**
 * Select payment method
 */
function selectPaymentMethod(method) {
    currentPaymentMethod = method;

    // Update UI
    DOM.$$('.payment-method').forEach(pm => {
        DOM.removeClass(pm, 'active');
    });
    event.target.closest('.payment-method').classList.add('active');

    // Show/hide payment details
    DOM.$('#card-payment').style.display = method === 'card' ? 'block' : 'none';
    DOM.$('#bank-payment').style.display = method === 'bank' ? 'block' : 'none';
    DOM.$('#ewallet-payment').style.display = method === 'ewallet' ? 'block' : 'none';
}

/**
 * Setup card input formatting
 */
function setupCardInputFormatting() {
    const cardNumber = DOM.$('#card-number');
    const cardExpiry = DOM.$('#card-expiry');

    // Format card number (space every 4 digits)
    if (cardNumber) {
        cardNumber.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.replace(/\B(?=(\d{4})+(?!\d))/g, ' ');
            e.target.value = formattedValue;
        });
    }

    // Format expiry (MM/YY)
    if (cardExpiry) {
        cardExpiry.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }
}

/**
 * Process card payment
 */
async function processPayment(e) {
    e.preventDefault();

    const cardName = DOM.$('#card-name').value;
    const cardNumber = DOM.$('#card-number').value.replace(/\s/g, '');
    const cardExpiry = DOM.$('#card-expiry').value;
    const cardCvv = DOM.$('#card-cvv').value;

    // Validasi
    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
        UIUtils.showAlert('Semua field kartu harus diisi!', 'error');
        return;
    }

    if (cardNumber.length !== 16) {
        UIUtils.showAlert('Nomor kartu harus 16 digit!', 'error');
        return;
    }

    if (cardCvv.length < 3) {
        UIUtils.showAlert('CVV tidak valid!', 'error');
        return;
    }

    try {
        const btn = DOM.$('#payment-form button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Memproses pembayaran...';

        // Prepare payment data
        const paymentData = {
            bookingId: bookingData.id,
            paymentMethod: 'card',
            amount: bookingData.totalAmount || (bookingData.price * bookingData.duration),
            cardDetails: {
                cardName,
                cardNumber: cardNumber.slice(-4), // Only save last 4 digits
                cardExpiry
            }
        };

        // Call API
        const response = await APIService.processPayment(paymentData);

        UIUtils.showAlert('Pembayaran berhasil! Mengalihkan...', 'success');

        setTimeout(() => {
            window.location.href = `/booking-confirmation.html?bookingId=${bookingData.id}`;
        }, 2000);
    } catch (error) {
        UIUtils.showAlert('Pembayaran gagal: ' + error.message, 'error');
        
        const btn = DOM.$('#payment-form button[type="submit"]');
        btn.disabled = false;
        btn.textContent = `Bayar ${UIUtils.formatCurrency(bookingData.totalAmount)}`;
    }
}

/**
 * Confirm bank transfer
 */
async function confirmBankTransfer(e) {
    e.preventDefault();

    const proofFile = DOM.$('#transfer-proof').files[0];

    if (!proofFile) {
        UIUtils.showAlert('Silakan upload bukti transfer!', 'error');
        return;
    }

    try {
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Memproses...';

        // In a real app, upload file to server
        // For now, just simulate
        const paymentData = {
            bookingId: bookingData.id,
            paymentMethod: 'bank_transfer',
            amount: bookingData.totalAmount || (bookingData.price * bookingData.duration),
            proofFileName: proofFile.name
        };

        const response = await APIService.processPayment(paymentData);

        UIUtils.showAlert('Bukti transfer diterima! Admin akan memverifikasi segera.', 'success');

        setTimeout(() => {
            window.location.href = `/booking-confirmation.html?bookingId=${bookingData.id}`;
        }, 2000);
    } catch (error) {
        UIUtils.showAlert('Gagal upload bukti: ' + error.message, 'error');
        
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = false;
        btn.textContent = 'Konfirmasi Transfer';
    }
}

/**
 * Process e-wallet payment
 */
async function processEWalletPayment() {
    const provider = DOM.$('#ewallet-provider').value;
    const phone = DOM.$('#ewallet-phone').value;

    if (!provider || !phone) {
        UIUtils.showAlert('Pilih provider dan masukkan nomor telepon!', 'error');
        return;
    }

    try {
        const paymentData = {
            bookingId: bookingData.id,
            paymentMethod: 'ewallet',
            ewalletProvider: provider,
            phone,
            amount: bookingData.totalAmount || (bookingData.price * bookingData.duration)
        };

        const response = await APIService.processPayment(paymentData);

        UIUtils.showAlert('Mengalihkan ke ' + provider.toUpperCase() + '...', 'success');

        // In real app, redirect to payment gateway
        setTimeout(() => {
            // Simulated redirect
            window.location.href = `/booking-confirmation.html?bookingId=${bookingData.id}`;
        }, 2000);
    } catch (error) {
        UIUtils.showAlert('Gagal memproses e-wallet: ' + error.message, 'error');
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
