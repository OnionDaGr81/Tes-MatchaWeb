/**
 * Login Page - Handling login & register forms
 */

document.addEventListener('DOMContentLoaded', () => {
    // Jika user sudah login, redirect ke dashboard
    if (AuthManager.isLoggedIn()) {
        const user = AuthManager.getUser();
        window.location.href = '/app.html';
    }
});

/**
 * Switch antara form login dan register
 */
function switchForm(type) {
    DOM.$('#alert-box').style.display = 'none';
    
    if (type === 'login') {
        DOM.show(DOM.$('#login-form'));
        DOM.hide(DOM.$('#register-form'));
        DOM.addClass(DOM.$('#btn-login'), 'active');
        DOM.removeClass(DOM.$('#btn-register'), 'active');
    } else {
        DOM.hide(DOM.$('#login-form'));
        DOM.show(DOM.$('#register-form'));
        DOM.removeClass(DOM.$('#btn-login'), 'active');
        DOM.addClass(DOM.$('#btn-register'), 'active');
    }
}

/**
 * Handle Login submission
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const email = DOM.$('#login-email').value;
    const password = DOM.$('#login-password').value;

    // Validasi input
    if (!email || !password) {
        UIUtils.showAlert('Email dan password harus diisi!', 'error');
        return;
    }

    if (!UIUtils.validateEmail(email)) {
        UIUtils.showAlert('Format email tidak valid!', 'error');
        return;
    }

    try {
        // Tampilkan loading
        const btn = DOM.$('#login-form button[type="submit"]');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Sedang masuk...';

        // Call API
        const response = await APIService.login(email, password);
        
        // Simpan user data
        AuthManager.setUser(response.user || response.data);
        
        UIUtils.showAlert('Berhasil masuk! Mengalihkan...', 'success');
        
        // Redirect ke dashboard
        setTimeout(() => {
            window.location.href = '/app.html';
        }, 1500);
    } catch (error) {
        UIUtils.showAlert(error.message || 'Gagal masuk. Periksa email dan password.', 'error');
        
        // Restore button
        const btn = DOM.$('#login-form button[type="submit"]');
        btn.disabled = false;
        btn.textContent = 'Masuk ke Akun';
    }
}

/**
 * Handle Register submission
 */
async function handleRegister(e) {
    e.preventDefault();

    const nama = DOM.$('#reg-nama').value;
    const email = DOM.$('#reg-email').value;
    const password = DOM.$('#reg-password').value;
    const noTelp = DOM.$('#reg-notelp').value;
    const role = DOM.$('#reg-role').value;

    // Validasi
    if (!nama || !email || !password || !noTelp || !role) {
        UIUtils.showAlert('Semua field harus diisi!', 'error');
        return;
    }

    if (!UIUtils.validateEmail(email)) {
        UIUtils.showAlert('Format email tidak valid!', 'error');
        return;
    }

    if (!UIUtils.validatePassword(password)) {
        UIUtils.showAlert('Password minimal 6 karakter!', 'error');
        return;
    }

    try {
        // Tampilkan loading
        const btn = DOM.$('#register-form button[type="submit"]');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Sedang membuat akun...';

        // Call API
        const response = await APIService.register({
            nama,
            email,
            password,
            noTelp,
            role
        });

        UIUtils.showAlert('Pendaftaran sukses! Silakan masuk.', 'success');
        
        // Clear form
        DOM.$('#register-form').reset();
        
        // Switch ke login
        setTimeout(() => switchForm('login'), 1500);
    } catch (error) {
        UIUtils.showAlert(error.message || 'Gagal mendaftar. Email mungkin sudah dipakai.', 'error');
        
        // Restore button
        const btn = DOM.$('#register-form button[type="submit"]');
        btn.disabled = false;
        btn.textContent = 'Buat Akun Baru';
    }
}
