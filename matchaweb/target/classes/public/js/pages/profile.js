/**
 * Profile Page - Manage user profile
 */

let currentUser = null;
let userAddresses = [];
let userServices = [];
let editingServiceId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Check login
    if (!AuthManager.requireLogin()) return;

    currentUser = AuthManager.getUser();

    // Load user profile
    loadUserProfile();

    // Show services tab only for Talent
    if (AuthManager.isTalent()) {
        DOM.$('#services-tab').style.display = 'block';
    }
});

/**
 * Load user profile from API
 */
async function loadUserProfile() {
    try {
        const response = await APIService.getUserProfile(currentUser.id);
        const userData = response.data;

        // Update profile header
        const avatar = userData.nama ? userData.nama.charAt(0).toUpperCase() : '👤';
        DOM.$('#profile-avatar').textContent = avatar;
        DOM.$('#profile-name').textContent = userData.nama || 'User';
        DOM.$('#profile-role').textContent = `${userData.role === 'talent' ? '🎯 Talent' : '👤 Client'}`;
        DOM.$('#profile-email').textContent = userData.email || '-';
        DOM.$('#profile-phone').textContent = userData.noTelp || '-';

        // Fill personal form
        DOM.$('#nama').value = userData.nama || '';
        DOM.$('#email').value = userData.email || '';
        DOM.$('#noTelp').value = userData.noTelp || '';
        DOM.$('#bio').value = userData.bio || '';
        DOM.$('#birthDate').value = userData.birthDate || '';

        // Load addresses and services
        await Promise.all([
            loadAddresses(),
            loadServices()
        ]);
    } catch (error) {
        console.error('Error loading profile:', error);
        UIUtils.showAlert('Gagal memuat profil', 'error');
    }
}

/**
 * Switch between tabs
 */
function switchTab(tabName) {
    // Hide all tabs
    DOM.$$('.tab-content').forEach(tab => {
        DOM.removeClass(tab, 'active');
    });

    // Remove active class from all tab buttons
    DOM.$$('.profile-tab').forEach(btn => {
        DOM.removeClass(btn, 'active');
    });

    // Show selected tab
    const tabContent = DOM.$(`#${tabName}`);
    if (tabContent) {
        DOM.addClass(tabContent, 'active');
    }

    // Add active class to clicked button
    event.target.classList.add('active');
}

/**
 * Save personal info
 */
async function savePersonalInfo(e) {
    e.preventDefault();

    const nama = DOM.$('#nama').value;
    const email = DOM.$('#email').value;
    const noTelp = DOM.$('#noTelp').value;
    const bio = DOM.$('#bio').value;
    const birthDate = DOM.$('#birthDate').value;

    if (!nama || !noTelp) {
        UIUtils.showAlert('Nama dan nomor telepon harus diisi!', 'error');
        return;
    }

    try {
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Menyimpan...';

        const response = await APIService.updateUserProfile(currentUser.id, {
            nama,
            email,
            noTelp
        });

        // Update localStorage
        const updatedUser = { ...currentUser, ...response.data };
        AuthManager.setUser(updatedUser);
        currentUser = updatedUser;

        UIUtils.showAlert('Profil berhasil diperbarui!', 'success');

        btn.disabled = false;
        btn.textContent = 'Simpan Perubahan';
    } catch (error) {
        UIUtils.showAlert('Gagal menyimpan profil: ' + error.message, 'error');
        
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = false;
        btn.textContent = 'Simpan Perubahan';
    }
}

/**
 * Load addresses
 */
