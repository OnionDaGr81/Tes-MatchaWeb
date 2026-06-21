package com.matcha.model;

import java.time.LocalDateTime;

public class Notification {
    private String id;
    private String recipientId;
    private String message;
    private LocalDateTime timestamp;
    private boolean isRead;

    public Notification() {}

    // --- Getter & Setter ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean isRead) { this.isRead = isRead; }
}