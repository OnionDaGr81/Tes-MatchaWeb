package com.matcha.controller;

import com.matcha.service.CatalogService; 
import io.javalin.http.Context;
import com.matcha.model.ServiceItem;

import java.util.Map;
import java.util.List;

public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController() {
        this.catalogService = new CatalogService();
    }

    // --- ENDPOINT 1: Tampilkan Semua Talent ---
    // Akan merespons request GET ke /api/talents
    public void getAllTalents(Context ctx) {
        try {
            // (Opsional) Mengambil query parameter jika user melakukan pencarian
            String keyword = ctx.queryParam("search");

            // Memanggil service dan menyimpan di variabel 'talents'
            List<Map<String, Object>> talents = catalogService.getTalentCatalog(keyword);

            ctx.status(200).json(Map.of(
                "status", "success",
                "message", "Berhasil mengambil daftar talent",
                "data", talents // Panggil variabel 'talents' yang asli, bukan mockTalents
            ));

        } catch (Exception e) {
            ctx.status(500).json(Map.of(
                "status", "error",
                "message", "Terjadi kesalahan pada server saat mengambil data talent."
            ));
        }
    }

    // --- ENDPOINT 2: Tampilkan Layanan Milik Satu Talent ---
    // Akan merespons request GET ke /api/talents/{talentId}/services
    public void getTalentServices(Context ctx) {
        try {
            // Menangkap parameter {talentId} yang ada di URL path
            String talentId = ctx.pathParam("talentId");

            // Memanggil service dan menyimpan di variabel 'services'
            List<ServiceItem> services = catalogService.getTalentServices(talentId);
    
            ctx.status(200).json(Map.of(
                "status", "success",
                "message", "Berhasil mengambil katalog layanan",
                "data", services // Panggil variabel 'services' yang asli, bukan mockServices
            ));

        } catch (Exception e) {
            ctx.status(500).json(Map.of(
                "status", "error",
                "message", "Gagal mengambil detail layanan talent."
            ));
        }
    }

    // --- ENDPOINT 3: getServiceById  ---
    // Akan merespons request GET ke /api/services/{serviceId}
    public void getServiceById(Context ctx) {
        try {
            // Menangkap parameter {serviceId} yang ada di URL path
            String serviceId = ctx.pathParam("serviceId");
            // Memanggil service dan menyimpan di variabel 'service'
            ServiceItem service = catalogService.getServiceById(serviceId);
            if (service != null) {
                ctx.status(200).json(Map.of(
                    "status", "success",
                    "message", "Berhasil mengambil detail layanan",
                    "data", service // Panggil variabel 'service' yang asli, bukan mockService
                ));
            } else {
                ctx.status(404).json(Map.of(
                    "status", "error",
                    "message", "Layanan tidak ditemukan."
                ));
            }
        } catch (Exception e) {
            ctx.status(500).json(Map.of(
                "status", "error",
                "message", "Gagal mengambil detail layanan."
            ));
        }}
    
// GET /api/services
public void getAllServices(Context ctx) {
    try {
        List<ServiceItem> services = catalogService.getAllServices();
        ctx.status(200).json(Map.of(
            "status", "success",
            "data", services
        ));
    } catch (Exception e) {
        ctx.status(500).json(Map.of(
            "status", "error",
            "message", "Gagal mengambil daftar layanan."
        ));
    }
}
}