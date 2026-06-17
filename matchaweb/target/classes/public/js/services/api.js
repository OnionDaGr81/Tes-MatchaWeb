/**
 * Centralized API Service untuk semua HTTP requests
 * Menghindari duplikasi fetch code di berbagai halaman
 */

const API_BASE = '/api';
const API_TIMEOUT = 10000; // 10 seconds

class APIService {
    /**
     * Helper untuk HTTP requests
     */
    static async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

            const response = await fetch(url, {
                ...defaultOptions,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Parse response
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error.message);
            throw error;
        }
    }

    // ===== AUTH ENDPOINTS =====
    static login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    static register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // ===== CATALOG ENDPOINTS =====
    static getTalents(search = '') {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        return this.request(`/talents${params}`);
    }

    static getTalentServices(talentId) {
        return this.request(`/talents/${talentId}/services`);
    }

    static getTalentDetail(talentId) {
        return this.request(`/talents/${talentId}`);
    }

    // ===== BOOKING ENDPOINTS =====
    static createBooking(bookingData) {
        return this.request('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    }

    static getBookings(userId) {
        return this.request(`/bookings?userId=${userId}`);
    }

    static getBookingDetail(bookingId) {
        return this.request(`/bookings/${bookingId}`);
    }

    static cancelBooking(bookingId) {
        return this.request(`/bookings/${bookingId}/cancel`, {
            method: 'PUT'
        });
    }

    // ===== PAYMENT ENDPOINTS =====
    static getPaymentStatus(bookingId) {
        return this.request(`/payments?bookingId=${bookingId}`);
    }

    static processPayment(paymentData) {
        return this.request('/payments', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }

    // ===== REVIEW ENDPOINTS =====
    static submitReview(reviewData) {
        return this.request('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    }

    static getTalentReviews(talentId) {
        return this.request(`/reviews?talentId=${talentId}`);
    }

    // ===== USER ENDPOINTS =====
    static getUserProfile(userId) {
        return this.request(`/users/${userId}`);
    }

    static updateUserProfile(userId, profileData) {
        return this.request(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    static getUserBookings(userId) {
        return this.request(`/users/${userId}/bookings`);
    }

    // ===== NOTIFICATION ENDPOINTS =====
    static getNotifications(userId) {
        return this.request(`/notifications?userId=${userId}`);
    }

    static markNotificationAsRead(notificationId) {
        return this.request(`/notifications/${notificationId}/read`, {
            method: 'PUT'
        });
    }
}

// Export untuk digunakan di module lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIService;
}
