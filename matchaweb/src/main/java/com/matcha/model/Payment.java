package com.matcha.model;

public class Payment implements IPayable {
    private String id;
    private Invoice invoiceId;
    private String paymentMethod;
    private String paymentStatus;

    public Payment(String id, Invoice invoiceId, String paymentMethod, String paymentStatus) {
        this.id = id;
        this.invoiceId = invoiceId;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
    }

    @Override
    public boolean processPayment() {
        if (this.invoiceId != null && "PENDING".equalsIgnoreCase(this.paymentStatus)) {
            this.paymentStatus = "SUCCESS";
            return true;
        }
        return false;
    }

    @Override
    public void generateReceipt() {
        if ("SUCCESS".equalsIgnoreCase(this.paymentStatus)) {
            this.paymentStatus = "RECEIPT_GENERATED";
        }
    }
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Invoice getInvoiceId() { return invoiceId; }
    public void setInvoiceId(Invoice invoiceId) { this.invoiceId = invoiceId; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
}