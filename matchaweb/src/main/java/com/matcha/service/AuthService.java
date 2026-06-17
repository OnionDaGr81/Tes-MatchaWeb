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

    // --- FUNGSI HASHING SHA-256 ---
    public String hashPassword(String plainTextPassword) {
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
        if (newUser.getNama() == null || newUser.getNama().isBlank()) {
            throw new Exception("Nama tidak boleh kosong.");
        }
        if (newUser.getEmail() == null || newUser.getEmail().isBlank()) {
            throw new Exception("Email tidak boleh kosong.");
        }
        if (newUser.getPassword() == null || newUser.getPassword().length() < 6) {
            throw new Exception("Password minimal 6 karakter.");
        }
        if (newUser.getRole() == null || (!newUser.getRole().equalsIgnoreCase("CLIENT") && !newUser.getRole().equalsIgnoreCase("TALENT"))) {
            throw new Exception("Role harus 'CLIENT' atau 'TALENT'.");
        }

        // Cek email duplikat
        if (userRepository.findByEmail(newUser.getEmail()) != null) {
            throw new Exception("Email sudah digunakan!");
        }

        // Hash password sebelum simpan
        newUser.setPassword(hashPassword(newUser.getPassword()));
        return userRepository.saveUser(newUser);
    }

    // --- LOGIKA LOGIN ---
    // Mendukung password plaintext (data lama/seed) DAN password yang sudah di-hash
    public User verifyLogin(String email, String plainTextPassword) throws Exception {
        if (email == null || email.isBlank() || plainTextPassword == null || plainTextPassword.isBlank()) {
            throw new Exception("Email dan password wajib diisi.");
        }

        User user = userRepository.findByEmail(email);
        if (user == null) {
            return null; // Email tidak ditemukan
        }

        String hashedInput = hashPassword(plainTextPassword);
        String storedPassword = user.getPassword();

        // Cek hash dulu, kalau tidak cocok coba plaintext (untuk seed data lama)
        if (storedPassword.equals(hashedInput) || storedPassword.equals(plainTextPassword)) {
            return user;
        }

        return null; // Password salah
    }
}