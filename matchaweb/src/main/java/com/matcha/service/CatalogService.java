package com.matcha.service;
import com.matcha.model.ServiceItem;
import com.matcha.repository.CatalogRepository;
import java.util.List;
import java.util.Map;

public class CatalogService {
    
    private final CatalogRepository catalogRepository;
    public CatalogService() {
        this.catalogRepository = new CatalogRepository();
    }

    public List<Map<String, Object>> getTalentCatalog(String searchKeyword) {
        return catalogRepository.getAllTalentsWithProfile(searchKeyword);
    }

    public List<ServiceItem> getTalentServices(String talentId) throws Exception {
        if (talentId == null || talentId.isEmpty()) {
            throw new Exception("ID Talent tidak valid.");
        }
        return catalogRepository.getServicesByTalentId(talentId);
    }

    public ServiceItem getServiceById(String serviceId) throws Exception {
        if (serviceId == null || serviceId.isEmpty()) {
            throw new Exception("ID Layanan tidak valid.");
        }
        return catalogRepository.getServiceById(serviceId);
    }

    public List<ServiceItem> getAllServices() {
        return catalogRepository.getAllServices();
    }
}