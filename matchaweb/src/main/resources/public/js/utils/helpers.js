/**
 * Auth Utility - Mengelola session user
 */

class AuthManager {
    static STORAGE_KEY = 'matcha_user';
    static TOKEN_KEY = 'matcha_token';

    /**
     * Simpan data user ke localStorage setelah login
     */
    static setUser(user) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    }

    /**
     * Ambil data user dari localStorage
     */
    static getUser() {
        const user = localStorage.getItem(this.STORAGE_KEY);
        return user ? JSON.parse(user) : null;
    }

    /**
     * Cek apakah user sudah login
     */
    static isLoggedIn() {
        return this.getUser() !== null;
    }

    /**
     * Logout - hapus semua session data
     */
    static logout() {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.TOKEN_KEY);
    }

    /**
     * Redirect ke login jika belum login
     */
    static requireLogin() {
        if (!this.isLoggedIn()) {
            alert('Silakan login terlebih dahulu!');
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }

    /**
     * Check apakah user adalah Talent
     */
    static isTalent() {
        const user = this.getUser();
        return user && user.role?.toLowerCase() === 'talent';
    }

    /**
     * Check apakah user adalah Client
     */
    static isClient() {
        const user = this.getUser();
        return user && user.role?.toLowerCase() === 'client';
    }
}

/**
 * UI Utility - Helper untuk DOM manipulation
 */
class UIUtils {
    /**
     * Tampilkan alert (success/error/warning)
     */
    static showAlert(message, type = 'info') {
        const alertBox = document.getElementById('alert-box');
        if (!alertBox) {
            const div = document.createElement('div');
            div.id = 'alert-box';
            document.body.prepend(div);
        }

        const box = document.getElementById('alert-box');
        box.className = `alert alert-${type}`;
        box.textContent = message;
        box.style.display = 'block';

        // Auto hide setelah 5 detik
        setTimeout(() => {
            box.style.display = 'none';
        }, 5000);
    }

    /**
     * Show loading spinner
     */
    static showLoading(container) {
        container.innerHTML = `<div style="text-align: center; padding: 20px;">
            <div class="spinner"></div>
            <p style="color: #a0a0a0; margin-top: 10px;">Memuat data...</p>
        </div>`;
    }

    /**
     * Format currency ke IDR
     */
    static formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    }

    /**
     * Format date ke string yang readable
     */
    static formatDate(date) {
        return new Intl.DateTimeFormat('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    /**
     * Format jam ke format HH:MM
     */
    static formatTime(date) {
        return new Intl.DateTimeFormat('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    /**
     * Truncate string panjang
     */
    static truncate(str, length = 50) {
        return str.length > length ? str.substring(0, length) + '...' : str;
    }

    /**
     * Validate email
     */
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Validate password strength
     */
    static validatePassword(password) {
        return password.length >= 6;
    }

    /**
     * Generate badge color berdasarkan status
     */
    static getStatusColor(status) {
        const statusMap = {
            'pending': '#ffc107',
            'confirmed': '#8fbc8f',
            'cancelled': '#ff4747',
            'completed': '#8fbc8f',
            'active': '#8fbc8f',
            'inactive': '#a0a0a0'
        };
        return statusMap[status?.toLowerCase()] || '#a0a0a0';
    }
}

/**
 * DOM Helper
 */
class DOM {
    static $(selector) {
        return document.querySelector(selector);
    }

    static $$(selector) {
        return document.querySelectorAll(selector);
    }

    static createElement(tag, classes = '', html = '') {
        const el = document.createElement(tag);
        if (classes) el.className = classes;
        if (html) el.innerHTML = html;
        return el;
    }

    static show(el) {
        if (el) el.style.display = '';
    }

    static hide(el) {
        if (el) el.style.display = 'none';
    }

    static toggle(el) {
        if (el) el.style.display = el.style.display === 'none' ? '' : 'none';
    }

    static addClass(el, className) {
        if (el) el.classList.add(className);
    }

    static removeClass(el, className) {
        if (el) el.classList.remove(className);
    }

    static hasClass(el, className) {
        return el ? el.classList.contains(className) : false;
    }

    static on(el, event, handler) {
        if (el) el.addEventListener(event, handler);
    }

    static off(el, event, handler) {
        if (el) el.removeEventListener(event, handler);
    }
}
