package com.matcha.repository;

import com.matcha.model.Booking;
import com.matcha.util.DBUtil;
import java.sql.*;
import java.time.LocalDateTime;

public class BookingRepository {

    // 1. Logika Overlapping Intervals untuk Mencegah Double Booking
    public boolean isTalentAvailable(String talentId, LocalDateTime requestStart, LocalDateTime requestEnd) {
        // Query ini mengecek apakah ada jadwal yang beririsan dengan request klien
        // Asumsi: Jadwal yang statusnya 'CANCELLED' tidak dianggap bentrok
        String sql = "SELECT COUNT(*) FROM bookings " +
                     "WHERE talent_id = ? AND status != 'CANCELLED' " +
                     "AND (waktu_mulai < ?) AND (waktu_selesai > ?)";
                     
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, talentId);
            // Konversi LocalDateTime Java ke Timestamp SQL
            stmt.setTimestamp(2, Timestamp.valueOf(requestEnd));
            stmt.setTimestamp(3, Timestamp.valueOf(requestStart));
            
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                int overlappingCount = rs.getInt(1);
                return overlappingCount == 0; // True jika tidak ada yang bentrok (0)
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false; // Jika terjadi error database, anggap tidak tersedia agar aman
    }

    // 2. Menyimpan data Booking baru ke database
    public boolean createBooking(Booking booking) {
        String sql = "INSERT INTO bookings (id, client_id, talent_id, service_id, waktu_mulai, waktu_selesai, status) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?)";
                     
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, booking.getId());
            stmt.setString(2, booking.getClientId());
            stmt.setString(3, booking.getTalentId());
            stmt.setString(4, booking.getServiceId());
            stmt.setTimestamp(5, Timestamp.valueOf(booking.getWaktuMulai()));
            stmt.setTimestamp(6, Timestamp.valueOf(booking.getWaktuSelesai()));
            stmt.setString(7, booking.getStatus());
            
            int rowsInserted = stmt.executeUpdate();
            return rowsInserted > 0;
            
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}