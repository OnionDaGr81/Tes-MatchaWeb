package com.matcha.model;

public class Payment implements IPayable {
    private String id;
    private String invoiceId;
    private String paymentMethod;
    private String paymentStatus;

    public Payment() {}

    @Override
    public boolean processPayment() {
        return "Success".equalsIgnoreCase(this.paymentStatus);
    }

    @Override
    public void generateReceipt() {
        // Implementasi kosong: Struk dirender di frontend (HTML/JS) menggunakan JSON
    }

    // --- Getter & Setter ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getInvoiceId() { return invoiceId; }
    public void setInvoiceId(String invoiceId) { this.invoiceId = invoiceId; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
}