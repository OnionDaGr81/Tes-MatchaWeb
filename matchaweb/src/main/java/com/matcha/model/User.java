package com.matcha.model;

public class User {
    protected String id;
    protected String nama;
    protected String email;
    protected String password;
    protected String noTelp;
    protected String role;

    // Constructor kosong wajib ada untuk mapper JSON (Jackson)
    public User() {}

    // Method polimorfisme dasar yang akan dioverride oleh Client dan Talent [cite: 101]
    public boolean verifyIdentity() {
        return email != null && !email.isEmpty() && password != null && !password.isEmpty();
    }

    // --- Generate Getter & Setter untuk SEMUA atribut di atas ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getNama() { return nama; }
    public void setNama(String nama) { this.nama = nama; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getNoTelp() { return noTelp; }
    public void setNoTelp(String noTelp) { this.noTelp = noTelp; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}