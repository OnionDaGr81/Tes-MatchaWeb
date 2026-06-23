package com.matcha.service;

import com.matcha.model.Booking;
import com.matcha.model.Review;
import com.matcha.repository.BookingRepository;
import com.matcha.repository.ReviewRepository;
import java.util.List;
import java.util.UUID;

public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository; // Kita panggil repo booking untuk cek status

    public ReviewService() {
        this.reviewRepository = new ReviewRepository();
        this.bookingRepository = new BookingRepository();
    }

    // --- Logika 1: Tambah Ulasan Baru ---
    public Review addReview(String bookingId, int score, String comment) throws Exception {
        // Validasi Rating
        if (score < 1 || score > 5) {
            throw new Exception("Rating harus berada di antara 1 sampai 5 bintang.");
        }

        // Cek apakah booking-nya valid dan sudah selesai
        Booking booking = bookingRepository.getBookingById(bookingId);
        if (booking == null) {
            throw new Exception("Data pesanan tidak ditemukan.");
        }
        if (!"COMPLETED".equalsIgnoreCase(booking.getStatus())) {
            throw new Exception("Ulasan hanya bisa diberikan jika status pesanan sudah Selesai (COMPLETED).");
        }

        // Cek apakah booking ini sudah pernah di-review
        if (reviewRepository.isReviewExists(bookingId)) {
            throw new Exception("Anda sudah pernah memberikan ulasan untuk pesanan ini.");
        }

        // Siapkan objek Review
        Review review = new Review();
        review.setId("REV-" + UUID.randomUUID().toString().substring(0, 8));
        review.setBookingId(bookingId);
        review.setScore(score);
        review.setComment(comment);

        // Simpan ke database
        boolean success = reviewRepository.createReview(review);
        if (!success) {
            throw new Exception("Gagal menyimpan ulasan ke database.");
        }
        
        // Kirim notifikasi ke talent
        try {
            NotificationService notificationService = new NotificationService();
            String notifMsg = "Anda mendapatkan ulasan baru (" + score + " Bintang) untuk pesanan #" + bookingId;
            notificationService.sendNotification(booking.getTalentId(), "review", "Ulasan Baru", notifMsg, "/reviews-list.html");
        } catch (Exception e) {
            System.err.println("Gagal mengirim notifikasi ulasan: " + e.getMessage());
        }

        return review;
    }

    // --- Logika 2: Tarik Semua Ulasan Milik Satu Talent ---
    public List<Review> getTalentReviews(String talentId) {
        return reviewRepository.getReviewsByTalentId(talentId);
    }

    // --- Logika 3: Tarik Semua Ulasan yang diberikan Client ---
    public List<Review> getClientReviews(String clientId) {
        return reviewRepository.getReviewsByClientId(clientId);
    }
}