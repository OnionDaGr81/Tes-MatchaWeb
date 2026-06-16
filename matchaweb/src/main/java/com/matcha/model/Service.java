/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package matcha.model;

/**
 *
 * Modul 2 : Manajemen Profil dan Layanan
 */
public class Service {
    private String serviceId;
    private String serviceName;
    private double baseRate;
    private String deskripsi;

    public double getRate() {
        // TODO: Kembalikan nilai baseRate, bisa ditambahkan logika polimorfisme nanti
        return baseRate;
    }

   public String getServiceDetails() {
        // Menggabungkan nama dan deskripsi agar rapi saat dicetak
        return this.serviceName + " - " + this.deskripsi;
    }

    // Dipakai oleh calculateDiscount() untuk mencocokkan aktivitas favorit talent
    public String getServiceName()          { return serviceName; }
    public void setServiceName(String n)    { this.serviceName = n; }

    public String getServiceId()            { return serviceId; }
    public void setServiceId(String id)     { this.serviceId = id; }

    public double getBaseRate()             { return baseRate; }
    public void setBaseRate(double rate)    { this.baseRate = rate; }

    public String getDeskripsi()            { return deskripsi; }
    public void setDeskripsi(String d)      { this.deskripsi = d; }
}
