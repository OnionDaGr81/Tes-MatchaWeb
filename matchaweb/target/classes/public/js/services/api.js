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

    static async getTalentDetail(talentId) {
        try {
            return await this.request(`/talents/${talentId}`);
        } catch (e) {
            // Fallback since GET /api/talents/{id} endpoint is missing
            const res = await this.getTalents();
            const talent = res.data.find(t => t.id === talentId);
            if (talent) return { data: talent };
            throw new Error('Talent tidak ditemukan');
        }
    }

    // ===== BOOKING ENDPOINTS =====
    static createBooking(bookingData) {
        return this.request('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    }

    static getBookings(userId, role) {
        const r = role || (typeof AuthManager !== 'undefined' ? AuthManager.getUser()?.role : null) || 'client';
        return this.request(`/bookings?userId=${userId}&role=${r}`);
    }

    static getBookingDetail(bookingId) {
        return this.request(`/bookings/${bookingId}`);
    }

    static cancelBooking(bookingId) {
        return this.updateBookingStatus(bookingId, "CANCELLED");
    }

    static updateBookingStatus(bookingId, status) {
        return this.request(`/bookings/${bookingId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // ===== PAYMENT ENDPOINTS =====
    static getPaymentStatus(bookingId) {
        return this.request(`/payments?bookingId=${bookingId}`);
    }

    static async processPayment(paymentData) {
        // Step 1: Create invoice
        const invoiceData = {
            bookingId: paymentData.bookingId,
            baseRate: paymentData.amount,
            extraFee: 0
        };
        
        const invoiceRes = await this.request('/payments/invoice', {
            method: 'POST',
            body: JSON.stringify(invoiceData)
        });
        
        if (!invoiceRes || invoiceRes.status === 'error' || !invoiceRes.data) {
            throw new Error(invoiceRes ? invoiceRes.message : 'Gagal membuat tagihan');
        }
        
        // Step 2: Pay invoice
        const payData = {
            invoiceId: invoiceRes.data.id,
            paymentMethod: paymentData.paymentMethod || 'card'
        };
        
        return this.request('/payments/pay', {
            method: 'POST',
            body: JSON.stringify(payData)
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
        return this.request(`/talents/${talentId}/reviews`);
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

    static getUserBookings(userId, role) {
        const r = role || (typeof AuthManager !== 'undefined' ? AuthManager.getUser()?.role : null) || 'client';
        return this.request(`/bookings?userId=${userId}&role=${r}`);
    }

    // ===== NOTIFICATION ENDPOINTS =====
    static getNotifications(userId) {
        return this.request(`/users/${userId}/notifications`);
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
