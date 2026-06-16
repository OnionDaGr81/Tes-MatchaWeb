package com.matcha.controller;

import com.matcha.model.Booking;
import com.matcha.service.BookingService;
import io.javalin.http.Context;
import java.util.Map;

public class BookingController {
    
    private final BookingService bookingService;

    public BookingController() {
        this.bookingService = new BookingService();
    }

    // --- ENDPOINT: Buat Pesanan Baru ---
    // Akses: POST /api/bookings
    public void createBooking(Context ctx) {
        try {
            // 1. Tangkap JSON dari request
            Booking newBooking = ctx.bodyAsClass(Booking.class);

            // 2. Lempar ke Service untuk validasi dan simpan
            bookingService.processNewBooking(newBooking);

            // 3. Jika tidak ada Exception (tidak bentrok), kembalikan response Sukses
            ctx.status(201).json(Map.of(
                "status", "success",
                "message", "Booking berhasil dibuat! Silakan lanjutkan ke pembayaran.",
                "data", newBooking
            ));

        } catch (Exception e) {
            // Jika bentrok atau data JSON tidak valid, kembalikan response Error
            ctx.status(400).json(Map.of(
                "status", "error",
                "message", e.getMessage() != null ? e.getMessage() : "Gagal membuat pesanan. Pastikan format data benar."
            ));
        }
    }
}