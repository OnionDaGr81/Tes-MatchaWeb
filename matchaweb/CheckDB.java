import com.matcha.util.DBUtil;
import java.sql.*;

public class CheckDB {
    public static void main(String[] args) {
        try (Connection conn = DBUtil.getConnection()) {
            System.out.println("=== USERS ===");
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT * FROM users")) {
                while (rs.next()) {
                    System.out.printf("ID: %s, Nama: %s, Email: %s, Role: %s\n",
                        rs.getString("id"), rs.getString("nama"), rs.getString("email"), rs.getString("role"));
                }
            }

            System.out.println("=== SERVICES ===");
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT * FROM services")) {
                while (rs.next()) {
                    System.out.printf("ID: %s, TalentID: %s, Nama: %s, Tarif: %f\n",
                        rs.getString("id"), rs.getString("talent_id"), rs.getString("nama_layanan"), rs.getDouble("tarif_dasar"));
                }
            }

            System.out.println("=== BOOKINGS ===");
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT * FROM bookings")) {
                while (rs.next()) {
                    System.out.printf("ID: %s, ClientID: %s, TalentID: %s, ServiceID: %s, Status: %s, Mulai: %s, Selesai: %s\n",
                        rs.getString("id"), rs.getString("client_id"), rs.getString("talent_id"), rs.getString("service_id"), 
                        rs.getString("status"), rs.getTimestamp("waktu_mulai"), rs.getTimestamp("waktu_selesai"));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
