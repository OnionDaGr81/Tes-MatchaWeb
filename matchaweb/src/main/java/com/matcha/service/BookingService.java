package com.matcha.service;
import com.matcha.model.Booking;
import com.matcha.repository.BookingRepository;
import java.util.List;
import java.util.UUID;

public class BookingService {
    
    private final BookingRepository bookingRepository;
    public BookingService() {
        this.bookingRepository = new BookingRepository();
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
        booking.setId(UUID.randomUUID().toString());
        booking.setStatus("PENDING");
        return bookingRepository.createBooking(booking);
    }

    public List<Booking> getBookingHistory(String userId, String role) throws Exception {
        if (userId == null || userId.isEmpty() || role == null || role.isEmpty()) {
            throw new Exception("Parameter userId dan role wajib disertakan.");
        }
        return bookingRepository.getBookingsByUserId(userId, role);
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
        return true;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.getAllBookings();
    }

    public Booking getBookingById(String bookingId) {
        return bookingRepository.getBookingById(bookingId);
    }
}