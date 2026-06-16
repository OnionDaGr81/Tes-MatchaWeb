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

    public List<Booking> getAllBookings() {
        return bookingRepository.getAllBookings();
    }

    public Booking getBookingById(String bookingId) {
        return bookingRepository.getBookingById(bookingId);
    }
}