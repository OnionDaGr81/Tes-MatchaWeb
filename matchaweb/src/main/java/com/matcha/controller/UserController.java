package com.matcha.controller;

import com.matcha.service.UserService;
import io.javalin.http.Context;

public class UserController {
    private final UserService userService;

    public UserController() {
        this.userService = new UserService();
    }

    // Fungsi ini akan dipanggil oleh Javalin
    public void fetchAllUsers(Context ctx) {
        ctx.json(userService.getAllUsers()); // Otomatis jadi JSON berkat Jackson
    }

    public void getUserById(Context ctx) {
        String userId = ctx.pathParam("userId");
        ctx.json(userService.getUserById(userId));
    }

    public void updateUser(Context ctx) {
        String userId = ctx.pathParam("userId");
        // Di sini kita bisa parsing body JSON untuk mendapatkan data update
        // Misalnya, kita bisa menggunakan ctx.bodyAsClass(User.class) untuk mendapatkan objek User dari JSON
        // Kemudian kita bisa memanggil userService.updateUser(userId, updatedUser);
        // Tapi untuk sekarang, kita hanya akan mengembalikan pesan sederhana
        ctx.result("Update user dengan ID: " + userId);
    }

    public void deleteUser(Context ctx) {
        String userId = ctx.pathParam("userId");
        // Di sini kita bisa memanggil userService.deleteUser(userId);
        // Tapi untuk sekarang, kita hanya akan mengembalikan pesan sederhana
        ctx.result("Delete user dengan ID: " + userId);
    }
}