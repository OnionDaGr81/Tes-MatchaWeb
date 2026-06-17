package com.matcha.controller;

import com.matcha.model.Review;
import com.matcha.service.ReviewService;
import io.javalin.http.Context;
import java.util.List;
import java.util.Map;

public class ReviewController {
    
    private final ReviewService reviewService;

    public ReviewController() {
        this.reviewService = new ReviewService();
    }

    // ENDPOINT 1: Kirim Ulasan Baru (Akses: POST /api/reviews)
    public void createReview(Context ctx) {
        try {
            Map<String, Object> body = ctx.bodyAsClass(Map.class);
            String bookingId = (String) body.get("bookingId");
            
            // Konversi tipe data dengan aman, default ke 0 jika gagal
            int score = Integer.parseInt(body.getOrDefault("score", "0").toString());
            String comment = (String) body.getOrDefault("comment", "");

            Review review = reviewService.addReview(bookingId, score, comment);

            ctx.status(201).json(Map.of(
                "status", "success",
                "message", "Ulasan berhasil dikirim. Terima kasih atas feedback-nya!",
                "data", review
            ));
        } catch (Exception e) {
            ctx.status(400).json(Map.of(
                "status", "error",
                "message", e.getMessage() != null ? e.getMessage() : "Gagal mengirim ulasan. Pastikan format data benar."
            ));
        }
    }

    // ENDPOINT 2: Lihat Ulasan Talent (Akses: GET /api/talents/{talentId}/reviews)
    public void getTalentReviews(Context ctx) {
        try {
            String talentId = ctx.pathParam("talentId");
            List<Review> reviews = reviewService.getTalentReviews(talentId);

            ctx.status(200).json(Map.of(
                "status", "success",
                "message", "Berhasil mengambil ulasan talent.",
                "data", reviews
            ));
        } catch (Exception e) {
            ctx.status(500).json(Map.of(
                "status", "error",
                "message", "Terjadi kesalahan pada server saat mengambil ulasan."
            ));
        }
    }
}