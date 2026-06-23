package com.matcha.service;
import com.matcha.model.Booking;
import com.matcha.repository.BookingRepository;
import java.util.List;
import java.util.UUID;

public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    public BookingService() {
        this.bookingRepository = new BookingRepository();
        this.notificationService = new NotificationService();
    }

    public boolean processNewBooking(Booking booking) throws Exception {
        boolean isAvailable = bookingRepository.isTalentAvailable(
            booking.getTalentId(),
            booking.getWaktuMulai(),
            booking.getWaktuSelesai()
        );
        if (!isAvailable) {
            throw new Exception("Maaf, Talent sudah dibooking pada rentang waktu tersebut.");
        }
        booking.setId("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        booking.setStatus("PENDING");
        boolean success = bookingRepository.createBooking(booking);
        if (success) {
            try {
                notificationService.sendNotification(booking.getTalentId(), "booking", "Pesanan Baru Masuk", "Ada pesanan baru masuk! Silakan cek dashboard Anda.", "/dashboard-talent.html");
                notificationService.sendNotification(booking.getClientId(), "payment", "Menunggu Pembayaran", "Pesanan berhasil dibuat. Silakan segera lakukan pembayaran.", "/payment.html?bookingId=" + booking.getId());
            } catch(Exception e) { e.printStackTrace(); }
        }
        return success;
    }

    public List<Booking> getBookingHistory(String userId, String role) throws Exception {
        if (userId == null || userId.isEmpty() || role == null || role.isEmpty()) {
            throw new Exception("Parameter userId dan role wajib disertakan.");
        }
        List<Booking> bookings = bookingRepository.getBookingsByUserId(userId, role);
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        for (Booking b : bookings) {
            if (("CONFIRMED".equals(b.getStatus()) || "PAID".equals(b.getStatus())) && b.getWaktuSelesai() != null && b.getWaktuSelesai().isBefore(now)) {
                b.setStatus("COMPLETED");
                bookingRepository.updateBookingStatus(b.getId(), "COMPLETED");
                try {
                    notificationService.sendNotification(b.getClientId(), "review", "Pesanan Selesai", "Pesanan telah selesai. Jangan lupa berikan review!", "/review.html?bookingId=" + b.getId());
                } catch(Exception e) { e.printStackTrace(); }
            }
        }
        return bookings;
    }

    public boolean updateStatus(String bookingId, String newStatus) throws Exception {
        // Validasi agar status yang dikirim sesuai standar sistem
        if (!newStatus.equals("CONFIRMED") && !newStatus.equals("CANCELLED") && !newStatus.equals("COMPLETED")) {
            throw new Exception("Status tidak valid. Gunakan: CONFIRMED, CANCELLED, atau COMPLETED.");
        }
        
        boolean success = bookingRepository.updateBookingStatus(bookingId, newStatus);
        if (!success) {
            throw new Exception("Gagal mengupdate status. ID Booking mungkin tidak ditemukan.");
        }
        try {
            Booking b = bookingRepository.getBookingById(bookingId);
            if (b != null) {
                if ("CONFIRMED".equals(newStatus)) {
                    notificationService.sendNotification(b.getClientId(), "booking", "Pesanan Disetujui", "Pesanan Anda telah disetujui oleh Talent.", "/my-bookings.html");
                } else if ("CANCELLED".equals(newStatus)) {
                    notificationService.sendNotification(b.getClientId(), "booking", "Pesanan Ditolak", "Mohon maaf, pesanan Anda ditolak oleh Talent.", "/my-bookings.html");
                }
            }
        } catch(Exception e) {}
        return true;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.getAllBookings();
    }

    public Booking getBookingById(String bookingId) {
        return bookingRepository.getBookingById(bookingId);
    }
}