package com.matcha;

import com.matcha.controller.AuthController;
import com.matcha.controller.UserController;
import com.matcha.controller.CatalogController;
import com.matcha.controller.BookingController;

import io.javalin.Javalin;
import io.javalin.http.staticfiles.Location;
import static io.javalin.apibuilder.ApiBuilder.*; // untuk path(), get(), post()

public class MatchaApp {
    public static void main(String[] args) {
        // Inisialisasi semua Controller
        AuthController authController = new AuthController();
        UserController userController = new UserController();
        CatalogController catalogController = new CatalogController();
        BookingController bookingController = new BookingController();

        Javalin app = Javalin.create(config -> {
            // Setup file statis
            config.staticFiles.add("/public", Location.CLASSPATH); 
            
            // Setup Routing (Cara Baru Javalin 6)
            config.router.apiBuilder(() -> {
                path("api", () -> {
                    
                    // --- Modul 1: Auth ---
                    path("auth", () -> {
                        post("register", ctx -> authController.register(ctx));
                        post("login", ctx -> authController.login(ctx));
                    });
                    
                    // --- Modul Pengguna ---
                    path("users", () -> {
                        get(ctx -> userController.fetchAllUsers(ctx));
                        get("{userId}", ctx -> userController.getUserById(ctx));
                        put("{userId}", ctx -> userController.updateUser(ctx));
                        delete("{userId}", ctx -> userController.deleteUser(ctx));
                    });

                    // --- Modul 2: Catalog (Talent & Services) ---
                    path("talents", () -> {
                        get(ctx -> catalogController.getAllTalents(ctx));
                        get("{talentId}/services", ctx -> catalogController.getTalentServices(ctx));
                    });
                    
                    path("services", () -> {
                        get(ctx -> catalogController.getAllServices(ctx));       // ← tambah ini
                        get("{serviceId}", ctx -> catalogController.getServiceById(ctx));
                    });

                    // --- Modul 3: Bookings ---
                    path("bookings", () -> {
                        post(ctx -> bookingController.createBooking(ctx));
                        get(ctx -> bookingController.getAllBookings(ctx));       // ← tambah ini
                        get("{bookingId}", ctx -> bookingController.getBookingById(ctx)); // ← opsional 
                    });
                    
                });
            });
        }).start(7070); // Jalan di localhost:7070

        System.out.println("Server Matcha berjalan di http://localhost:7070");
    }
}