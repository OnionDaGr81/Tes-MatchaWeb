package com.matcha.service;

import com.matcha.model.User;
import com.matcha.repository.UserRepository;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class AuthService {
    
    private final UserRepository userRepository;

    public AuthService() {
        this.userRepository = new UserRepository();
    }

    // --- FUNGSI KEAMANAN (Hashing) ---
    private String hashPassword(String plainTextPassword) {
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
            throw new RuntimeException("Gagal melakukan hashing password", e);
        }
    }

    // --- LOGIKA REGISTRASI ---
    public boolean registerUser(User newUser) throws Exception {
        // 1. Cek apakah email sudah terdaftar di database
        User existingUser = userRepository.findByEmail(newUser.getEmail());
        if (existingUser != null) {
            throw new Exception("Email sudah digunakan!");
        }

        // 2. Hash password sebelum masuk ke database
        String hashedPassword = hashPassword(newUser.getPassword());
        newUser.setPassword(hashedPassword);

        // 3. Simpan ke database melalui Repository
        return userRepository.saveUser(newUser);
    }

    // --- LOGIKA LOGIN ---
    public User verifyLogin(String email, String plainTextPassword) {
        // 1. Cari user di database
        User user = userRepository.findByEmail(email);
        
        // 2. Jika user ditemukan, validasi passwordnya
        if (user != null) {
            String hashedInputPassword = hashPassword(plainTextPassword);
            
            // Cocokkan password yang diinput (yang sudah di-hash) dengan hash di database
            if (user.getPassword().equals(hashedInputPassword)) {
                return user; // Login Sukses
            }
        }
        
        return null; // Login Gagal (Email tidak ada atau password salah)
    }
}