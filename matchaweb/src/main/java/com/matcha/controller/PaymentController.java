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

    // ENDPOINT 1: Buat Tagihan (Akses: POST /api/payments/invoice)
    public void createInvoice(Context ctx) {
        try {
            Map<String, Object> body = ctx.bodyAsClass(Map.class);
            String bookingId = (String) body.get("bookingId");
            
            // Konversi tipe data dengan aman
            double baseRate = Double.parseDouble(body.getOrDefault("baseRate", "0").toString());
            double extraFee = Double.parseDouble(body.getOrDefault("extraFee", "0").toString());

            Invoice invoice = paymentService.generateInvoice(bookingId, baseRate, extraFee);

            ctx.status(201).json(Map.of(
                "status", "success",
                "message", "Tagihan berhasil dibuat.",
                "data", invoice
            ));
        } catch (Exception e) {
            ctx.status(400).json(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    // ENDPOINT 2: Bayar Tagihan (Akses: POST /api/payments/pay)
    public void payInvoice(Context ctx) {
        try {
            Map<String, String> body = ctx.bodyAsClass(Map.class);
            String invoiceId = body.get("invoiceId");
            String paymentMethod = body.getOrDefault("paymentMethod", "E-Wallet");

            Payment receipt = paymentService.processPayment(invoiceId, paymentMethod);

            ctx.status(200).json(Map.of(
                "status", "success",
                "message", "Pembayaran berhasil! Saldo telah dipotong.",
                "data", receipt
            ));
        } catch (Exception e) {
            ctx.status(400).json(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}