package com.matcha.controller;

import com.matcha.model.ServiceItem;
import com.matcha.service.CatalogService;
import io.javalin.http.Context;
import java.util.List;
import java.util.Map;

public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController() {
        this.catalogService = new CatalogService();
    }

    // GET /api/talents
    public void getAllTalents(Context ctx) {
        try {
            String keyword = ctx.queryParam("search");
            List<Map<String, Object>> talents = catalogService.getTalentCatalog(keyword);
            ctx.status(200).json(Map.of(
                "status", "success",
                "data", talents
            ));
        } catch (Exception e) {
            ctx.status(500).json(Map.of(
                "status", "error",
                "message", "Gagal mengambil daftar talent."
            ));
        }
    }

    // GET /api/talents/{talentId}/services
    public void getTalentServices(Context ctx) {
        try {
            String talentId = ctx.pathParam("talentId");
            List<ServiceItem> services = catalogService.getTalentServices(talentId);
            ctx.status(200).json(Map.of(
                "status", "success",
                "data", services
            ));
        } catch (Exception e) {
            ctx.status(500).json(Map.of(
                "status", "error",
                "message", "Gagal mengambil layanan talent."
            ));
        }
    }

    // GET /api/services/{serviceId}
    public void getServiceById(Context ctx) {
        try {
            String serviceId = ctx.pathParam("serviceId");
            ServiceItem service = catalogService.getServiceById(serviceId);
            if (service != null) {
                ctx.status(200).json(Map.of("status", "success", "data", service));
            } else {
                ctx.status(404).json(Map.of("status", "error", "message", "Layanan tidak ditemukan."));
            }
        } catch (Exception e) {
            ctx.status(500).json(Map.of(
                "status", "error",
                "message", "Gagal mengambil detail layanan."
            ));
        }
    }

    // GET /api/services
    public void getAllServices(Context ctx) {
        try {
            List<ServiceItem> services = catalogService.getAllServices();
            ctx.status(200).json(Map.of("status", "success", "data", services));
        } catch (Exception e) {
            ctx.status(500).json(Map.of(
                "status", "error",
                "message", "Gagal mengambil daftar layanan."
            ));
        }
    }
}