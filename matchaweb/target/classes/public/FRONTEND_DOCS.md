# 🍵 Matcha Frontend Documentation

Dokumentasi lengkap untuk pengembangan frontend Matcha - Premium Rental Companion Platform.

## 📁 Struktur Proyek

```
src/main/resources/public/
├── index.html                 # Landing page
├── login.html                 # Login/Register page
├── catalog.html               # Browse talents
├── my-bookings.html           # Booking history
├── booking-confirmation.html  # Booking confirmation
├── payment.html               # Payment page
├── review.html                # Review/rating page
├── profile.html               # User profile management
├── notifications.html         # Notifications
├── dashboard-client.html      # Client dashboard
├── dashboard-talent.html      # Talent dashboard
│
├── css/
│   └── global.css             # Global styles & design system
│
└── js/
    ├── services/
    │   └── api.js             # Centralized API service
    │
    ├── utils/
    │   └── helpers.js         # Helper functions & utilities
    │
    └── pages/
        ├── login.js           # Login page logic
        ├── catalog.js         # Catalog logic
        ├── payment.js         # Payment logic
        ├── profile.js         # Profile page logic
        ├── dashboard-talent.js # Talent dashboard logic
        ├── my-bookings.js     # Bookings list logic
        ├── review.js          # Review page logic
        ├── booking-confirmation.js
        └── notifications.js   # Notifications logic
```

## 🎨 Design System

### Color Variables (CSS Custom Properties)

```css
--primary: #8fbc8f           /* Hijau Matcha */
--primary-dark: #4a7c59      /* Hijau Gelap */
--primary-light: #a8d5a8     /* Hijau Terang */
--bg-dark: #121212           /* Background Gelap */
--bg-card: #1e1e1e           /* Card Background */
--text-primary: #f5f5f5      /* Teks Utama */
--text-secondary: #a0a0a0    /* Teks Sekunder */
--success: #8fbc8f
--warning: #ffc107
--danger: #ff4747
```

### Spacing

```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px
```

## 🔧 API Service Layer

### Menggunakan APIService

```javascript
// Login
const response = await APIService.login(email, password);

// Get Talents
const talents = await APIService.getTalents(searchKeyword);

// Create Booking
const booking = await APIService.createBooking(bookingData);

// Get User Profile
const profile = await APIService.getUserProfile(userId);

// Submit Review
const review = await APIService.submitReview(reviewData);
```

Semua API endpoints sudah terdefinisi di `/js/services/api.js`

## 🛠️ Utility Functions

### AuthManager (Session Management)

```javascript
// Check if user is logged in
if (AuthManager.isLoggedIn()) { ... }

// Get current user
const user = AuthManager.getUser();

// Check if user is Talent
if (AuthManager.isTalent()) { ... }

// Logout
AuthManager.logout();
```

### UIUtils (UI Helpers)

```javascript
// Show alert
UIUtils.showAlert('Message', 'success'); // success, error, warning, info

// Format currency
UIUtils.formatCurrency(10000); // Rp 10.000

// Format date
UIUtils.formatDate(new Date()); // Format dengan locale ID

// Validate email/password
UIUtils.validateEmail(email);
UIUtils.validatePassword(password);
```

### DOM (DOM Helpers)

```javascript
// Select elements
const element = DOM.$('.class');
const elements = DOM.$$('.class');

// Manipulate classes
DOM.addClass(element, 'active');
DOM.removeClass(element, 'active');
DOM.toggle(element);

// Show/Hide
DOM.show(element);
DOM.hide(element);

// Event listeners
DOM.on(element, 'click', handler);
```

## 📝 Halaman Utama

### 1. **Login Page** (`login.html`)
- Form login dengan validasi
- Form registrasi (Client/Talent)
- Redirect ke dashboard sesuai role

### 2. **Catalog Page** (`catalog.html`)
- Browse semua talents
- Search & filter talents
- Booking modal
- Rating & review display

### 3. **Payment Page** (`payment.html`)
- Multiple payment methods (Card, Bank Transfer, E-Wallet)
- Order summary
- Security info

### 4. **My Bookings** (`my-bookings.html`)
- View booking history
- Filter by status
- Timeline view
- Review button

### 5. **Review Page** (`review.html`)
- Rating system (1-5 stars)
- Aspect ratings (Profesionalisme, Ketepatan, dll)
- Submit review

