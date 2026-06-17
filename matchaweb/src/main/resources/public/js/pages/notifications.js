/**
 * Notifications Page
 */

let allNotifications = [];
let currentFilter = 'all';

const notificationIcons = {
    booking: '📅',
    payment: '💳',
    review: '⭐',
    message: '💬',
    system: 'ℹ️'
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
        const response = await APIService.getNotifications(user.id);
        allNotifications = response.data || [];

        renderNotifications(allNotifications);
    } catch (error) {
        console.error('Error loading notifications:', error);
        container.innerHTML = '<div class="empty-state"><p>❌ Gagal memuat notifikasi</p></div>';
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

    const icon = notificationIcons[notification.type] || '🔔';
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
                <button class="btn btn-sm btn-secondary" onclick="markAsRead('${notification.id}')">
                    ✓ Baca
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
    currentFilter = type;

    // Update filter UI
    DOM.$$('.filter-btn').forEach(btn => {
        if (btn.textContent.toLowerCase().includes(type === 'all' ? 'semua' : type)) {
            DOM.addClass(btn, 'active');
        } else {
            DOM.removeClass(btn, 'active');
        }
    });

    renderNotifications(allNotifications);
}

/**
 * Mark notification as read
 */
async function markAsRead(notificationId) {
    try {
        await APIService.markNotificationAsRead(notificationId);
        
        // Update local data
        const notification = allNotifications.find(n => n.id === notificationId);
        if (notification) {
            notification.isRead = true;
        }

        renderNotifications(allNotifications);
    } catch (error) {
        console.error('Error marking notification as read:', error);
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
