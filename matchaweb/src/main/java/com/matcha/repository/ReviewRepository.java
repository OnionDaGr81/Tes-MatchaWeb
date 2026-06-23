package com.matcha.repository;

import com.matcha.model.Review;
import com.matcha.util.DBUtil;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ReviewRepository {

    // 1. Simpan Ulasan Baru
    public boolean createReview(Review review) {
        String sql = "INSERT INTO reviews (id, booking_id, score, comment) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, review.getId());
            stmt.setString(2, review.getBookingId());
            stmt.setInt(3, review.getScore());
            stmt.setString(4, review.getComment());
            
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 1b. Cek Ulasan Berdasarkan Booking ID
    public boolean isReviewExists(String bookingId) {
        String sql = "SELECT COUNT(*) FROM reviews WHERE booking_id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, bookingId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    // 2. Ambil Semua Ulasan untuk Satu Talent (Menggunakan JOIN)
    public List<Review> getReviewsByTalentId(String talentId) {
        List<Review> reviews = new ArrayList<>();
        // Menggunakan nama kolom eksplisit agar lebih aman
        String sql = "SELECT r.id, r.booking_id, r.score, r.comment, u.nama as client_name " +
                     "FROM reviews r " +
                     "JOIN bookings b ON r.booking_id = b.id " +
                     "JOIN users u ON b.client_id = u.id " +
                     "WHERE b.talent_id = ?";
                     
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, talentId);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                Review rev = new Review();
                rev.setId(rs.getString("id"));
                rev.setBookingId(rs.getString("booking_id"));
                rev.setScore(rs.getInt("score"));
                rev.setComment(rs.getString("comment"));
                rev.setClientName(rs.getString("client_name"));
                
                try {
                    Timestamp createdAt = rs.getTimestamp("created_at");
                    if (createdAt != null) {
                        rev.setCreatedAt(createdAt.toString());
                    }
                } catch (SQLException ex) {
                    // Abaikan jika kolom created_at tidak ada
                }
                reviews.add(rev);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return reviews;
    }

    // 3. Ambil Semua Ulasan untuk Satu Client (Menggunakan JOIN)
    public List<Review> getReviewsByClientId(String clientId) {
        List<Review> reviews = new ArrayList<>();
        // Menggunakan nama kolom eksplisit agar lebih aman
        String sql = "SELECT r.id, r.booking_id, r.score, r.comment, u.nama as talent_name " +
                     "FROM reviews r " +
                     "JOIN bookings b ON r.booking_id = b.id " +
                     "JOIN users u ON b.talent_id = u.id " +
                     "WHERE b.client_id = ?";
                     
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, clientId);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                Review rev = new Review();
                rev.setId(rs.getString("id"));
                rev.setBookingId(rs.getString("booking_id"));
                rev.setScore(rs.getInt("score"));
                rev.setComment(rs.getString("comment"));
                rev.setClientName(rs.getString("talent_name")); // Reusing clientName field to store talent's name for client view
                
                try {
                    Timestamp createdAt = rs.getTimestamp("created_at");
                    if (createdAt != null) {
                        rev.setCreatedAt(createdAt.toString());
                    }
                } catch (SQLException ex) {
                    // Abaikan jika kolom created_at tidak ada
                }
                reviews.add(rev);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return reviews;
    }
}