async function loadAddresses() {
    const container = DOM.$('#address-list');

    try {
        // In a real app, call API to get addresses
        // For now, mock data
        userAddresses = [
            {
                id: 1,
                label: 'Rumah',
                address: 'Jl. Merdeka No. 123, RT 01 RW 02',
                city: 'Jakarta',
                province: 'DKI Jakarta',
                zip: '12345',
                isDefault: true
            }
        ];

        if (userAddresses.length === 0) {
            container.innerHTML = '<div class="empty-message">Tidak ada alamat</div>';
            return;
        }

        container.innerHTML = '';
        userAddresses.forEach(addr => {
            const item = DOM.createElement('div', 'address-item');
            item.innerHTML = `
                <div>
                    <strong>${addr.label}</strong>
                    <p style="margin-bottom: var(--spacing-xs); color: var(--text-secondary);">${addr.address}</p>
                    <p style="margin-bottom: 0; color: var(--text-secondary);">${addr.city}, ${addr.province} ${addr.zip}</p>
                    ${addr.isDefault ? '<span class="badge badge-success" style="margin-top: var(--spacing-xs);">Alamat Utama</span>' : ''}
                </div>
                <div>
                    <button type="button" class="btn btn-sm btn-secondary" onclick="setDefaultAddress(${addr.id})">Set Utama</button>
                    <button type="button" class="btn btn-sm btn-danger" onclick="deleteAddress(${addr.id})">Hapus</button>
                </div>
            `;
            container.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading addresses:', error);
    }
}

/**
 * Load services (Talent only)
 */
async function loadServices() {
    if (!AuthManager.isTalent()) return;

    const container = DOM.$('#services-list');

    try {
        const response = await APIService.getTalentServices(currentUser.id);
        userServices = response.data || [];
        renderServices();
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

/**
 * Render services ke DOM
 */
function renderServices() {
    const container = DOM.$('#services-list');
    
    if (userServices.length === 0) {
        container.innerHTML = '<div class="empty-message">Tidak ada layanan</div>';
        return;
    }

    container.innerHTML = '';
    userServices.forEach(service => {
        const item = DOM.createElement('div', 'card');
        const namaLayanan = service.namaLayanan || service.nama || 'Layanan Tanpa Nama';
        const deskripsi = service.deskripsi || 'Tidak ada deskripsi';
        const tarifDasar = service.tarifDasar || service.harga || 0;
        const durasi = service.durasi || 60;

        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-md);">
                <div>
                    <strong>${namaLayanan}</strong>
                    <p style="margin-bottom: 0; font-size: var(--font-size-sm);">${UIUtils.truncate(deskripsi, 50)}</p>
                </div>
                <div style="text-align: right;">
                    <strong style="color: var(--primary);">${UIUtils.formatCurrency(tarifDasar)}</strong>
                    <p style="margin-bottom: 0; font-size: var(--font-size-sm);">${durasi} menit</p>
                </div>
            </div>
            <div style="display: flex; gap: var(--spacing-sm);">
                <button type="button" class="btn btn-sm btn-secondary" onclick="editService('${service.id}')">Edit</button>
                <button type="button" class="btn btn-sm btn-danger" onclick="deleteService('${service.id}')">Hapus</button>
            </div>
        `;
        container.appendChild(item);
    });
}

/**
 * Open add address modal
 */
function openAddAddressModal() {
    DOM.addClass(DOM.$('#address-modal'), 'active');
}

/**
 * Close address modal
 */
function closeAddressModal() {
    DOM.removeClass(DOM.$('#address-modal'), 'active');
    DOM.$('#address-form').reset();
}

/**
 * Save address
 */
async function saveAddress(e) {
    e.preventDefault();

    const label = DOM.$('#address-label').value;
    const address = DOM.$('#address-full').value;
    const city = DOM.$('#address-city').value;
    const province = DOM.$('#address-province').value;
    const zip = DOM.$('#address-zip').value;

    try {
        // In a real app, call API to save address
        // await APIService.saveAddress({ label, address, city, province, zip });

        UIUtils.showAlert('Alamat berhasil ditambahkan!', 'success');
        closeAddressModal();
        await loadAddresses();
    } catch (error) {
        UIUtils.showAlert('Gagal menyimpan alamat: ' + error.message, 'error');
    }
}

/**
 * Set default address
 */
async function setDefaultAddress(addressId) {
    try {
        // In a real app, call API
        // await APIService.setDefaultAddress(addressId);

        UIUtils.showAlert('Alamat berhasil diatur sebagai utama!', 'success');
        await loadAddresses();
    } catch (error) {
        UIUtils.showAlert('Gagal mengatur alamat utama', 'error');
    }
}

/**
 * Delete address
 */
async function deleteAddress(addressId) {
    if (!confirm('Hapus alamat ini?')) return;

    try {
        // In a real app, call API
        // await APIService.deleteAddress(addressId);

        UIUtils.showAlert('Alamat berhasil dihapus!', 'success');
        await loadAddresses();
    } catch (error) {
        UIUtils.showAlert('Gagal menghapus alamat', 'error');
    }
}

/**
 * Change password
 */
async function changePassword(e) {
    e.preventDefault();

    const oldPassword = DOM.$('#old-password').value;
    const newPassword = DOM.$('#new-password').value;
    const confirmPassword = DOM.$('#confirm-password').value;

    if (!oldPassword || !newPassword || !confirmPassword) {
        UIUtils.showAlert('Semua field harus diisi!', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        UIUtils.showAlert('Password baru tidak cocok!', 'error');
        return;
    }

    if (!UIUtils.validatePassword(newPassword)) {
        UIUtils.showAlert('Password minimal 6 karakter!', 'error');
        return;
    }

    try {
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Mengubah...';

        // In a real app, call API to change password
        // await APIService.changePassword(oldPassword, newPassword);

        UIUtils.showAlert('Password berhasil diubah!', 'success');
        e.target.reset();

        btn.disabled = false;
        btn.textContent = 'Ubah Password';
    } catch (error) {
        UIUtils.showAlert('Gagal mengubah password: ' + error.message, 'error');
        
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = false;
        btn.textContent = 'Ubah Password';
    }
}

/**
 * Open add service modal (Talent only)
 */
function openAddServiceModal() {
    editingServiceId = null;
    DOM.$('#service-form').reset();
    DOM.$('#service-modal h2').textContent = 'Tambah Layanan';
    DOM.addClass(DOM.$('#service-modal'), 'active');
}

/**
 * Open edit service modal
 */
function editService(serviceId) {
    const service = userServices.find(s => s.id == serviceId);
    if (!service) return;

    editingServiceId = service.id;
    DOM.$('#service-name').value = service.namaLayanan || service.nama || '';
    DOM.$('#service-description').value = service.deskripsi || '';
    DOM.$('#service-price').value = service.tarifDasar || service.harga || 0;
    DOM.$('#service-duration').value = service.durasi || 60;
    
    DOM.$('#service-modal h2').textContent = 'Edit Layanan';
    DOM.addClass(DOM.$('#service-modal'), 'active');
}

/**
 * Close service modal
 */
function closeServiceModal() {
    DOM.removeClass(DOM.$('#service-modal'), 'active');
    DOM.$('#service-form').reset();
    editingServiceId = null;
}

/**
 * Save service
 */
async function saveService(e) {
    e.preventDefault();

    const nama = DOM.$('#service-name').value;
    const deskripsi = DOM.$('#service-description').value;
    const harga = parseInt(DOM.$('#service-price').value);
    const durasi = parseInt(DOM.$('#service-duration').value);

    if (!nama || !deskripsi || !harga || !durasi) {
        UIUtils.showAlert('Semua field harus diisi!', 'error');
        return;
    }

    try {
        if (editingServiceId) {
            // Mock edit di local memory
            const idx = userServices.findIndex(s => s.id == editingServiceId);
            if (idx !== -1) {
                userServices[idx].namaLayanan = nama;
                userServices[idx].deskripsi = deskripsi;
                userServices[idx].tarifDasar = harga;
                userServices[idx].durasi = durasi;
            }
            UIUtils.showAlert('Layanan berhasil diperbarui!', 'success');
        } else {
            // Mock add di local memory
            const newId = 'MOCK-' + Date.now();
            userServices.push({
                id: newId,
                talentId: currentUser.id,
                namaLayanan: nama,
                deskripsi: deskripsi,
                tarifDasar: harga,
                durasi: durasi
            });
            UIUtils.showAlert('Layanan berhasil ditambahkan!', 'success');
        }

        closeServiceModal();
        renderServices();
    } catch (error) {
        UIUtils.showAlert('Gagal menyimpan layanan: ' + error.message, 'error');
    }
}

/**
 * Delete service
 */
async function deleteService(serviceId) {
    if (!confirm('Hapus layanan ini?')) return;

    try {
        // Mock delete di local memory
        userServices = userServices.filter(s => s.id != serviceId);
        UIUtils.showAlert('Layanan berhasil dihapus!', 'success');
        renderServices();
    } catch (error) {
        UIUtils.showAlert('Gagal menghapus layanan', 'error');
    }
}

/**
 * Delete account
 */
function deleteAccount() {
    if (!confirm('Anda yakin? Akun akan dihapus selamanya!')) return;
    if (!confirm('Tindakan ini tidak dapat dibatalkan. Lanjutkan?')) return;

    const password = prompt('Masukkan password untuk konfirmasi:');
    if (!password) return;

    // In a real app, call API to delete account
    // API should verify password and delete account

    UIUtils.showAlert('Akun berhasil dihapus', 'success');
    setTimeout(() => {
        AuthManager.logout();
        window.location.href = '/login.html';
    }, 2000);
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
