package com.matcha.repository;

import com.matcha.model.ServiceItem;
import com.matcha.util.DBUtil;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CatalogRepository {

    // 1. Mengambil daftar Talent (menggabungkan tabel users dan profiles)
    public List<Map<String, Object>> getAllTalentsWithProfile(String keyword) {
        List<Map<String, Object>> talents = new ArrayList<>();

        StringBuilder sql = new StringBuilder(
            "SELECT u.id, u.nama, u.role, u.profile_photo, p.bio, " +
            "(SELECT MIN(tarif_dasar) FROM services s WHERE s.talent_id = u.id) as pricePerHour " +
            "FROM users u " +
            "LEFT JOIN profiles p ON u.id = p.talent_id " +
            "WHERE u.role = 'talent'"
        );

        boolean hasKeyword = (keyword != null && !keyword.trim().isEmpty());
        if (hasKeyword) {
            sql.append(" AND (u.nama LIKE ? OR p.bio LIKE ?)");
        }

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {

            if (hasKeyword) {
                String searchPattern = "%" + keyword + "%";
                stmt.setString(1, searchPattern);
                stmt.setString(2, searchPattern);
            }

            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Map<String, Object> talent = new HashMap<>();
                talent.put("id", rs.getString("id"));
                talent.put("nama", rs.getString("nama"));
                talent.put("bio", rs.getString("bio") != null ? rs.getString("bio") : "Belum ada bio.");
                talent.put("role", rs.getString("role"));
                talent.put("profilePhoto", rs.getString("profile_photo"));
                
                double price = rs.getDouble("pricePerHour");
                talent.put("pricePerHour", rs.wasNull() ? 0 : price);
                
                talents.add(talent);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return talents;
    }

    // 2. Mengambil Layanan berdasarkan ID Talent
    public List<ServiceItem> getServicesByTalentId(String talentId) {
        List<ServiceItem> services = new ArrayList<>();
        String sql = "SELECT * FROM services WHERE talent_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, talentId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                services.add(mapServiceRow(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return services;
    }

    // 3. Mengambil detail layanan berdasarkan ID Layanan
    public ServiceItem getServiceById(String serviceId) {
        String sql = "SELECT * FROM services WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, serviceId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapServiceRow(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    // 4. Mengambil semua layanan
    public List<ServiceItem> getAllServices() {
        List<ServiceItem> services = new ArrayList<>();
        String sql = "SELECT * FROM services";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                services.add(mapServiceRow(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return services;
    }

    // Helper: mapping ResultSet ke ServiceItem
    private ServiceItem mapServiceRow(ResultSet rs) throws SQLException {
        ServiceItem item = new ServiceItem();
        item.setId(rs.getString("id"));
        item.setTalentId(rs.getString("talent_id"));
        item.setNamaLayanan(rs.getString("nama_layanan"));
        item.setTarifDasar(rs.getDouble("tarif_dasar"));
        item.setDeskripsi(rs.getString("deskripsi"));
        return item;
    }
}
