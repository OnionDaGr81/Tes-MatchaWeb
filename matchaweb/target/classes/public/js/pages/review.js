/**
 * Review Page - Submit reviews and ratings
 */

let overallRating = 0;
let aspectRatings = {
    professionalism: 0,
    punctuality: 0,
    quality: 0,
    communication: 0
};

const ratingLabels = {
    0: 'Klik untuk memberi rating',
    1: 'Sangat Buruk 😞',
    2: 'Kurang Memuaskan 😐',
    3: 'Cukup Baik 👍',
    4: 'Sangat Baik 😊',
    5: 'Luar Biasa! 🌟'
};

document.addEventListener('DOMContentLoaded', () => {
    // Check login
    if (!AuthManager.requireLogin()) return;

    const user = AuthManager.getUser();

    // Get booking ID from URL
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('bookingId');

    if (!bookingId) {
        alert('Booking ID tidak ditemukan!');
        window.location.href = '/my-bookings.html';
        return;
    }

    // Load booking details
    loadBookingDetails(bookingId);
});

/**
 * Load booking details
 */
async function loadBookingDetails(bookingId) {
    try {
        const response = await APIService.getBookingDetail(bookingId);
        const booking = response.data;

        // Display talent info
        const talent = booking.talent || {};
        const avatar = talent.nama ? talent.nama.charAt(0).toUpperCase() : 'T';

        DOM.$('#talent-info').innerHTML = `
            <div class="talent-avatar">${avatar}</div>
            <div>
                <strong>${talent.nama}</strong>
                <p style="margin-bottom: 0; color: var(--text-secondary);">
                    ${talent.specialty || 'Professional'}
                </p>
                <p style="margin-bottom: 0; color: var(--text-secondary); font-size: var(--font-size-sm);">
                    Booking ID: ${bookingId}
                </p>
            </div>
        `;

        // Store booking info for submission
        document.getElementById('review-form').dataset.bookingId = bookingId;
        document.getElementById('review-form').dataset.talentId = talent.id;
    } catch (error) {
        console.error('Error loading booking:', error);
        UIUtils.showAlert('Gagal memuat detail booking', 'error');
    }
}

/**
 * Set overall rating
 */
function setRating(rating) {
    overallRating = rating;
    
    // Update stars
    DOM.$$('.rating-input .star').forEach((star, index) => {
        if (index + 1 <= rating) {
            DOM.addClass(star, 'active');
        } else {
            DOM.removeClass(star, 'active');
        }
    });

    // Update label
    DOM.$('#rating-label').textContent = ratingLabels[rating];
    DOM.$('#overall-rating').value = rating;
}

/**
 * Set aspect rating
 */
function setAspectRating(aspect, rating) {
    aspectRatings[aspect] = rating;

    // Update stars for this aspect
    const starsContainer = document.querySelector(`.stars[data-aspect="${aspect}"]`);
    const stars = starsContainer.querySelectorAll('.star-small');

    stars.forEach((star, index) => {
        if (index + 1 <= rating) {
            DOM.addClass(star, 'active');
        } else {
            DOM.removeClass(star, 'active');
        }
    });
}

/**
 * Submit review
 */
async function submitReview(e) {
    e.preventDefault();

    // Validation
    if (overallRating === 0) {
        UIUtils.showAlert('Silakan berikan rating keseluruhan!', 'error');
        return;
    }

    const reviewContent = DOM.$('#review-content').value;
    if (reviewContent.length < 20) {
        UIUtils.showAlert('Ulasan minimal 20 karakter!', 'error');
        return;
    }

    const form = e.target;
    const bookingId = form.dataset.bookingId;
    const talentId = form.dataset.talentId;
    const user = AuthManager.getUser();

    try {
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Mengirim...';

        // Prepare review data
        const reviewData = {
            bookingId,
            talentId,
            clientId: user.id,
            rating: overallRating,
            content: reviewContent,
            professionalism: aspectRatings.professionalism || overallRating,
            punctuality: aspectRatings.punctuality || overallRating,
            quality: aspectRatings.quality || overallRating,
            communication: aspectRatings.communication || overallRating,
            recommended: DOM.$('#recommend').checked
        };

        // Call API
        const response = await APIService.submitReview(reviewData);

        UIUtils.showAlert('Review berhasil dikirim! Terima kasih atas feedback Anda.', 'success');

        setTimeout(() => {
            window.location.href = '/my-bookings.html';
        }, 2000);
    } catch (error) {
        UIUtils.showAlert('Gagal mengirim review: ' + error.message, 'error');
        
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = false;
        btn.textContent = 'Kirim Review';
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
