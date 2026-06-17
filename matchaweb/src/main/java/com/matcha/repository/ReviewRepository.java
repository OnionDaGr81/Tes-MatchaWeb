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

    // 2. Ambil Semua Ulasan untuk Satu Talent (Menggunakan JOIN)
    public List<Review> getReviewsByTalentId(String talentId) {
        List<Review> reviews = new ArrayList<>();
        // Menggabungkan tabel reviews dan bookings
        String sql = "SELECT r.* FROM reviews r " +
                     "JOIN bookings b ON r.booking_id = b.id " +
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
                reviews.add(rev);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return reviews;
    }
}