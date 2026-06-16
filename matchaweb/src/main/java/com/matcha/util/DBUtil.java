package com.matcha.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBUtil {
    private static final String URL = "jdbc:mariadb://localhost:3306/matcha_db"; // Sesuaikan nama DB
    private static final String USER = "root"; // Sesuaikan user MariaDB
    private static final String PASS = "";     // Sesuaikan password MariaDB

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASS);
    }
}