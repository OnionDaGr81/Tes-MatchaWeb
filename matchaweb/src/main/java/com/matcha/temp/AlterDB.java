package com.matcha.temp;
import com.matcha.util.DBUtil;
import java.sql.Connection;
import java.sql.Statement;
public class AlterDB {
    public static void main(String[] args) {
        try (Connection conn = DBUtil.getConnection();
             Statement stmt = conn.createStatement()) {
            
            try {
                stmt.executeUpdate("ALTER TABLE notifications ADD COLUMN type VARCHAR(50) DEFAULT 'system'");
                System.out.println("Added type");
            } catch (Exception e) {}
            
            try {
                stmt.executeUpdate("ALTER TABLE notifications ADD COLUMN title VARCHAR(100) DEFAULT 'Notifikasi'");
                System.out.println("Added title");
            } catch (Exception e) {}
            
            try {
                stmt.executeUpdate("ALTER TABLE notifications ADD COLUMN action_url VARCHAR(255)");
                System.out.println("Added action_url");
            } catch (Exception e) {}
            
            try {
                stmt.executeUpdate("ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE");
                System.out.println("Added is_read");
            } catch (Exception e) {}
            
            System.out.println("DB alteration complete.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
