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

    // POST /api/auth/register
    public void register(Context ctx) {
        try {
            User newUser = ctx.bodyAsClass(User.class);
            newUser.setId(UUID.randomUUID().toString());
            authService.registerUser(newUser);

            ctx.status(201).json(Map.of(
                "status", "success",
                "message", "Registrasi akun berhasil!",
                "data", newUser
            ));
        } catch (Exception e) {
            ctx.status(400).json(Map.of(
                "status", "error",
                "message", e.getMessage() != null ? e.getMessage() : "Data registrasi tidak valid."
            ));
        }
    }

    // POST /api/auth/login
    public void login(Context ctx) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, String> credentials = ctx.bodyAsClass(Map.class);
            String email    = credentials.get("email");
            String password = credentials.get("password");

            User loggedInUser = authService.verifyLogin(email, password);

            if (loggedInUser != null) {
                ctx.status(200).json(Map.of(
                    "status", "success",
                    "message", "Login berhasil!",
                    "user", loggedInUser
                ));
            } else {
                ctx.status(401).json(Map.of(
                    "status", "error",
                    "message", "Email atau password salah."
                ));
            }
        } catch (Exception e) {
            ctx.status(400).json(Map.of(
                "status", "error",
                "message", e.getMessage() != null ? e.getMessage() : "Format request tidak valid."
            ));
        }
    }
}