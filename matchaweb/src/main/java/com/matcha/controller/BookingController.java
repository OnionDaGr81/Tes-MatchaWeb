package com.matcha.controller;

import com.matcha.model.Booking;
import com.matcha.service.BookingService;
import io.javalin.http.Context;
import java.util.List;
import java.util.Map;

public class BookingController {

    private final BookingService bookingService;

    public BookingController() {
        this.bookingService = new BookingService();
    }

    // POST /api/bookings
    public void createBooking(Context ctx) {
        try {
            Booking newBooking = ctx.bodyAsClass(Booking.class);

            if (newBooking.getClientId() == null || newBooking.getClientId().isBlank()) {
                ctx.status(400).json(Map.of("status", "error", "message", "clientId wajib diisi.")); return;
            }
            if (newBooking.getTalentId() == null || newBooking.getTalentId().isBlank()) {
                ctx.status(400).json(Map.of("status", "error", "message", "talentId wajib diisi.")); return;
            }
            if (newBooking.getServiceId() == null || newBooking.getServiceId().isBlank()) {
                ctx.status(400).json(Map.of("status", "error", "message", "serviceId wajib diisi.")); return;
            }
            if (newBooking.getWaktuMulai() == null || newBooking.getWaktuSelesai() == null) {
                ctx.status(400).json(Map.of("status", "error", "message", "waktuMulai dan waktuSelesai wajib diisi.")); return;
            }
            if (!newBooking.getWaktuSelesai().isAfter(newBooking.getWaktuMulai())) {
                ctx.status(400).json(Map.of("status", "error", "message", "waktuSelesai harus setelah waktuMulai.")); return;
            }

            bookingService.processNewBooking(newBooking);

            ctx.status(201).json(Map.of(
                "status", "success",
                "message", "Booking berhasil dibuat! Silakan lanjutkan ke pembayaran.",
                "data", newBooking
            ));
        } catch (Exception e) {
            ctx.status(400).json(Map.of(
                "status", "error",
                "message", e.getMessage() != null ? e.getMessage() : "Gagal membuat booking."
            ));
        }
    }

    // GET /api/bookings?userId=xxx&role=client
    public void getBookingHistory(Context ctx) {
        try {
            String userId = ctx.queryParam("userId");
            String role   = ctx.queryParam("role");
            List<Booking> history = bookingService.getBookingHistory(userId, role);
            ctx.status(200).json(Map.of(
                "status", "success",
                "data", history
            ));
        } catch (Exception e) {
            ctx.status(400).json(Map.of(
                "status", "error",
                "message", e.getMessage() != null ? e.getMessage() : "Terjadi kesalahan."
            ));
        }
    }

    // GET /api/bookings/{bookingId}
    public void getBookingById(Context ctx) {
        try {
            String bookingId = ctx.pathParam("bookingId");
            Booking booking  = bookingService.getBookingById(bookingId);
            if (booking != null) {
                ctx.status(200).json(Map.of("status", "success", "data", booking));
            } else {
                ctx.status(404).json(Map.of("status", "error", "message", "Booking tidak ditemukan."));
            }
        } catch (Exception e) {
            ctx.status(500).json(Map.of("status", "error", "message", "Gagal mengambil data booking."));
        }
    }

    // PUT /api/bookings/{bookingId}/status
    public void updateBookingStatus(Context ctx) {
        try {
            String bookingId = ctx.pathParam("bookingId");

            @SuppressWarnings("unchecked")
            Map<String, String> body = ctx.bodyAsClass(Map.class);
            String newStatus = body.get("status");

            if (newStatus == null || newStatus.isBlank()) {
                ctx.status(400).json(Map.of("status", "error", "message", "Field 'status' wajib diisi.")); return;
            }

            bookingService.updateStatus(bookingId, newStatus);

            ctx.status(200).json(Map.of(
                "status", "success",
                "message", "Status pesanan berhasil diubah menjadi " + newStatus + "."
            ));
        } catch (Exception e) {
            ctx.status(400).json(Map.of(
                "status", "error",
                "message", e.getMessage() != null ? e.getMessage() : "Gagal mengupdate status."
            ));
        }
    }
}