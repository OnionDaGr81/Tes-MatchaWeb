/**
 * Reviews List Page - Shows list of reviews for current user
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check login
    if (!AuthManager.requireLogin()) return;

    const user = AuthManager.getUser();

    // Set greeting
    DOM.$('#nav-greeting').textContent = `Halo, ${user.nama.split(' ')[0]}!`;

    // Render sidebar
    const sidebarContainer = DOM.$('#sidebar-nav-container');
    if (user.role && user.role.toLowerCase() === 'talent') {
        sidebarContainer.innerHTML = `
            <div class="sidebar-link" onclick="window.location.href='/dashboard-talent.html'">Dashboard</div>
            <div class="sidebar-link" onclick="window.location.href='/my-bookings.html'">Pesanan Saya</div>
            <div class="sidebar-link" onclick="window.location.href='/notifications.html'">Notifikasi</div>
            <div class="sidebar-link" onclick="window.location.href='/profile.html'">Profil & Layanan</div>
            <div class="sidebar-link active" onclick="window.location.href='/reviews-list.html'">Ulasan</div>
        `;
    } else {
        sidebarContainer.innerHTML = `
            <div class="sidebar-link" onclick="window.location.href='/dashboard-client.html'">Dashboard</div>
            <div class="sidebar-link" onclick="window.location.href='/catalog.html'">Katalog Talent</div>
            <div class="sidebar-link" onclick="window.location.href='/my-bookings.html'">Booking Saya</div>
            <div class="sidebar-link" onclick="window.location.href='/notifications.html'">Notifikasi</div>
            <div class="sidebar-link" onclick="window.location.href='/profile.html'">Profil</div>
            <div class="sidebar-link active" onclick="window.location.href='/reviews-list.html'">Ulasan</div>
        `;
    }

    // Load reviews
    loadReviews(user);
});

async function loadReviews(user) {
    const container = DOM.$('#reviews-list-container');
    container.innerHTML = '<div class="empty-message">Memuat ulasan...</div>';

    try {
        let reviews = [];
        if (user.role && user.role.toLowerCase() === 'talent') {
            const response = await APIService.getTalentReviews(user.id);
            reviews = response.data || [];
        } else {
            const response = await APIService.getClientReviews(user.id);
            reviews = response.data || [];
        }

        if (reviews.length === 0) {
            container.innerHTML = '<div class="empty-message">Belum ada ulasan saat ini.</div>';
            return;
        }

        renderReviews(reviews, container);
    } catch (error) {
        console.error('Error loading reviews:', error);
        container.innerHTML = '<div class="empty-message" style="color: var(--danger);">Gagal memuat ulasan. Silakan coba lagi nanti.</div>';
    }
}

function renderReviews(reviews, container) {
    container.innerHTML = '';

    reviews.forEach(review => {
        // Generate stars
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= review.score) {
                starsHtml += '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
            } else {
                starsHtml += '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
            }
        }

        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <div class="review-header">
                <div class="review-meta">Booking ID: ${review.bookingId}</div>
                <div class="review-rating">${starsHtml}</div>
            </div>
            <div class="review-comment">"${review.comment || 'Tidak ada komentar'}"</div>
        `;
        container.appendChild(card);
    });
}
