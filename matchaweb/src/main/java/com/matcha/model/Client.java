package com.matcha.model;

import java.util.ArrayList;
import java.util.List;

public class Client extends User {

    // Sesuai rancangan kelas, Client menyimpan riwayat pemesanan [cite: 103]
    private List<Booking> bookingHistory;

    public Client() {
        super();
        this.setRole("client"); // Otomatis set role saat objek dibuat
        this.bookingHistory = new ArrayList<>();
    }

    // Penerapan Polimorfisme: Aturan validasi khusus untuk Klien [cite: 104]
    @Override
    public boolean verifyIdentity() {
        if (this.email == null || this.email.isEmpty() || !this.email.endsWith("@gmail.com")) {
            return false;
        }
        if (this.noTelp == null || this.noTelp.isEmpty()) {
            return false;
        }
        return true;
    }

    // --- Getter & Setter ---
    public List<Booking> getBookingHistory() { return bookingHistory; }
    public void setBookingHistory(List<Booking> bookingHistory) { this.bookingHistory = bookingHistory; }
}