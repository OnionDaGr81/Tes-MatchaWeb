package com.matcha.repository;
import com.matcha.model.Booking;
import com.matcha.util.DBUtil;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class BookingRepository {

    public boolean isTalentAvailable(String talentId, LocalDateTime requestStart, LocalDateTime requestEnd) {
        String sql = "SELECT COUNT(*) FROM bookings " +
                     "WHERE talent_id = ? AND status != 'CANCELLED' " +
                     "AND (waktu_mulai < ?) AND (waktu_selesai > ?)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, talentId);
            stmt.setTimestamp(2, Timestamp.valueOf(requestEnd));
            stmt.setTimestamp(3, Timestamp.valueOf(requestStart));
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt(1) == 0;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

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
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // ← tambah ini
    public List<Booking> getAllBookings() {
        List<Booking> list = new ArrayList<>();
        String sql = "SELECT * FROM bookings";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                Booking b = new Booking();
                b.setId(rs.getString("id"));
                b.setClientId(rs.getString("client_id"));
                b.setTalentId(rs.getString("talent_id"));
                b.setServiceId(rs.getString("service_id"));
                b.setWaktuMulai(rs.getTimestamp("waktu_mulai").toLocalDateTime());
                b.setWaktuSelesai(rs.getTimestamp("waktu_selesai").toLocalDateTime());
                b.setStatus(rs.getString("status"));
                list.add(b);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    // --- 3. Mengambil Riwayat Booking Berdasarkan User ID & Role ---
    public List<Booking> getBookingsByUserId(String userId, String role) {
        List<Booking> bookings = new ArrayList<>(); // Ingat import java.util.ArrayList; & java.util.List;
        
        // Cek apakah yang meminta data adalah client atau talent
        String columnFilter = role.equalsIgnoreCase("talent") ? "talent_id" : "client_id";
        String sql = "SELECT * FROM bookings WHERE " + columnFilter + " = ? ORDER BY waktu_mulai DESC";
        
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, userId);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                Booking b = new Booking();
                b.setId(rs.getString("id"));
                b.setClientId(rs.getString("client_id"));
                b.setTalentId(rs.getString("talent_id"));
                b.setServiceId(rs.getString("service_id"));
                
                // Konversi Timestamp MariaDB kembali ke LocalDateTime Java
                if (rs.getTimestamp("waktu_mulai") != null) {
                    b.setWaktuMulai(rs.getTimestamp("waktu_mulai").toLocalDateTime());
                }
                if (rs.getTimestamp("waktu_selesai") != null) {
                    b.setWaktuSelesai(rs.getTimestamp("waktu_selesai").toLocalDateTime());
                }
                
                b.setStatus(rs.getString("status"));
                bookings.add(b);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return bookings;
    }

    // --- 4. Mengubah Status Booking ---
    public boolean updateBookingStatus(String bookingId, String newStatus) {
        String sql = "UPDATE bookings SET status = ? WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, newStatus);
            stmt.setString(2, bookingId);
            
            int rowsUpdated = stmt.executeUpdate();
            return rowsUpdated > 0;
            
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // --- 5. Mengambil Detail Booking Berdasarkan ID ---
    public Booking getBookingById(String bookingId) {
        String sql = "SELECT * FROM bookings WHERE id = ?";
        
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, bookingId);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                Booking b = new Booking();
                b.setId(rs.getString("id"));
                b.setClientId(rs.getString("client_id"));
                b.setTalentId(rs.getString("talent_id"));
                b.setServiceId(rs.getString("service_id"));
                
                // Konversi Timestamp MariaDB kembali ke LocalDateTime Java
                if (rs.getTimestamp("waktu_mulai") != null) {
                    b.setWaktuMulai(rs.getTimestamp("waktu_mulai").toLocalDateTime());
                }
                if (rs.getTimestamp("waktu_selesai") != null) {
                    b.setWaktuSelesai(rs.getTimestamp("waktu_selesai").toLocalDateTime());
                }
                
                b.setStatus(rs.getString("status"));
                return b;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null; // Mengembalikan null jika ID tidak ditemukan
    }
}