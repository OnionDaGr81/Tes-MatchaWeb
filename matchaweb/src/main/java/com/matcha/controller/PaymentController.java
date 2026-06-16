package com.matcha.controller;

import com.model.Payment;
import com.model.Invoice;
import com.model.DiscountRule;
import com.model.ProviderDiscountRegistry;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class PaymentController {
    private List<Payment> paymentList; // Koleksi penyimpanan runtime internal data transaksi

    // Konstruktor
    public PaymentController() {
        this.paymentList = new ArrayList<>();
    }

    /**
     * Mendaftarkan objek transaksi pembayaran baru ke dalam sistem memory
     */
    public Payment createPayment(String paymentId, Invoice tagihan, String paymentMethod) {
        Payment newPayment = new Payment(paymentId, tagihan, paymentMethod, "PENDING");
        paymentList.add(newPayment);
        return newPayment;
    }

    /**
     * Menjalankan eksekusi pemrosesan pembayaran dan pembaruan status transaksi
     */
    public boolean executePaymentProcess(String paymentId) {
        Payment payment = findPaymentById(paymentId);
        if (payment != null) {
            boolean isSuccess = payment.processPayment();
            if (isSuccess) {
                payment.generateReceipt();
                return true;
            }
        }
        return false;
    }

    /**
     * Melakukan kalkulasi total pembayaran invoice setelah dipotong akumulasi diskon event provider yang aktif hari ini
     */
    public double calculateFinalAmountWithCurrentDiscount(Invoice tagihan) {
        double originalAmount = tagihan.getTotalAmount();
        LocalDate today = LocalDate.now();
        
        // Memanggil registry terpusat (Singleton Pattern)
        ProviderDiscountRegistry registry = ProviderDiscountRegistry.getInstance();
        List<DiscountRule> activeDiscounts = registry.getActiveDiscounts(today);
        
        double totalDiscountPercentage = 0.0;
        for (DiscountRule rule : activeDiscounts) {
            totalDiscountPercentage += rule.getPercentage();
        }
        
        // Batasi total akumulasi diskon maksimal 100% (1.0) demi keamanan bisnis data
        if (totalDiscountPercentage > 1.0) {
            totalDiscountPercentage = 1.0;
        }
        
        return originalAmount * (1.0 - totalDiscountPercentage);
    }

    /**
     * Melakukan validasi kecukupan saldo akun sebelum transaksi final diproses
     */
    public boolean validateClientBalance(double clientBalance, double totalInvoiceAmount) {
        return clientBalance >= totalInvoiceAmount;
    }

    /**
     * Mencari objek transaksi pembayaran berdasarkan ID internal
     */
    public Payment findPaymentById(String paymentId) {
        for (Payment payment : paymentList) {
            if (payment.getPaymentId().equalsIgnoreCase(paymentId)) {
                return payment;
            }
        }
        return null;
    }

    /**
     * Memeriksa status terkini transaksi pembayaran
     */
    public String checkPaymentStatus(String paymentId) {
        Payment payment = findPaymentById(paymentId);
        if (payment != null) {
            return payment.getPaymentStatus();
        }
        return "PAYMENT_NOT_FOUND";
    }

    public List<Payment> getPaymentList() {
        return paymentList;
    }
}