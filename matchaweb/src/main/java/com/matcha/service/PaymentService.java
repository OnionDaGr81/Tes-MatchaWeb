package com.matcha.service;

import com.matcha.model.Invoice;
import com.matcha.model.Payment;
import com.matcha.repository.PaymentRepository;
import java.util.UUID;

public class PaymentService {
    
    private final PaymentRepository paymentRepository;

    public PaymentService() {
        this.paymentRepository = new PaymentRepository();
    }

    // --- Logika 1: Membuat Tagihan (Invoice) ---
    public Invoice generateInvoice(String bookingId, double baseRate, double extraFee) throws Exception {
        Invoice invoice = new Invoice();
        invoice.setId("INV-" + UUID.randomUUID().toString().substring(0, 8)); // Generate ID unik
        invoice.setBookingId(bookingId);
        invoice.setExtraFee(extraFee);
        
        // Asumsi baseRate didapat dari harga layanan (bisa ditarik dari DB nanti)
        invoice.setTotalAmount(baseRate + extraFee);

        boolean success = paymentRepository.createInvoice(invoice);
        if (!success) {
            throw new Exception("Gagal menyimpan Invoice ke database.");
        }
        return invoice;
    }

    // --- Logika 2: Memproses Pembayaran ---
    public Payment processPayment(String invoiceId, String paymentMethod) throws Exception {
        Payment payment = new Payment();
        payment.setId("PAY-" + UUID.randomUUID().toString().substring(0, 8));
        payment.setInvoiceId(invoiceId);
        payment.setPaymentMethod(paymentMethod);
        
        // Di aplikasi nyata, di sini ada logika potong saldo / integrasi Midtrans.
        // Untuk sekarang, kita asumsikan pembayaran selalu langsung SUKSES.
        payment.setPaymentStatus("Success");

        boolean success = paymentRepository.createPayment(payment);
        if (!success) {
            throw new Exception("Transaksi gagal diproses oleh sistem.");
        }
        return payment;
    }
}