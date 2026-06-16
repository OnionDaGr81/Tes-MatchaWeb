/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.matcha.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Notification implements INotifiable {
    private String notificationId;
    private User recipient; // Menggunakan polimorfisme, bisa mengarah ke Client atau Talent
    private String message;
    private LocalDateTime timestamp;

    // Default Constructor
    public Notification() {
        this.timestamp = LocalDateTime.now();
    }

    // Constructor dengan parameter
    public Notification(String notificationId, User recipient, String message) {
        this.notificationId = notificationId;
        this.recipient = recipient;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    @Override
    public void sendAlert(String message) {
        // Cetak pesan notifikasi ke layar/sistem untuk recipient terkait
        String recipientName = (recipient != null) ? recipient.getNama() : "Pengguna Tidak Dikenal";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");
        String timeStr = (timestamp != null) ? timestamp.format(formatter) : LocalDateTime.now().format(formatter);

        System.out.println("========================================");
        System.out.println(" NOTIFIKASI BARU (ID: " + notificationId + ")");
        System.out.println("Kepada : " + recipientName);
        System.out.println("Waktu  : " + timeStr);
        System.out.println("Pesan  : " + message);
        System.out.println("========================================");
    }

    public void triggerBookingStatusAlert(Booking booking) {
        // Buat trigger otomatis berdasarkan status booking
        if (booking == null) return;
        
        String status = booking.getStatus();
        if (status == null) return;

        // Logika trigger berdasarkan status booking
        if (status.equalsIgnoreCase("Paid")) {
            sendAlert("Anda mendapat pesanan baru!");
        } else if (status.equalsIgnoreCase("Confirmed")) {
            sendAlert("Pesanan Anda disetujui Talent!");
        } else if (status.equalsIgnoreCase( "Cancelled")) {
            sendAlert("Maaf, pesanan Anda telah dibatalkan.");
        } else {
            sendAlert("Status pesanan Anda telah berubah menjadi: " + status);
        }
    }

    // === Getters & Setters ===
    public String getNotificationId() {
        return notificationId;
    }

    public void setNotificationId(String notificationId) {
        this.notificationId = notificationId;
    }

    public User getRecipient() {
        return recipient;
    }

    public void setRecipient(User recipient) {
        this.recipient = recipient;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}