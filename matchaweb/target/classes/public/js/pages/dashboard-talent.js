/**
 * Dashboard Talent Page
 */

let talentData = null;
let upcomingBookings = [];

document.addEventListener('DOMContentLoaded', () => {
    // Check login
    if (!AuthManager.requireLogin()) return;

    const user = AuthManager.getUser();

    // Check if user is Talent, otherwise redirect
    if (!AuthManager.isTalent()) {
        alert('Halaman ini hanya untuk Talent!');
        window.location.href = '/';
        return;
    }

    // Update navbar
    DOM.$('#nav-greeting').innerHTML = `Halo, <b style="color:var(--primary);">${user.nama?.split(' ')[0] || 'Talent'}</b>!`;

    // Load data
    loadTalentDashboard();
});

/**
 * Load semua data dashboard talent
 */
async function loadTalentDashboard() {
    const user = AuthManager.getUser();

    try {
        // Show skeletons
        showSkeletonLoaders();
        
        // Simulate small delay for loading state visibility
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Load talent profile, bookings, dan reviews
        const [profileRes, bookingsRes, reviewsRes, servicesRes] = await Promise.all([
            APIService.getUserProfile(user.id).catch(() => ({ data: {} })),
            APIService.getBookings(user.id).catch(() => ({ data: [] })),
            APIService.getTalentReviews(user.id).catch(() => ({ data: [] })),
            APIService.getTalentServices(user.id).catch(() => ({ data: [] }))
        ]);

        talentData = profileRes.data || {};
        const services = servicesRes.data || [];
        
        upcomingBookings = (bookingsRes.data || []).map(b => {
            const service = services.find(s => s.id === b.serviceId) || {};
            const tarifDasar = service.tarifDasar || service.harga || 0;
            // Provide values that were previously missing
            return {
                ...b,
                bookingDate: b.waktuMulai,
                totalAmount: tarifDasar,
                status: b.status ? b.status.toUpperCase() : 'UNKNOWN'
            };
        });

        const reviews = reviewsRes.data || [];
        
        talentData.rating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + (r.score || 0), 0) / reviews.length : 0;

        // Update stats
        updateStats();
        renderUpcomingBookings(upcomingBookings);
        renderEarningsChart(upcomingBookings);
        renderServices(services);
        renderReviews(reviewsRes.data || []);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        UIUtils.showAlert('Gagal memuat dashboard', 'error');
    }
}

/**
 * Show skeleton loaders
 */
