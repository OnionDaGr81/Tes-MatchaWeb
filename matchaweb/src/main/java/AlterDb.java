import com.matcha.util.DBUtil;
import java.sql.Connection;
import java.sql.Statement;

public class AlterDb {
    public static void main(String[] args) {
        try (Connection conn = DBUtil.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
            System.out.println("Column added successfully or already exists.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
