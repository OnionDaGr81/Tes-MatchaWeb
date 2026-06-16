package com.matcha.model; 

/**
 *
 * Modul 5: Ulasan dan Reputasi
 */
public class Review {
    private String reviewId;
    private Booking bookingRef;
    private String comment;

    public void submitReview(String komentar) {
        if (validateReviewer()) {
            this.comment = komentar;
        }
    }

    public boolean validateReviewer() {
        return bookingRef != null
                && Booking.STATUS_COMPLETED.equals(bookingRef.getStatus());
    }

    public String getReviewId() {
        return reviewId;
    }

    public void setReviewId(String reviewId) {
        this.reviewId = reviewId;
    }

    public Booking getBookingRef() {
        return bookingRef;
    }

    public void setBookingRef(Booking bookingRef) {
        this.bookingRef = bookingRef;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}