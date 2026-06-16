package com.matcha.model;

public class Invoice {
    private String id;
    private String bookingId; 
    private double totalAmount;
    private double extraFee;

    public Invoice() {}

    public double calculateTotal() {
        return this.totalAmount + this.extraFee;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public double getExtraFee() { return extraFee; }
    public void setExtraFee(double extraFee) { this.extraFee = extraFee; }
}