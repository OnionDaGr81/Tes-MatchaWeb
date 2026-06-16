package com.matcha.model;

public class ServiceItem {
    private String id;
    private String talentId;
    private String namaLayanan;
    private double tarifDasar;
    private String deskripsi;

    public ServiceItem() {}

    // Getter & Setter
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTalentId() { return talentId; }
    public void setTalentId(String talentId) { this.talentId = talentId; }
    public String getNamaLayanan() { return namaLayanan; }
    public void setNamaLayanan(String namaLayanan) { this.namaLayanan = namaLayanan; }
    public double getTarifDasar() { return tarifDasar; }
    public void setTarifDasar(double tarifDasar) { this.tarifDasar = tarifDasar; }
    public String getDeskripsi() { return deskripsi; }
    public void setDeskripsi(String deskripsi) { this.deskripsi = deskripsi; }
}