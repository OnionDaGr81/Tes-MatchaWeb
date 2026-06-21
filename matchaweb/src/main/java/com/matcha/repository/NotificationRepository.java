package com.matcha.repository;

import com.matcha.model.Notification;
import com.matcha.util.DBUtil;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class NotificationRepository {

    // 1. Simpan Notifikasi Baru
    public boolean createNotification(Notification notification) {
        String sql = "INSERT INTO notifications (id, recipient_id, message) VALUES (?, ?, ?)";
        // Catatan: timestamp otomatis diisi CURRENT_TIMESTAMP oleh MariaDB
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, notification.getId());
            stmt.setString(2, notification.getRecipientId());
            stmt.setString(3, notification.getMessage());
            
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 2. Ambil Semua Notifikasi milik seorang User (Klien / Talent)
    public List<Notification> getNotificationsByUserId(String userId) {
        List<Notification> notifications = new ArrayList<>();
        String sql = "SELECT * FROM notifications WHERE recipient_id = ? ORDER BY timestamp DESC";
        
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, userId);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                Notification notif = new Notification();
                notif.setId(rs.getString("id"));
                notif.setRecipientId(rs.getString("recipient_id"));
                notif.setMessage(rs.getString("message"));
                
                if (rs.getTimestamp("timestamp") != null) {
                    notif.setTimestamp(rs.getTimestamp("timestamp").toLocalDateTime());
                }
                
                // Add column check for is_read if possible, but simplest is to try catch or check metadata.
                // Assuming is_read is added to DB:
                try {
                    notif.setRead(rs.getBoolean("is_read"));
                } catch (SQLException ex) {
                    notif.setRead(false);
                }
                
                notifications.add(notif);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return notifications;
    }

    // 3. Tandai Notifikasi Dibaca
    public boolean markAsRead(String notificationId) {
        String sql = "UPDATE notifications SET is_read = TRUE WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, notificationId);
            return stmt.executeUpdate() > 0;
            
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}