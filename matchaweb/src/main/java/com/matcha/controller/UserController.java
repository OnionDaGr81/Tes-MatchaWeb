package com.matcha.controller;

import com.matcha.model.User;
import com.matcha.service.UserService;
import io.javalin.http.Context;
import java.util.List;
import java.util.Map;

public class UserController {

    private final UserService userService;

    public UserController() {
        this.userService = new UserService();
    }

    // GET /api/users
    public void fetchAllUsers(Context ctx) {
        try {
            List<User> users = userService.getAllUsers();
            ctx.status(200).json(Map.of("status", "success", "data", users));
        } catch (Exception e) {
            ctx.status(500).json(Map.of("status", "error", "message", "Gagal mengambil data user."));
        }
    }

    // GET /api/users/{userId}
    public void getUserById(Context ctx) {
        try {
            String userId = ctx.pathParam("userId");
            User user = userService.getUserById(userId);
            if (user != null) {
                ctx.status(200).json(Map.of("status", "success", "data", user));
            } else {
                ctx.status(404).json(Map.of("status", "error", "message", "User tidak ditemukan."));
            }
        } catch (Exception e) {
            ctx.status(400).json(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    // PUT /api/users/{userId}
    public void updateUser(Context ctx) {
        try {
            String userId = ctx.pathParam("userId");
            User updatedUser = ctx.bodyAsClass(User.class);
            userService.updateUser(userId, updatedUser);
            ctx.status(200).json(Map.of(
                "status", "success",
                "message", "Data user berhasil diperbarui."
            ));
        } catch (Exception e) {
            ctx.status(400).json(Map.of(
                "status", "error",
                "message", e.getMessage() != null ? e.getMessage() : "Gagal mengupdate user."
            ));
        }
    }

    // DELETE /api/users/{userId}
    public void deleteUser(Context ctx) {
        try {
            String userId = ctx.pathParam("userId");
            userService.deleteUser(userId);
            ctx.status(200).json(Map.of(
                "status", "success",
                "message", "User berhasil dihapus."
            ));
        } catch (Exception e) {
            ctx.status(400).json(Map.of(
                "status", "error",
                "message", e.getMessage() != null ? e.getMessage() : "Gagal menghapus user."
            ));
        }
    }
}