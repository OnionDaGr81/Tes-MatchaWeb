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

    /**
     * Tampilkan custom confirm modal
     */
    static showConfirm(title, message) {
        return new Promise((resolve) => {
            const modalId = 'confirm-modal-' + Date.now();
            const modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header" style="border-bottom: none; padding-bottom: 0;">
                        <h2>${title}</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p>${message}</p>
                        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                            <button id="btn-cancel-${modalId}" class="btn btn-outline">Batal</button>
                            <button id="btn-confirm-${modalId}" class="btn btn-primary">Ya</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const close = (result) => {
                modal.classList.remove('active');
                setTimeout(() => document.body.removeChild(modal), 300);
                resolve(result);
            };

            document.getElementById(`btn-cancel-${modalId}`).onclick = () => close(false);
            document.getElementById(`btn-confirm-${modalId}`).onclick = () => close(true);
        });
    }

    /**
     * Tampilkan custom prompt modal
     */
    static showPrompt(title, message, placeholder = '') {
        return new Promise((resolve) => {
            const modalId = 'prompt-modal-' + Date.now();
            const modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header" style="border-bottom: none; padding-bottom: 0;">
                        <h2>${title}</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p>${message}</p>
                        <input type="text" id="input-${modalId}" class="form-control" placeholder="${placeholder}" style="width: 100%; box-sizing: border-box; margin-bottom: 20px;">
                        <div style="display: flex; justify-content: flex-end; gap: 10px;">
                            <button id="btn-cancel-${modalId}" class="btn btn-outline">Batal</button>
                            <button id="btn-confirm-${modalId}" class="btn btn-primary">Konfirmasi</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const input = document.getElementById(`input-${modalId}`);
            input.focus();

            const close = (result) => {
                modal.classList.remove('active');
                setTimeout(() => document.body.removeChild(modal), 300);
                resolve(result);
            };

            document.getElementById(`btn-cancel-${modalId}`).onclick = () => close(null);
            document.getElementById(`btn-confirm-${modalId}`).onclick = () => close(input.value);
            
            input.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    close(input.value);
                }
            });
        });
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

// SPA Iframe Integration
document.addEventListener('DOMContentLoaded', () => {
    // If loaded inside iframe, hide its own sidebar
    if (window.location.search.includes('iframe=1') || window.self !== window.top) {
        document.body.classList.add('in-iframe');
        
        // Broadcast navigation to parent so hash updates
        const pushState = history.pushState;
        history.pushState = function() {
            pushState.apply(history, arguments);
            if (window.parent) {
                const route = window.location.pathname.replace('/', '').replace('.html', '');
                window.parent.postMessage({ type: 'navigate', route: route }, '*');
            }
        };
    } else {
        // If loaded directly (not in iframe), force redirect to SPA wrapper!
        const path = window.location.pathname;
        const excluded = ['/', '/index.html', '/login.html', '/app.html'];
        if (!excluded.includes(path)) {
            const route = path.replace('/', '').replace('.html', '');
            window.location.href = '/app.html#' + route;
        }
    }
});
