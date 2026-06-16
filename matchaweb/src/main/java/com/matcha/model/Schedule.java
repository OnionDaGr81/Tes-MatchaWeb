/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package matcha.model;

/**
 *
 * Modul 3: Pemesanan dan Penjadwalan
 */
import java.time.LocalDateTime;

public class Schedule {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean isBooked;

    // Constructor
     public Schedule(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Waktu mulai dan selesai tidak boleh null.");
        }
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Waktu mulai harus sebelum waktu selesai.");
        }
        this.startTime = startTime;
        this.endTime   = endTime;
        this.isBooked  = false;
    }

     // Bisnis Logic
     public boolean checkAvailability(LocalDateTime requestStart, LocalDateTime requestEnd) {
        if (isBooked) {
            return false;
        }
              // Cek apakah interval ini dan interval yang diminta TIDAK overlap
        boolean noOverlap = !this.startTime.isBefore(requestEnd)
                         || !requestStart.isBefore(this.endTime);
        return noOverlap;
    }
     public boolean isOverlapping(LocalDateTime requestStart, LocalDateTime requestEnd) {
        return !checkAvailability(requestStart, requestEnd);
    }

    // Tandai jadwal sebagai sudah dipesan
   public void bookSlot() {
        this.isBooked = true;
    }
    // Bebaskan jadwal sehingga tersedia kembali.
      public void releaseSlot() {
        this.isBooked = false;
    }

     //Getters & Setters
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getEndTime()   { return endTime; }
    public boolean isBooked()           { return isBooked; }

    @Override
    public String toString() {
        return String.format("Schedule[%s → %s, booked=%s]", startTime, endTime, isBooked);
    }
}