function showSkeletonLoaders() {
    const upcomingContainer = DOM.$('#upcoming-bookings');
    upcomingContainer.innerHTML = '';
    for(let i=0; i<3; i++) {
        const skel = DOM.createElement('div', 'booking-item');
        skel.style.borderLeftColor = 'var(--border)';
        skel.innerHTML = `
            <div class="booking-info" style="width: 100%;">
                <div class="skeleton skeleton-title" style="width: 120px;"></div>
                <div class="skeleton skeleton-text short"></div>
                <div class="skeleton skeleton-text" style="width: 70%;"></div>
                <div class="skeleton" style="width: 80px; height: 20px; border-radius: 10px; margin-top: 5px;"></div>
            </div>
        `;
        upcomingContainer.appendChild(skel);
    }
    
    const servicesContainer = DOM.$('#services-list');
    servicesContainer.innerHTML = '';
    for(let i=0; i<2; i++) {
        const skel = DOM.createElement('div', 'service-item');
        skel.innerHTML = `
            <div style="flex: 1;">
                <div class="skeleton skeleton-title" style="width: 150px;"></div>
                <div class="skeleton skeleton-text" style="width: 80%;"></div>
            </div>
            <div style="width: 80px; text-align: right;">
                <div class="skeleton skeleton-text short" style="margin-left: auto;"></div>
                <div class="skeleton skeleton-text" style="width: 50px; margin-left: auto;"></div>
            </div>
        `;
        servicesContainer.appendChild(skel);
    }
    
    const reviewsContainer = DOM.$('#reviews-list');
    reviewsContainer.innerHTML = '';
    for(let i=0; i<2; i++) {
        const skel = DOM.createElement('div', 'card');
        skel.style.marginBottom = 'var(--spacing-md)';
        skel.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-md);">
                <div class="skeleton skeleton-text short" style="width: 100px;"></div>
                <div class="skeleton" style="width: 60px; height: 14px;"></div>
            </div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width: 60%;"></div>
            <div class="skeleton skeleton-text short" style="margin-top: 10px;"></div>
        `;
        reviewsContainer.appendChild(skel);
    }
}

/**
 * Update stat cards
 */
function updateStats() {
    const user = AuthManager.getUser();

    // Count bookings by status
    const pendingCount = upcomingBookings.filter(b => b.status === 'PENDING').length;
    const confirmedCount = upcomingBookings.filter(b => b.status === 'CONFIRMED').length;

    // Calculate total earnings
    const totalEarnings = upcomingBookings
        .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // Get average rating
    const avgRating = talentData?.rating || 0;

    DOM.$('#pending-count').textContent = pendingCount;
    DOM.$('#confirmed-count').textContent = confirmedCount;
    DOM.$('#total-earnings').textContent = UIUtils.formatCurrency(totalEarnings);
    DOM.$('#avg-rating').textContent = avgRating.toFixed(1);
}

/**
 * Render upcoming bookings
 */
function renderUpcomingBookings(bookings) {
    const container = DOM.$('#upcoming-bookings');

    const upcoming = bookings
        .filter(b => new Date(b.bookingDate) > new Date())
        .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate))
        .slice(0, 5);

    if (upcoming.length === 0) {
        container.innerHTML = '<div class="empty-message">Tidak ada pesanan mendatang</div>';
        return;
    }

    container.innerHTML = '';
    upcoming.forEach(booking => {
        const item = DOM.createElement('div', 'booking-item');
        
        const statusColor = {
            'pending': '#ffc107',
            'paid': '#17a2b8',
            'confirmed': '#8fbc8f',
            'completed': '#8fbc8f'
        }[booking.status.toLowerCase()] || '#a0a0a0';

        let actionsHTML = '';
        if (booking.status.toLowerCase() === 'paid' || booking.status.toLowerCase() === 'pending') {
            actionsHTML = `
                <div class="booking-actions">
                    <button class="btn btn-sm btn-primary" onclick="approveBooking('${booking.id}', this)">
                        Setujui
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="rejectBooking('${booking.id}', this)">
                        Tolak
                    </button>
                </div>
            `;
        }

        item.style.borderLeftColor = statusColor;
        item.innerHTML = `
            <div class="booking-info">
                <h4>${booking.clientName || 'Client'}</h4>
                <p><svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align: text-bottom;"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg> ${UIUtils.formatDate(booking.waktuMulai)}</p>
                <p><svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align: text-bottom;"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg> ${booking.duration || 1} jam - ${UIUtils.formatCurrency(booking.totalAmount || 0)}</p>
                <span class="badge badge-info">${booking.status}</span>
            </div>
            ${actionsHTML}
        `;

        container.appendChild(item);
    });
}

/**
 * Render earnings chart
 */
function renderEarningsChart(bookings) {
    const container = DOM.$('#earnings-chart');

    // Calculate earnings for last 7 days
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const earnings = new Array(7).fill(0);

    const today = new Date();
    bookings.forEach(booking => {
        if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
            const bookingDate = new Date(booking.bookingDate);
            const dayDiff = Math.floor((today - bookingDate) / (1000 * 60 * 60 * 24));
            
            if (dayDiff >= 0 && dayDiff < 7) {
                const dayIndex = 6 - dayDiff;
                earnings[dayIndex] += booking.totalAmount || 0;
            }
        }
    });

    const maxEarnings = Math.max(...earnings, 1);
    
    container.innerHTML = '';
    earnings.forEach((earning, index) => {
        const percentage = (earning / maxEarnings) * 100;
        const bar = DOM.createElement('div', 'bar');
        bar.style.height = percentage + '%';
        bar.innerHTML = `<span style="font-size: 10px;">${UIUtils.formatCurrency(earning).split(',')[0]}</span><small>${days[index]}</small>`;
        container.appendChild(bar);
    });
}

/**
 * Render services
 */
async function renderServices(servicesData) {
    const user = AuthManager.getUser();
    const container = DOM.$('#services-list');

    try {
        const services = servicesData || [];

        if (services.length === 0) {
            container.innerHTML = '<div class="empty-message">Tidak ada layanan</div>';
            return;
        }

        container.innerHTML = '';
        services.forEach(service => {
            const item = DOM.createElement('div', 'service-item');
            const namaLayanan = service.namaLayanan || service.nama || 'Layanan Tanpa Nama';
            const tarifDasar = service.tarifDasar || service.harga || 0;
            
            item.innerHTML = `
                <div>
                    <h4>${namaLayanan}</h4>
                    <p>${UIUtils.truncate(service.deskripsi || '', 50)}</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: bold; color: var(--primary);">${UIUtils.formatCurrency(tarifDasar)}</div>
                    <small style="color: var(--text-secondary);">${service.durasi || 60} menit</small>
                </div>
            `;
            container.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

/**
 * Render reviews
 */
function renderReviews(reviews) {
    const container = DOM.$('#reviews-list');

    const recent = reviews.slice(0, 3);

    if (recent.length === 0) {
        container.innerHTML = '<div class="empty-message">Belum ada review</div>';
        return;
    }

    container.innerHTML = '';
    recent.forEach(review => {
        const item = DOM.createElement('div', 'card');
        item.style.marginBottom = 'var(--spacing-md)';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-md);">
                <strong>${review.clientName || 'Anonymous'}</strong>
                <span style="color: #ffc107;">
                    ${'<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align: text-bottom;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'.repeat(review.score || 0)}
                </span>
            </div>
            <p style="margin-bottom: 0;">${UIUtils.truncate(review.comment || '', 100)}</p>
            <small style="color: var(--text-secondary);">
                ${review.createdAt ? UIUtils.formatDate(review.createdAt) : ''}
            </small>
        `;
        container.appendChild(item);
    });
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
        loadTalentDashboard();
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
        loadTalentDashboard();
    } catch (error) {
        UIUtils.showAlert('Gagal menolak pesanan', 'error');
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
