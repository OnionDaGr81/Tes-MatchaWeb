class Router {
    static init() {
        if (!AuthManager.requireLogin()) return;
        
        const user = AuthManager.getUser();
        
        // Setup top header
        document.getElementById('nav-greeting').innerHTML = `Halo, <b style="color:var(--primary);">${user.nama?.split(' ')[0] || 'User'}</b>!`;
        
        this.renderSidebar(user.role.toLowerCase());
        
        // Initial route
        const hash = window.location.hash.replace('#', '') || (user.role.toLowerCase() === 'talent' ? 'dashboard-talent' : 'dashboard-client');
        this.navigate(hash);
        
        // Listen to hash changes
        window.addEventListener('hashchange', () => {
            if (Router.isSyncingHash) return;
            const newHash = window.location.hash.replace('#', '');
            if (newHash) this.navigate(newHash);
        });
        
        // Listen to messages from iframe (in case iframe wants to navigate parent)
        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'navigate') {
                window.location.hash = e.data.route;
            }
        });
        
        // Setup iframe load listener
        const frame = document.getElementById('main-frame');
        frame.addEventListener('load', () => {
            document.getElementById('loading-overlay').classList.add('hidden');
            
            try {
                // Forcefully hide sidebar and header from parent to bypass CSS cache!
                const fDoc = frame.contentWindow.document;
                const sidebar = fDoc.querySelector('.sidebar');
                if (sidebar) sidebar.style.setProperty('display', 'none', 'important');
                
                const header = fDoc.querySelector('.top-header');
                if (header) header.style.setProperty('display', 'none', 'important');
                
                const container = fDoc.querySelector('.app-container');
                if (container) {
                    container.style.setProperty('display', 'block', 'important');
                    container.style.setProperty('padding', '0', 'important');
                }
                
                const mainContent = fDoc.querySelector('.main-content');
                if (mainContent) {
                    mainContent.style.setProperty('margin-left', '0', 'important');
                    mainContent.style.setProperty('width', '100%', 'important');
                    mainContent.style.setProperty('padding', '20px', 'important');
                }
                fDoc.body.style.backgroundColor = 'var(--bg-dark)';
                fDoc.body.classList.add('in-iframe'); // just in case
            } catch (err) {
                console.error("Iframe style injection failed:", err);
            }
            
            // Sync URL if iframe navigates internally
            try {
                const frameUrl = frame.contentWindow.location.pathname;
                const search = frame.contentWindow.location.search;
                const path = frameUrl.replace('/', '').replace('.html', '');
                
                // Keep query params but remove iframe=1
                let queryToKeep = new URLSearchParams(search);
                queryToKeep.delete('iframe');
                let newHash = path;
                const qStr = queryToKeep.toString();
                if (qStr) newHash += '?' + qStr;
                
                if (newHash && window.location.hash !== '#' + newHash) {
                    Router.isSyncingHash = true;
                    window.location.hash = newHash;
                    setTimeout(() => Router.isSyncingHash = false, 100);
                }
                this.updateSidebarActive(path);
                this.updateTitle(path);
            } catch (err) {
                // Cross-origin or other error
            }
        });
    }
    
    static renderSidebar(role) {
        const nav = document.getElementById('sidebar-nav-container');
        let html = '';
        
        if (role === 'client') {
            html += `<div class="sidebar-link" data-route="dashboard-client" onclick="window.location.hash='dashboard-client'">Dashboard</div>`;
            html += `<div class="sidebar-link" data-route="catalog" onclick="window.location.hash='catalog'">Katalog Talent</div>`;
        } else {
            html += `<div class="sidebar-link" data-route="dashboard-talent" onclick="window.location.hash='dashboard-talent'">Dashboard</div>`;
        }
        
        html += `<div class="sidebar-link" data-route="my-bookings" onclick="window.location.hash='my-bookings'">Booking Saya</div>`;
        html += `<div class="sidebar-link" data-route="notifications" onclick="window.location.hash='notifications'">Notifikasi</div>`;
        html += `<div class="sidebar-link" data-route="profile" onclick="window.location.hash='profile'">Profil & Layanan</div>`;
        
        nav.innerHTML = html;
    }
    
    static navigate(route) {
        document.getElementById('loading-overlay').classList.remove('hidden');
        
        const [path, query] = route.split('?');
        const frame = document.getElementById('main-frame');
        const newSrc = query ? `/${path}.html?iframe=1&${query}` : `/${path}.html?iframe=1`;
        
        if (frame.contentWindow.location.pathname + frame.contentWindow.location.search !== newSrc) {
            frame.src = newSrc;
        } else {
            document.getElementById('loading-overlay').classList.add('hidden');
        }
        
        this.updateSidebarActive(path);
        this.updateTitle(path);
    }
    
    static updateSidebarActive(route) {
        document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));
        const targetLink = document.querySelector(`.sidebar-link[data-route="${route}"]`);
        if (targetLink) targetLink.classList.add('active');
    }
    
    static updateTitle(route) {
        const titles = {
            'dashboard-client': 'Dashboard',
            'dashboard-talent': 'Dashboard Talent',
            'catalog': 'Katalog Talent',
            'my-bookings': 'Booking Saya',
            'notifications': 'Notifikasi',
            'profile': 'Profil Saya',
            'payment': 'Pembayaran',
            'review': 'Beri Ulasan'
        };
        document.getElementById('page-title').innerText = titles[route] || 'Matcha';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    Router.init();
});

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('matcha_theme', newTheme);
    
    // Also toggle theme inside iframe
    try {
        const frame = document.getElementById('main-frame');
        frame.contentWindow.document.documentElement.setAttribute('data-theme', newTheme);
    } catch(e) {}
}
document.documentElement.setAttribute('data-theme', localStorage.getItem('matcha_theme') || 'dark');

function logout() {
    AuthManager.logout();
    window.location.href = '/login.html';
}
