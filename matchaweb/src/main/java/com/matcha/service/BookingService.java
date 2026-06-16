package com.matcha.service;

import com.matcha.model.Booking;
import com.matcha.repository.BookingRepository;
import java.util.UUID;

public class BookingService {
    
    private final BookingRepository bookingRepository;

    public BookingService() {
        this.bookingRepository = new BookingRepository();
    }

    public boolean processNewBooking(Booking booking) throws Exception {
        // 1. Validasi Bentrok Jadwal (Mengecek ke Database)
        boolean isAvailable = bookingRepository.isTalentAvailable(
            booking.getTalentId(),
            booking.getWaktuMulai(),
            booking.getWaktuSelesai()
        );

        if (!isAvailable) {
            // Melempar error agar ditangkap oleh Controller
            throw new Exception("Maaf, Talent sudah dibooking pada rentang waktu tersebut.");
        }

        // 2. Siapkan data sistem sebelum di-insert ke database
        booking.setId(UUID.randomUUID().toString());
        
        // Status awal pesanan baru selalu PENDING sebelum masuk ke tahap pembayaran [cite: 119]
        booking.setStatus("PENDING"); 

        // 3. Simpan ke database melalui Repository
        return bookingRepository.createBooking(booking);
    }
}