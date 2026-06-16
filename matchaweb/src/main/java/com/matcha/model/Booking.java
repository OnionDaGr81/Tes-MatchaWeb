package com.matcha.model;

import java.time.LocalDateTime;

public class Booking {
    private String id;
    private String clientId;
    private String talentId;
    private String serviceId;
    private LocalDateTime waktuMulai;
    private LocalDateTime waktuSelesai;
    private String status; // Misal: "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"

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
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}