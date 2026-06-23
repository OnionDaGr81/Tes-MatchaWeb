/**
 * Catalog Page - Browse Talents
 */

let allTalents = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    // Check login
    if (!AuthManager.requireLogin()) return;

    // Update navbar greeting
    const user = AuthManager.getUser();
    DOM.$('#nav-greeting').innerHTML = `Halo, <b style="color:var(--primary);">${user.nama?.split(' ')[0] || 'User'}</b>`;

    // Load talents
    loadTalents();

    // Setup search on Enter
    DOM.$('#search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
});

/**
 * Load semua talents dari backend
 */
async function loadTalents() {
    const container = DOM.$('#talents-container');
    
    try {
        // Show skeleton loaders
        showSkeletonLoaders();

        // Simulate small delay for loading state visibility
        await new Promise(resolve => setTimeout(resolve, 300));

        // Call API
        const response = await APIService.getTalents();
        allTalents = response.data || [];

        // Render talents
        renderTalents(allTalents);
    } catch (error) {
        console.error('Error loading talents:', error);
        UIUtils.showAlert('Gagal memuat data talent', 'error');
        container.innerHTML = '<div class="empty-state"><h3>❌ Terjadi kesalahan</h3><p>' + error.message + '</p></div>';
    }
}

/**
 * Show skeleton loading placeholders
 */
