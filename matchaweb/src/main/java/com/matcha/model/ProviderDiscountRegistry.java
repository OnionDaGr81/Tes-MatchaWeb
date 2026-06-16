package matcha.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Registry terpusat untuk semua diskon event dari sisi Provider/pengelola aplikasi.
 * Menggunakan pola Singleton — hanya ada satu instance selama aplikasi berjalan.
 */
public class ProviderDiscountRegistry {

    // Satu-satunya instance Singleton
    private static ProviderDiscountRegistry instance;

    // Daftar semua aturan diskon event yang terdaftar oleh provider
    private final List<DiscountRule> eventDiscounts = new ArrayList<>();

    private ProviderDiscountRegistry() {
        int year = LocalDate.now().getYear();

        // Seed data: event-event diskon yang sudah terjadwal tiap tahun
        eventDiscounts.add(new DiscountRule(
            "EVT-VALENTINE", "Valentine's Day", 0.15,
            LocalDate.of(year, 2, 13), LocalDate.of(year, 2, 15)
        ));
        eventDiscounts.add(new DiscountRule(
            "EVT-IMLEK", "Hari Raya Imlek", 0.12,
            LocalDate.of(year, 1, 28), LocalDate.of(year, 1, 30)
        ));
        eventDiscounts.add(new DiscountRule(
            "EVT-LEBARAN", "Hari Raya Idul Fitri", 0.20,
            LocalDate.of(year, 3, 29), LocalDate.of(year, 4, 2)
        ));
        eventDiscounts.add(new DiscountRule(
            "EVT-NATAL", "Natal & Tahun Baru", 0.10,
            LocalDate.of(year, 12, 24), LocalDate.of(year, 12, 31)
        ));
    }

    // Ambil instance — synchronized agar aman jika diakses bersamaan
    public static synchronized ProviderDiscountRegistry getInstance() {
        if (instance == null) {
            instance = new ProviderDiscountRegistry();
        }
        return instance;
    }

    // Admin menambahkan event diskon baru ke registry
    public void addEventDiscount(DiscountRule rule) {
        if (rule != null) eventDiscounts.add(rule);
    }

    // Admin menghapus event diskon berdasarkan ID-nya
    public boolean removeEventDiscount(String ruleId) {
        return eventDiscounts.removeIf(r -> r.getRuleId().equals(ruleId));
    }

    // Ambil semua diskon yang sedang aktif pada tanggal tertentu
    public List<DiscountRule> getActiveDiscounts(LocalDate date) {
        List<DiscountRule> active = new ArrayList<>();
        for (DiscountRule rule : eventDiscounts) {
            if (rule.isActiveOn(date)) active.add(rule);
        }
        return Collections.unmodifiableList(active);
    }

    // Ambil seluruh daftar diskon untuk keperluan tampilan Admin panel
    public List<DiscountRule> getAllDiscounts() {
        return Collections.unmodifiableList(eventDiscounts);
    }
}