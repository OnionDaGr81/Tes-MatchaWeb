package com.matcha.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Notification {
    private String id;
    private String recipientId;
    private String message;
    private String type;
    private String title;
    private String actionUrl;
    private String createdAt;
    
    @JsonProperty("isRead")
    private boolean isRead;

    public Notification() {}

    // --- Getter & Setter ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    @JsonProperty("isRead")
    public boolean getIsRead() { return isRead; }
    
    @JsonProperty("isRead")
    public void setIsRead(boolean isRead) { this.isRead = isRead; }
}