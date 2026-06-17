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

    // POST /api/reviews
    public void createReview(Context ctx) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> body = ctx.bodyAsClass(Map.class);

            String bookingId = (String) body.get("bookingId");
            if (bookingId == null || bookingId.isBlank()) {
                ctx.status(400).json(Map.of("status", "error", "message", "bookingId wajib diisi.")); return;
            }

            int score;
            try {
                score = Integer.parseInt(body.getOrDefault("score", "0").toString());
            } catch (NumberFormatException e) {
                ctx.status(400).json(Map.of("status", "error", "message", "Score harus berupa angka.")); return;
            }

            String comment = body.getOrDefault("comment", "").toString();
            Review review = reviewService.addReview(bookingId, score, comment);

            ctx.status(201).json(Map.of(
                "status", "success",
                "message", "Ulasan berhasil dikirim. Terima kasih atas feedback-nya!",
                "data", review
            ));
        } catch (Exception e) {
            ctx.status(400).json(Map.of(
                "status", "error",
                "message", e.getMessage() != null ? e.getMessage() : "Gagal mengirim ulasan."
            ));
        }
    }

    // GET /api/talents/{talentId}/reviews
    public void getTalentReviews(Context ctx) {
        try {
            String talentId = ctx.pathParam("talentId");
            List<Review> reviews = reviewService.getTalentReviews(talentId);
            ctx.status(200).json(Map.of(
                "status", "success",
                "data", reviews
            ));
        } catch (Exception e) {
            ctx.status(500).json(Map.of(
                "status", "error",
                "message", "Terjadi kesalahan saat mengambil ulasan."
            ));
        }
    }
}