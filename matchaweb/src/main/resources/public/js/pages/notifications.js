/**
 * Notifications Page
 */

let allNotifications = [];
let currentFilter = 'all';

const notificationIcons = {
    booking: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align: text-bottom;"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>',
    payment: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align: text-bottom;"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>',
    review: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="var(--warning)" style="vertical-align: text-bottom;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    message: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align: text-bottom;"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>',
    system: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align: text-bottom;"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>'
};

document.addEventListener('DOMContentLoaded', () => {
    // Check login
    if (!AuthManager.requireLogin()) return;

    // Load notifications
    loadNotifications();

    // Poll for new notifications every 30 seconds
    setInterval(loadNotifications, 30000);
});

/**
 * Load user notifications
 */
async function loadNotifications() {
    const user = AuthManager.getUser();
    const container = DOM.$('#notifications-container');

    try {
        // Show skeletons
        showSkeletonLoaders();

        // Simulate small delay for loading state visibility
        await new Promise(resolve => setTimeout(resolve, 300));

        const response = await APIService.getNotifications(user.id);
        allNotifications = response.data || [];

        renderNotifications(allNotifications);
    } catch (error) {
        console.error('Error loading notifications:', error);
        container.innerHTML = '<div class="empty-state"><p><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 0.5rem; color: var(--danger);"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> Gagal memuat notifikasi</p></div>';
    }
}

/**
 * Show skeleton loaders
 */
function showSkeletonLoaders() {
    const container = DOM.$('#notifications-container');
    container.innerHTML = '';
    for(let i=0; i<4; i++) {
        const skel = DOM.createElement('div', 'notification-item');
        skel.innerHTML = `
            <div style="display: flex; flex: 1; align-items: flex-start;">
                <div class="skeleton skeleton-avatar" style="width: 40px; height: 40px; margin-right: 15px;"></div>
                <div class="notification-content" style="flex: 1;">
                    <div class="skeleton skeleton-title" style="width: 200px;"></div>
                    <div class="skeleton skeleton-text" style="width: 80%;"></div>
                    <div class="skeleton skeleton-text short" style="width: 60px;"></div>
                </div>
            </div>
            <div class="skeleton" style="width: 80px; height: 30px; border-radius: 15px;"></div>
        `;
        container.appendChild(skel);
    }
}

/**
 * Render notifications
 */
function renderNotifications(notifications) {
    const container = DOM.$('#notifications-container');
    const emptyState = DOM.$('#empty-state');

    const filtered = currentFilter === 'all'
        ? notifications
        : notifications.filter(n => n.type === currentFilter);

    if (filtered.length === 0) {
        container.innerHTML = '';
        DOM.show(emptyState);
        return;
    }

    DOM.hide(emptyState);
    container.innerHTML = '';

    filtered.forEach(notification => {
        const item = createNotificationItem(notification);
        container.appendChild(item);
    });
}

/**
 * Create notification item element
 */
function createNotificationItem(notification) {
    const item = DOM.createElement('div', `notification-item type-${notification.type}`);

    if (!notification.isRead) {
        DOM.addClass(item, 'unread');
    }

    const icon = notificationIcons[notification.type] || '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>';
    const timeAgo = getTimeAgo(new Date(notification.createdAt));

    item.innerHTML = `
        ${!notification.isRead ? '<div class="notification-unread-indicator"></div>' : ''}
        <div style="display: flex; flex: 1; align-items: flex-start;">
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${timeAgo}</div>
            </div>
        </div>
        <div class="notification-action">
            ${notification.actionUrl ? `
                <button class="btn btn-sm btn-primary" onclick="handleNotificationAction('${notification.actionUrl}')">
                    Lihat
                </button>
            ` : ''}
            ${!notification.isRead ? `
                <button class="btn btn-sm btn-secondary" onclick="markAsRead('${notification.id}', this, event)">
                    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 4px;"><path d="M20 6L9 17l-5-5"/></svg> Baca
                </button>
            ` : ''}
        </div>
    `;

    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
        }
    });

    return item;
}

/**
 * Get time ago string
 */
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' tahun lalu';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' bulan lalu';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' hari lalu';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' jam lalu';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' menit lalu';
    
    return 'Baru saja';
}

/**
 * Filter notifications
 */
function filterNotifications(type) {
    // Make it feel smoother by wrapping in async self-executing or just change to async function
    // But since it's called from onclick, making it async is fine.
    _filterNotificationsAsync(type);
}

async function _filterNotificationsAsync(type) {
    currentFilter = type;

    // Update filter UI
    const typeToTextMap = {
        'all': 'semua',
        'booking': 'pesanan',
        'payment': 'pembayaran',
        'review': 'review'
    };

    DOM.$$('.filter-btn').forEach(btn => {
        if (btn.textContent.toLowerCase().includes(typeToTextMap[type])) {
            DOM.addClass(btn, 'active');
        } else {
            DOM.removeClass(btn, 'active');
        }
    });

    // Add brief loading state
    showSkeletonLoaders();
    await new Promise(resolve => setTimeout(resolve, 200));

    renderNotifications(allNotifications);
}

/**
 * Mark notification as read
 */
async function markAsRead(notificationId, btn, e) {
    if (e) e.stopPropagation();
    if (btn) btn.classList.add('btn-loading');

    try {
        await new Promise(r => setTimeout(r, 400)); // Simulate delay
        await APIService.markNotificationAsRead(notificationId);
        
        // Update local data
        const notification = allNotifications.find(n => n.id === notificationId);
        if (notification) {
            notification.isRead = true;
        }

        renderNotifications(allNotifications);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        if (btn) btn.classList.remove('btn-loading');
    }
}

/**
 * Mark all as read
 */
async function markAllAsRead() {
    const unreadNotifications = allNotifications.filter(n => !n.isRead);
    
    try {
        for (const notification of unreadNotifications) {
            await APIService.markNotificationAsRead(notification.id);
        }
        
        await loadNotifications();
        UIUtils.showAlert('Semua notifikasi sudah ditandai dibaca', 'success');
    } catch (error) {
        UIUtils.showAlert('Gagal menandai notifikasi', 'error');
    }
}

/**
 * Handle notification action (click on "Lihat" button)
 */
function handleNotificationAction(actionUrl) {
    window.location.href = actionUrl;
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
