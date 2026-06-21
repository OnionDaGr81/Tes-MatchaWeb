package com.matcha.controller;

import com.matcha.model.Invoice;
import com.matcha.model.Payment;
import com.matcha.service.PaymentService;
import io.javalin.http.Context;
import java.util.Map;

public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController() {
        this.paymentService = new PaymentService();
    }

    // POST /api/payments/invoice
    public void createInvoice(Context ctx) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> body = ctx.bodyAsClass(Map.class);

            String bookingId = (String) body.get("bookingId");
            if (bookingId == null || bookingId.isBlank()) {
                ctx.status(400).json(Map.of("status", "error", "message", "bookingId wajib diisi.")); return;
            }

            double baseRate = Double.parseDouble(body.getOrDefault("baseRate", "0").toString());
            double extraFee = Double.parseDouble(body.getOrDefault("extraFee", "0").toString());

            if (baseRate < 0 || extraFee < 0) {
                ctx.status(400).json(Map.of("status", "error", "message", "baseRate dan extraFee tidak boleh negatif.")); return;
            }

            Invoice invoice = paymentService.generateInvoice(bookingId, baseRate, extraFee);

            ctx.status(201).json(Map.of(
                "status", "success",
                "message", "Tagihan berhasil dibuat.",
                "data", invoice
            ));
        } catch (NumberFormatException e) {
            ctx.status(400).json(Map.of("status", "error", "message", "Format angka tidak valid untuk baseRate atau extraFee."));
        } catch (Exception e) {
            ctx.status(400).json(Map.of(
                "status", "error",
                "message", e.getMessage() != null ? e.getMessage() : "Gagal membuat tagihan."
            ));
        }
    }

    // POST /api/payments/pay
    public void payInvoice(Context ctx) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, String> body = ctx.bodyAsClass(Map.class);

            String invoiceId = body.get("invoiceId");
            if (invoiceId == null || invoiceId.isBlank()) {
                ctx.status(400).json(Map.of("status", "error", "message", "invoiceId wajib diisi.")); return;
            }

            String paymentMethod = body.getOrDefault("paymentMethod", "E-Wallet");
            Payment receipt = paymentService.processPayment(invoiceId, paymentMethod);

            ctx.status(200).json(Map.of(
                "status", "success",
                "message", "Pembayaran berhasil!",
                "data", receipt
            ));
        } catch (Exception e) {
            ctx.status(400).json(Map.of(
                "status", "error",
                "message", e.getMessage() != null ? e.getMessage() : "Transaksi gagal."
            ));
        }
    }

    // GET /api/payments?bookingId={bookingId}
    public void getPaymentByBookingId(Context ctx) {
        try {
            String bookingId = ctx.queryParam("bookingId");
            if (bookingId == null || bookingId.isBlank()) {
                ctx.status(400).json(Map.of("status", "error", "message", "bookingId wajib diisi.")); return;
            }

            Payment payment = paymentService.getPaymentByBookingId(bookingId);
            if (payment != null) {
                ctx.status(200).json(Map.of("status", "success", "data", payment));
            } else {
                ctx.status(404).json(Map.of("status", "error", "message", "Pembayaran tidak ditemukan."));
            }
        } catch (Exception e) {
            ctx.status(500).json(Map.of("status", "error", "message", "Gagal mengambil data pembayaran."));
        }
    }
}