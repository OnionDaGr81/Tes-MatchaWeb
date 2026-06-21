package com.matcha.controller;

import com.matcha.model.Notification;
import com.matcha.service.NotificationService;
import io.javalin.http.Context;
import java.util.List;
import java.util.Map;

public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController() {
        this.notificationService = new NotificationService();
    }

    // POST /api/notifications
    public void createNotification(Context ctx) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, String> body = ctx.bodyAsClass(Map.class);

            String recipientId = body.get("recipientId");
            String message     = body.get("message");

            if (recipientId == null || recipientId.isBlank()) {
                ctx.status(400).json(Map.of("status", "error", "message", "recipientId wajib diisi.")); return;
            }
            if (message == null || message.isBlank()) {
                ctx.status(400).json(Map.of("status", "error", "message", "message wajib diisi.")); return;
            }

            Notification notif = notificationService.sendNotification(recipientId, message);

            ctx.status(201).json(Map.of(
                "status", "success",
                "message", "Notifikasi berhasil dikirim.",
                "data", notif
            ));
        } catch (Exception e) {
            ctx.status(400).json(Map.of(
                "status", "error",
                "message", e.getMessage() != null ? e.getMessage() : "Gagal mengirim notifikasi."
            ));
        }
    }

    // GET /api/users/{userId}/notifications
    public void getUserNotifications(Context ctx) {
        try {
            String userId = ctx.pathParam("userId");
            List<Notification> notifications = notificationService.getUserNotifications(userId);
            ctx.status(200).json(Map.of(
                "status", "success",
                "data", notifications
            ));
        } catch (Exception e) {
            ctx.status(500).json(Map.of(
                "status", "error",
                "message", "Terjadi kesalahan saat mengambil notifikasi."
            ));
        }
    }

    // PUT /api/notifications/{notificationId}/read
    public void markAsRead(Context ctx) {
        try {
            String notificationId = ctx.pathParam("notificationId");
            notificationService.markAsRead(notificationId);
            ctx.status(200).json(Map.of("status", "success", "message", "Notifikasi ditandai dibaca"));
        } catch (Exception e) {
            ctx.status(500).json(Map.of("status", "error", "message", "Gagal mengupdate."));
        }
    }
}