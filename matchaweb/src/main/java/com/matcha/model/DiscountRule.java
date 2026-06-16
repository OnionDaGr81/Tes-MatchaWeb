package matcha.model;

import java.time.LocalDate;

/**
 * Merepresentasikan satu aturan diskon.
 * Bisa milik Provider (event hari besar) atau Talent (aktivitas favorit).
 */
public class DiscountRule {

    // Tipe diskon: dari provider berdasarkan event, atau dari talent berdasarkan aktivitas
    public enum DiscountType {
        PROVIDER_EVENT,
        TALENT_ACTIVITY
    }

    private final String ruleId;
    private final String label;           // Nama event atau aktivitas
    private final double percentage;      // Besar diskon, misal 0.10 = 10%
    private final DiscountType type;
    private final LocalDate validFrom;    // Tanggal mulai berlaku (khusus PROVIDER_EVENT)
    private final LocalDate validUntil;   // Tanggal selesai berlaku (khusus PROVIDER_EVENT)
    private final String activityKeyword; // Kata kunci aktivitas (khusus TALENT_ACTIVITY)

    // Constructor untuk diskon event dari Provider
    public DiscountRule(String ruleId, String label, double percentage,
                        LocalDate validFrom, LocalDate validUntil) {
        // Validasi persentase harus antara 0% sampai 100%
        if (percentage < 0 || percentage > 1.0)
            throw new IllegalArgumentException("[DiscountRule] Persentase harus antara 0.0 dan 1.0. Nilai: " + percentage);
        this.ruleId = ruleId;
        this.label = label;
        this.percentage = percentage;
        this.type = DiscountType.PROVIDER_EVENT;
        this.validFrom = validFrom;
        this.validUntil = validUntil;
        this.activityKeyword = null;
    }

    // Constructor untuk diskon aktivitas favorit Talent
    public DiscountRule(String ruleId, String label, double percentage,
                        String activityKeyword) {
        // Validasi persentase harus antara 0% sampai 100%
        if (percentage < 0 || percentage > 1.0)
            throw new IllegalArgumentException("[DiscountRule] Persentase harus antara 0.0 dan 1.0. Nilai: " + percentage);
        this.ruleId = ruleId;
        this.label = label;
        this.percentage = percentage;
        this.type = DiscountType.TALENT_ACTIVITY;
        this.validFrom = null;
        this.validUntil = null;
        this.activityKeyword = activityKeyword;
    }

    // Cek apakah diskon event ini aktif pada tanggal tertentu
    public boolean isActiveOn(LocalDate date) {
        if (type != DiscountType.PROVIDER_EVENT) return false;
        if (validFrom != null && date.isBefore(validFrom)) return false;
        if (validUntil != null && date.isAfter(validUntil)) return false;
        return true;
    }

    // Cek apakah nama layanan cocok dengan kata kunci aktivitas talent
    public boolean matchesActivity(String serviceName) {
        if (type != DiscountType.TALENT_ACTIVITY) return false;
        if (activityKeyword == null || serviceName == null) return false;
        return serviceName.toLowerCase().contains(activityKeyword.toLowerCase());
    }

    public String getRuleId()          { return ruleId; }
    public String getLabel()           { return label; }
    public double getPercentage()      { return percentage; }
    public DiscountType getType()      { return type; }
    public String getActivityKeyword() { return activityKeyword; }
}