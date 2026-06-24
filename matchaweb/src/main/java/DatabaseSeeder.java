import com.matcha.util.DBUtil;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.UUID;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class DatabaseSeeder {

    public static String hashPassword(String plainTextPassword) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(plainTextPassword.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Gagal", e);
        }
    }

    public static void main(String[] args) {
        try (Connection conn = DBUtil.getConnection()) {
            String insertUser = "INSERT INTO users (id, nama, email, password, no_telp, role, profile_photo) VALUES (?, ?, ?, ?, ?, ?, ?)";
            try (PreparedStatement pstmt = conn.prepareStatement(insertUser)) {
                String[][] users = {
                    {"Alice Client", "alice@client.com", "CLIENT", "https://i.pravatar.cc/150?u=alice"},
                    {"Bob Client", "bob@client.com", "CLIENT", "https://i.pravatar.cc/150?u=bob"},
                    {"Charlie Talent", "charlie@talent.com", "TALENT", "https://i.pravatar.cc/150?u=charlie"},
                    {"Diana Talent", "diana@talent.com", "TALENT", "https://i.pravatar.cc/150?u=diana"},
                    {"Eve Talent", "eve@talent.com", "TALENT", "https://i.pravatar.cc/150?u=eve"}
                };

                for (String[] u : users) {
                    String id = UUID.randomUUID().toString();
                    pstmt.setString(1, id);
                    pstmt.setString(2, u[0]);
                    pstmt.setString(3, u[1]);
                    pstmt.setString(4, hashPassword("123456"));
                    pstmt.setString(5, "081234567890");
                    pstmt.setString(6, u[2]);
                    pstmt.setString(7, u[3]);
                    try {
                        pstmt.executeUpdate();
                        System.out.println("Inserted: " + u[0]);
                    } catch (Exception e) {
                        System.out.println("Failed to insert " + u[0] + ": " + e.getMessage());
                    }
                }
            }
            System.out.println("Seeding completed successfully.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
