package com.matcha.model;

public class Review {
    private String id;
    private String bookingId;
    private int score; // Rating 1-5
    private String comment;

    public Review() {}

    // --- Getter & Setter ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}