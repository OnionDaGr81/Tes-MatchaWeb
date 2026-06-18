package com.matcha.repository;

import com.matcha.model.Invoice;
import com.matcha.model.Payment;
import com.matcha.util.DBUtil;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class PaymentRepository {

    // 1. Simpan Invoice ke Database
    public boolean createInvoice(Invoice invoice) {
        String sql = "INSERT INTO invoices (id, booking_id, total_amount, extra_fee) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, invoice.getId());
            stmt.setString(2, invoice.getBookingId());
            stmt.setDouble(3, invoice.getTotalAmount());
            stmt.setDouble(4, invoice.getExtraFee());
            
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 2. Simpan Data Pembayaran ke Database
    public boolean createPayment(Payment payment) {
        String sql = "INSERT INTO payments (id, invoice_id, payment_method, payment_status) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, payment.getId());
            stmt.setString(2, payment.getInvoiceId());
            stmt.setString(3, payment.getPaymentMethod());
            stmt.setString(4, payment.getPaymentStatus());
            
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 3. Ambil Booking ID berdasarkan Invoice ID
    public String getBookingIdByInvoiceId(String invoiceId) {
        String sql = "SELECT booking_id FROM invoices WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, invoiceId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("booking_id");
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
}