### 6. **Profile Page** (`profile.html`)
- Edit personal info
- Manage addresses
- Change password
- Account settings
- Services management (Talent only)

### 7. **Dashboard Client** (`dashboard-client.html`)
- Quick stats
- Booking history
- Recommendations

### 8. **Dashboard Talent** (`dashboard-talent.html`)
- Stats (Pending, Confirmed, Earnings)
- Upcoming bookings
- Earnings chart
- Services management
- Recent reviews

### 9. **Notifications** (`notifications.html`)
- Real-time notifications
- Filter by type
- Mark as read

## 🔌 API Endpoints Integration

Semua endpoints sudah di-definisikan di `APIService`:

```javascript
// Auth
/api/auth/login
/api/auth/register

// Catalog
/api/talents
/api/talents/{talentId}
/api/talents/{talentId}/services

// Booking
/api/bookings
/api/bookings/{bookingId}
/api/bookings/{bookingId}/cancel

// Payment
/api/payments

// Review
/api/reviews
/api/reviews?talentId={talentId}

// User
/api/users/{userId}
/api/users/{userId}/bookings

// Notifications
/api/notifications
/api/notifications/{notificationId}/read
```

## 🚀 Development Tips

### 1. Menambah Halaman Baru

1. Buat file HTML di `/public/`
2. Buat file JS di `/js/pages/nama-page.js`
3. Link ke global.css dan helpers
4. Load data di `DOMContentLoaded`

```html
<!-- Template -->
<!DOCTYPE html>
<html lang="id">
<head>
    <link rel="stylesheet" href="/css/global.css">
</head>
<body>
    <nav>...</nav>
    <div class="container">...</div>
    
    <script src="/js/services/api.js"></script>
    <script src="/js/utils/helpers.js"></script>
    <script src="/js/pages/page-name.js"></script>
</body>
</html>
```

### 2. Menambah API Call

Edit `/js/services/api.js`:

```javascript
static myNewEndpoint(param) {
    return this.request(`/api/endpoint/${param}`, {
        method: 'GET'
    });
}
```

### 3. Error Handling

```javascript
try {
    const response = await APIService.getData();
    // Handle success
} catch (error) {
    UIUtils.showAlert(error.message, 'error');
    console.error(error);
}
```

## 📱 Responsive Design

Semua halaman sudah responsive dengan breakpoint:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎯 Best Practices

1. **Always check authentication** pada setiap page
```javascript
if (!AuthManager.requireLogin()) return;
```

2. **Use UIUtils untuk alerts**
```javascript
UIUtils.showAlert('Message', 'success');
```

3. **Gunakan API Service** untuk semua HTTP calls
```javascript
const data = await APIService.getTalents();
```

4. **Format currency & dates**
```javascript
UIUtils.formatCurrency(amount)
UIUtils.formatDate(date)
```

5. **Handle loading states**
```javascript
UIUtils.showLoading(container);
// ... fetch data ...
container.innerHTML = html;
```

## 🐛 Debugging

### Enable Console Logs

Buka DevTools (F12) untuk melihat:
- API errors
- JavaScript errors
- Network requests

### Common Issues

1. **"Anda harus masuk terlebih dahulu!"**
   - User belum login, check localStorage `matcha_user`

2. **"Gagal memuat data"**
   - Backend tidak running atau error
   - Check network tab di DevTools
   - Verifikasi API endpoints di server

3. **Styling issues**
   - Clear browser cache (Ctrl+Shift+Del)
   - Reload page (Ctrl+F5)

## 📦 Dependencies

- Vanilla JavaScript (No frameworks)
- CSS3 with Custom Properties
- Fetch API untuk HTTP requests

## ✅ Checklist Sebelum Deploy

- [ ] Semua halaman sudah tested
- [ ] API endpoints sudah sesuai
- [ ] Error handling sudah complete
- [ ] Mobile responsive OK
- [ ] Loading states ditampilkan
- [ ] Form validation bekerja
- [ ] Images/assets loaded correctly
- [ ] Console tidak ada error

## 📞 Support

Untuk pertanyaan atau issues:
1. Check dokumentasi di atas
2. Lihat console error (F12)
3. Verifikasi API endpoints
4. Check network requests

---

**Created**: 2024
**Version**: 1.0.0
**Status**: Production Ready