function showSkeletonLoaders() {
    const container = DOM.$('#talents-container');
    container.innerHTML = '';
    
    for (let i = 0; i < 6; i++) {
        const skeleton = DOM.createElement('div', 'skeleton-card');
        skeleton.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; margin-bottom: 15px;">
                <div class="skeleton skeleton-avatar"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text short"></div>
            </div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width: 80%;"></div>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <div class="skeleton" style="flex: 1; height: 36px; border-radius: var(--radius-md);"></div>
                <div class="skeleton" style="flex: 2; height: 36px; border-radius: var(--radius-md);"></div>
            </div>
        `;
        container.appendChild(skeleton);
    }
}

/**
 * Render talents ke grid
 */
function renderTalents(talents) {
    const container = DOM.$('#talents-container');
    const emptyState = DOM.$('#empty-state');

    if (!talents || talents.length === 0) {
        container.innerHTML = '';
        DOM.show(emptyState);
        return;
    }

    DOM.hide(emptyState);
    container.innerHTML = '';

    talents.forEach(talent => {
        const card = createTalentCard(talent);
        container.appendChild(card);
    });
}

/**
 * Create talent card element
 */
function createTalentCard(talent) {
    const card = DOM.createElement('div', 'talent-card');

    // Generate avatar (first letter of name)
    const avatar = talent.nama ? talent.nama.charAt(0).toUpperCase() : 'T';
    
    // Calculate average rating
    const rating = talent.rating || 4.5;
    const reviewCount = talent.reviewCount || 0;

    const pricePerHour = talent.pricePerHour || 0;

    card.innerHTML = `
        <div class="talent-header">
            <div class="talent-avatar">${avatar}</div>
            <div class="talent-name">${talent.nama || 'Unknown'}</div>
            <div class="talent-specialty">${talent.specialty || 'Professional'}</div>
        </div>
        <div class="talent-body">
            <div class="talent-info">
                <div class="talent-rating">
                    ${'<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align: text-bottom;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'.repeat(Math.floor(rating))} <span>${rating.toFixed(1)} (${reviewCount} review)</span>
                </div>
            </div>
            
            <div class="talent-price">
                ${UIUtils.formatCurrency(pricePerHour)} / jam
            </div>

            <p class="talent-description">
                ${talent.bio ? UIUtils.truncate(talent.bio, 80) : 'Profesional berpengalaman'}
            </p>

            <div class="talent-footer" style="display: flex; gap: var(--spacing-sm);">
                <button class="btn btn-outline" style="flex: 1;" onclick="viewTalentDetail('${talent.id}')">
                    Lihat Detail
                </button>
                <button class="btn btn-primary" style="flex: 2;" onclick="openBookingModal('${talent.id}')">
                    Pesan
                </button>
            </div>
        </div>
    `;

    return card;
}

async function viewTalentDetail(talentId) {
    const talent = allTalents.find(t => t.id === talentId);
    if (!talent) return;

    const modal = DOM.$('#detail-modal');
    const avatar = talent.nama ? talent.nama.charAt(0).toUpperCase() : 'T';
    const rating = talent.rating || 4.5;
    const reviewCount = talent.reviewCount || 0;

    let bodyHtml = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div class="talent-avatar" style="width: 100px; height: 100px; font-size: 40px; margin: 0 auto 15px auto; border-color: var(--primary); background: rgba(143, 188, 143, 0.1); color: var(--primary);">${avatar}</div>
            <h3 style="color: var(--text-primary); font-size: 24px; margin-bottom: 5px;">${talent.nama}</h3>
            <div style="color: var(--primary); font-weight: 500; text-transform: uppercase; letter-spacing: 1px; font-size: 14px; margin-bottom: 10px;">${talent.specialty || 'Professional'}</div>
            <div class="talent-rating" style="justify-content: center;">
                ${'<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align: text-bottom;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'.repeat(Math.floor(rating))} <span style="color: var(--text-secondary); margin-left: 5px;">${rating.toFixed(1)} (${reviewCount} ulasan)</span>
            </div>
        </div>

        <div style="background: var(--bg-input); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: var(--text-primary); margin-bottom: 10px; font-size: 16px;">Biografi</h4>
            <p style="color: var(--text-secondary); line-height: 1.6;">${talent.bio || 'Talent ini belum menulis biografi, namun siap memberikan layanan profesional terbaik untuk Anda.'}</p>
        </div>
    `;

    try {
        const response = await APIService.getTalentServices(talentId);
        const services = response.data || [];
        
        let servicesHtml = `
        <div style="background: var(--bg-input); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: var(--text-primary); margin-bottom: 15px; font-size: 16px;">Layanan yang Tersedia</h4>
        `;
        
        if (services.length > 0) {
            servicesHtml += '<div style="display: flex; flex-direction: column; gap: 10px;">';
            services.forEach(service => {
                const namaLayanan = service.namaLayanan || service.nama || 'Layanan Tanpa Nama';
                const tarifDasar = service.tarifDasar || service.harga || 0;
                servicesHtml += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px;">
                        <span style="color: var(--text-primary); font-weight: 500;">${namaLayanan}</span>
                        <span style="color: var(--primary); font-weight: bold;">${UIUtils.formatCurrency(tarifDasar)}</span>
                    </div>
                `;
            });
            servicesHtml += '</div>';
        } else {
            servicesHtml += `<p style="color: var(--text-secondary); font-style: italic;">Belum ada layanan yang ditambahkan.</p>`;
        }
        servicesHtml += `</div>`;
        bodyHtml += servicesHtml;
    } catch (e) {
        console.error('Error fetching services:', e);
        bodyHtml += `
        <div style="background: var(--bg-input); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: var(--text-primary); margin-bottom: 10px; font-size: 16px;">Layanan yang Tersedia</h4>
            <p style="color: var(--text-secondary);">Gagal memuat layanan.</p>
        </div>
        `;
    }

    bodyHtml += `
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 20px;">
            <div>
                <span style="color: var(--text-secondary); font-size: 14px;">Tarif Layanan Dasar</span>
                <div style="color: var(--primary); font-size: 20px; font-weight: bold;">${UIUtils.formatCurrency(talent.pricePerHour || 0)} <span style="font-size: 14px; font-weight: normal; color: var(--text-secondary);">/ jam</span></div>
            </div>
            <button class="btn btn-primary" onclick="closeDetailModal(); openBookingModal('${talent.id}')">Pesan Sekarang</button>
        </div>
    `;

    DOM.$('#detail-modal-body').innerHTML = bodyHtml;
    DOM.addClass(modal, 'active');
}

/**
 * Close detail modal
 */
function closeDetailModal() {
    const modal = DOM.$('#detail-modal');
    DOM.removeClass(modal, 'active');
}

/**
 * Open booking modal
 */
async function openBookingModal(talentId) {
    const talent = allTalents.find(t => t.id === talentId);
    if (!talent) return;

    const modal = DOM.$('#booking-modal');
    DOM.$('#modal-talent-name').textContent = `Pesan ${talent.nama}`;

    try {
        // Load talent's services
        const response = await APIService.getTalentServices(talentId);
        const services = response.data || [];

        let modalBody = `
            <div class="form-group">
                <label>Pilih Layanan</label>
                <select id="service-select">
                    <option value="">-- Pilih Layanan --</option>
        `;

        services.forEach(service => {
            const namaLayanan = service.namaLayanan || service.nama || 'Layanan Tanpa Nama';
            const tarifDasar = service.tarifDasar || service.harga || 0;
            
            modalBody += `
                <option value="${service.id}">
                    ${namaLayanan} - ${UIUtils.formatCurrency(tarifDasar)}
                </option>
            `;
        });

        modalBody += `
                </select>
            </div>

            <div class="form-group">
                <label>Tanggal</label>
                <input type="date" id="booking-date" min="${new Date().toISOString().split('T')[0]}">
            </div>

            <div class="form-group">
                <label>Waktu Mulai</label>
                <input type="time" id="booking-time">
            </div>

            <div class="form-group">
                <label>Durasi (jam)</label>
                <input type="number" id="booking-duration" min="1" value="1">
            </div>

            <div class="form-group">
                <label>Catatan (opsional)</label>
                <textarea id="booking-notes" placeholder="Tulis permintaan khusus Anda..."></textarea>
            </div>

            <button class="btn btn-primary btn-block" onclick="submitBooking('${talentId}')">
                Lanjut ke Pembayaran
            </button>
        `;

        DOM.$('#modal-body').innerHTML = modalBody;
        DOM.addClass(modal, 'active');
    } catch (error) {
        UIUtils.showAlert('Gagal memuat layanan: ' + error.message, 'error');
    }
}

/**
 * Close booking modal
 */
function closeBookingModal() {
    const modal = DOM.$('#booking-modal');
    DOM.removeClass(modal, 'active');
}

/**
 * Submit booking
 */
async function submitBooking(talentId) {
    const serviceId = DOM.$('#service-select').value;
    const bookingDate = DOM.$('#booking-date').value;
    const bookingTime = DOM.$('#booking-time').value;
    const duration = DOM.$('#booking-duration').value;
    const notes = DOM.$('#booking-notes').value;

    if (!serviceId || !bookingDate || !bookingTime || !duration) {
        UIUtils.showAlert('Semua field harus diisi!', 'error');
        return;
    }

    if (!AuthManager.requireLogin()) return;

    try {
        const user = AuthManager.getUser();
        
        // Add loading state to button
        const btn = document.querySelector('#booking-modal .btn-primary.btn-block');
        if (btn) btn.classList.add('btn-loading');

        // Simulate network delay for loading effect
        await new Promise(r => setTimeout(r, 600));
        
        // Calculate waktuSelesai manually to avoid timezone shift
        let startTimeStr = `${bookingDate}T${bookingTime}`;
        if (bookingTime.split(':').length === 2) {
            startTimeStr += ':00';
        }
        
        const startDateTime = new Date(startTimeStr);
        if (isNaN(startDateTime.getTime())) {
            UIUtils.showAlert('Format tanggal atau waktu tidak valid!', 'error');
            if (btn) btn.classList.remove('btn-loading');
            return;
        }

        const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60 * 60 * 1000);
        
        const endY = endDateTime.getFullYear();
        const endM = String(endDateTime.getMonth() + 1).padStart(2, '0');
        const endD = String(endDateTime.getDate()).padStart(2, '0');
        const endH = String(endDateTime.getHours()).padStart(2, '0');
        const endMin = String(endDateTime.getMinutes()).padStart(2, '0');
        const waktuSelesaiStr = `${endY}-${endM}-${endD}T${endH}:${endMin}:00`;

        // Create booking object
        const bookingData = {
            clientId: user.id,
            talentId: talentId,
            serviceId: serviceId,
            waktuMulai: startTimeStr,
            waktuSelesai: waktuSelesaiStr,
            status: 'pending'
        };

        // Call API
        const response = await APIService.createBooking(bookingData);

        UIUtils.showAlert('Booking berhasil dibuat! Lanjut ke pembayaran.', 'success');
        closeBookingModal();

        // Redirect ke payment page
        setTimeout(() => {
            window.location.href = `/payment.html?bookingId=${response.data.id}`;
        }, 1500);
    } catch (error) {
        UIUtils.showAlert('Gagal membuat booking: ' + error.message, 'error');
        const btn = document.querySelector('#booking-modal .btn-primary.btn-block');
        if (btn) btn.classList.remove('btn-loading');
    }
}

/**
 * Perform search
 */
async function performSearch() {
    const keyword = DOM.$('#search-input').value;

    try {
        showSkeletonLoaders();
        // Simulate small delay for loading state visibility
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const response = await APIService.getTalents(keyword);
        allTalents = response.data || [];
        renderTalents(allTalents);
        currentFilter = 'all';
        updateFilterUI();
    } catch (error) {
        UIUtils.showAlert('Pencarian gagal: ' + error.message, 'error');
    }
}

/**
 * Filter talents
 */
function filterTalents(filterType) {
    currentFilter = filterType;
    updateFilterUI();

    let filtered = allTalents;

    switch (filterType) {
        case 'rating':
            filtered = allTalents.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        case 'price-low':
            filtered = allTalents.sort((a, b) => (a.pricePerHour || 0) - (b.pricePerHour || 0));
            break;
        case 'price-high':
            filtered = allTalents.sort((a, b) => (b.pricePerHour || 0) - (a.pricePerHour || 0));
            break;
    }

    renderTalents(filtered);
}

/**
 * Update filter UI
 */
function updateFilterUI() {
    DOM.$$('.filter-chip').forEach(chip => {
        const filter = chip.getAttribute('data-filter');
        if (filter === currentFilter) {
            DOM.addClass(chip, 'active');
        } else {
            DOM.removeClass(chip, 'active');
        }
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
