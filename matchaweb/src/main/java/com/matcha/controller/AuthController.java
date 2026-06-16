package com.matcha.controller;

import com.matcha.model.User;
import com.matcha.service.AuthService;
import io.javalin.http.Context;
import java.util.Map;
import java.util.UUID;

public class AuthController {
    
    private final AuthService authService;

    public AuthController() {
        this.authService = new AuthService();
    }

    // --- ENDPOINT REGISTER ---
    public void register(Context ctx) {
        try {
            // 1. Tangkap JSON dari frontend
            User newUser = ctx.bodyAsClass(User.class);
            
            // 2. Generate UUID untuk ID
            newUser.setId(UUID.randomUUID().toString());
            
            // 3. Panggil Service untuk simpan ke database (akan melempar Exception jika email duplikat)
            authService.registerUser(newUser);

            // 4. Jika berhasil melewati baris di atas, kirim response sukses
            ctx.status(201).json(Map.of(
                "status", "success",
                "message", "Registrasi akun berhasil!",
                "data", newUser
            ));

        } catch (Exception e) {
            // Jika frontend kirim data salah ATAU Service menolak (email duplikat)
            ctx.status(400).json(Map.of(
                "status", "error",
                // Mengambil pesan error asli dari AuthService ("Email sudah digunakan!")
                "message", e.getMessage() != null ? e.getMessage() : "Data registrasi tidak valid." 
            ));
        }
    }

    // --- ENDPOINT LOGIN ---
    public void login(Context ctx) {
        try {
            // 1. Tangkap payload JSON
            Map<String, String> credentials = ctx.bodyAsClass(Map.class);
            String email = credentials.get("email");
            String password = credentials.get("password");

            // 2. Cek ke database melalui Service
            User loggedInUser = authService.verifyLogin(email, password);

            // 3. Tentukan response berdasarkan hasil kembalian dari Service
            if (loggedInUser != null) {
                // Login Sukses
                ctx.status(200).json(Map.of(
                    "status", "success",
                    "message", "Login berhasil!",
                    "user", loggedInUser
                ));
            } else {
                // Login Gagal (Email/Password salah)
                ctx.status(401).json(Map.of(
                    "status", "error",
                    "message", "Email atau password salah."
                ));
            }
        } catch (Exception e) {
            // Mencegah error jika JSON yang dikirim frontend formatnya rusak
            ctx.status(400).json(Map.of(
                "status", "error",
                "message", "Format request tidak valid."
            ));
        }
    }
}