package com.matcha;

import com.matcha.controller.AuthController;
import com.matcha.controller.UserController;
import com.matcha.controller.CatalogController;
import com.matcha.controller.BookingController;
import com.matcha.controller.PaymentController;
import com.matcha.controller.ReviewController;
import com.matcha.controller.NotificationController;

import io.javalin.Javalin;
import static io.javalin.apibuilder.ApiBuilder.*;
import java.io.InputStream;
import java.util.Map;

public class MatchaApp {
    public static void main(String[] args) {
        AuthController authController          = new AuthController();
        UserController userController          = new UserController();
        CatalogController catalogController    = new CatalogController();
        BookingController bookingController    = new BookingController();
        PaymentController paymentController    = new PaymentController();
        ReviewController reviewController      = new ReviewController();
        NotificationController notifController = new NotificationController();

        Javalin app = Javalin.create(config -> {
            config.router.apiBuilder(() -> {
                path("api", () -> {

                    // --- Auth ---
                    path("auth", () -> {
                        post("register", ctx -> authController.register(ctx));
                        post("login",    ctx -> authController.login(ctx));
                    });

                    // --- Users ---
                    path("users", () -> {
                        get(ctx -> userController.fetchAllUsers(ctx));
                        get("{userId}",               ctx -> userController.getUserById(ctx));
                        put("{userId}",               ctx -> userController.updateUser(ctx));
                        delete("{userId}",            ctx -> userController.deleteUser(ctx));
                        get("{userId}/notifications", ctx -> notifController.getUserNotifications(ctx));
                    });

                    // --- Catalog ---
                    path("talents", () -> {
                        get(ctx -> catalogController.getAllTalents(ctx));
                        get("{talentId}/services", ctx -> catalogController.getTalentServices(ctx));
                        get("{talentId}/reviews",  ctx -> reviewController.getTalentReviews(ctx));
                    });

                    path("services", () -> {
                        get(ctx -> catalogController.getAllServices(ctx));
                        get("{serviceId}", ctx -> catalogController.getServiceById(ctx));
                    });

                    // --- Bookings ---
                    path("bookings", () -> {
                        post(ctx -> bookingController.createBooking(ctx));
                        get(ctx -> bookingController.getBookingHistory(ctx));
                        get("{bookingId}", ctx -> bookingController.getBookingById(ctx));
                        put("{bookingId}/status", ctx -> bookingController.updateBookingStatus(ctx));
                    });

                    // --- Payments ---
                    path("payments", () -> {
                        post("invoice", ctx -> paymentController.createInvoice(ctx));
                        post("pay",     ctx -> paymentController.payInvoice(ctx));
                    });

                    // --- Reviews ---
                    path("reviews", () -> {
                        post(ctx -> reviewController.createReview(ctx));
                    });

                    // --- Notifications ---
                    path("notifications", () -> {
                        post(ctx -> notifController.createNotification(ctx));
                    });
                });
            });
        });

        // === SERVE STATIC HTML FILES MANUAL (kompatibel dengan fat-JAR) ===
        String[] pages = {"index", "login", "app", "catalog", "dashboard-client", "dashboard-talent",
                          "booking-confirmation", "my-bookings", "notifications",
                          "payment", "profile", "review"};

        for (String page : pages) {
            final String fileName = page + ".html";
            io.javalin.http.Handler servePage = ctx -> {
                java.io.InputStream is = MatchaApp.class.getResourceAsStream("/public/" + fileName);
                if (is != null) {
                    ctx.contentType("text/html");
                    ctx.result(is);
                } else {
                    ctx.status(404).result("Halaman tidak ditemukan.");
                }
            };

            // Register both '/page.html' and '/page' (and '/' for index) to be forgiving
            String htmlPath = "/" + (page.equals("index") ? "" : page + ".html");
            String shortPath = "/" + (page.equals("index") ? "index" : page);

            app.get(htmlPath, servePage);
            // avoid duplicate root mapping
            if (!htmlPath.equals(shortPath)) {
                app.get(shortPath, servePage);
            }
        }

        // Serve CSS
        app.get("/css/<path>", ctx -> {
            java.io.InputStream is = MatchaApp.class.getResourceAsStream("/public/css/" + ctx.pathParam("path"));
            if (is != null) { ctx.contentType("text/css").result(is); }
            else { ctx.status(404); }
        });

        // Serve JS
        app.get("/js/<path>", ctx -> {
            String jsPath = ctx.path().substring("/js/".length());
            java.io.InputStream is = MatchaApp.class.getResourceAsStream("/public/js/" + jsPath);
            if (is != null) { ctx.contentType("application/javascript").result(is); }
            else { ctx.status(404); }
        });

        // === GLOBAL EXCEPTION HANDLER ===
        app.exception(Exception.class, (e, ctx) -> {
            System.err.println("[ERROR] " + e.getClass().getSimpleName() + ": " + e.getMessage());
            ctx.status(500).json(java.util.Map.of(
                "status", "error",
                "message", "Terjadi kesalahan internal pada server."
            ));
        });

        // === 404 HANDLER — hanya untuk /api, bukan halaman HTML ===
        app.error(404, ctx -> {
            if (ctx.path().startsWith("/api/")) {
                // Hanya overwrite jika response body masih kosong (artinya benar-benar route tidak ada, bukan dari controller)
                if (ctx.result() == null || ctx.result().isEmpty()) {
                    ctx.json(java.util.Map.of("status", "error", "message", "Endpoint tidak ditemukan."));
                }
            }
        });

        app.start(7070);
        System.out.println("✅ Server Matcha berjalan di http://localhost:7070");
    }
}