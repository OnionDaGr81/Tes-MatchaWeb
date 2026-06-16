package com.matcha.model;

public class Talent extends User {
    
    private Profile profile;
    private boolean isAvailable;

    public Talent() {
        super();
        this.setRole("talent");
        this.isAvailable = true; // Default talent selalu available saat baru daftar
    }

    // Penerapan Polimorfisme: Talent mungkin punya aturan validasi identitas yang lebih ketat [cite: 107]
    @Override
    public boolean verifyIdentity() {
        // Contoh: Talent wajib punya nomor telepon untuk konfirmasi jadwal
        return super.verifyIdentity() && this.noTelp != null && !this.noTelp.isEmpty();
    }

    // --- Getter & Setter ---
    public Profile getProfile() { return profile; }
    public void setProfile(Profile profile) { this.profile = profile; }
    
    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }
}