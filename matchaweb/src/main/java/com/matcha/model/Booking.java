package com.matcha.model;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Booking {
    public static final String STATUS_COMPLETED = "COMPLETED";
    
    private String id;
    private String clientId;
    private String talentId;
    private String serviceId;
    @com.fasterxml.jackson.annotation.JsonIgnore
    private LocalDateTime waktuMulai;
    
    @com.fasterxml.jackson.annotation.JsonIgnore
    private LocalDateTime waktuSelesai;
    
    private String status; // Misal: "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"
    
    private String createdAt;

    public Booking() {}

    // --- Getter dan Setter ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }
    
    public String getTalentId() { return talentId; }
    public void setTalentId(String talentId) { this.talentId = talentId; }
    
    public String getServiceId() { return serviceId; }
    public void setServiceId(String serviceId) { this.serviceId = serviceId; }
    
    public LocalDateTime getWaktuMulai() { return waktuMulai; }
    public void setWaktuMulai(LocalDateTime waktuMulai) { this.waktuMulai = waktuMulai; }
    
    public LocalDateTime getWaktuSelesai() { return waktuSelesai; }
    public void setWaktuSelesai(LocalDateTime waktuSelesai) { this.waktuSelesai = waktuSelesai; }
    
    @com.fasterxml.jackson.annotation.JsonProperty("waktuMulai")
    public void setWaktuMulaiStr(String s) {
        if (s != null && !s.isBlank()) this.waktuMulai = LocalDateTime.parse(s);
    }
    
    @com.fasterxml.jackson.annotation.JsonProperty("waktuSelesai")
    public void setWaktuSelesaiStr(String s) {
        if (s != null && !s.isBlank()) this.waktuSelesai = LocalDateTime.parse(s);
    }
    
    private static final java.time.format.DateTimeFormatter FORMATTER = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    @com.fasterxml.jackson.annotation.JsonProperty("waktuMulai")
    public String getWaktuMulaiStr() {
        return this.waktuMulai != null ? this.waktuMulai.format(FORMATTER) : null;
    }
    
    @com.fasterxml.jackson.annotation.JsonProperty("waktuSelesai")
    public String getWaktuSelesaiStr() {
        return this.waktuSelesai != null ? this.waktuSelesai.format(FORMATTER) : null;
    }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}