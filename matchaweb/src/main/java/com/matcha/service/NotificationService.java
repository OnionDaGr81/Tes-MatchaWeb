package com.matcha.service;

import com.matcha.model.Notification;
import com.matcha.repository.NotificationRepository;
import java.util.List;
import java.util.UUID;

public class NotificationService {
    
    private final NotificationRepository notificationRepository;

    public NotificationService() {
        this.notificationRepository = new NotificationRepository();
    }

    // --- Logika 1: Kirim Notifikasi ---
    public Notification sendNotification(String recipientId, String message) throws Exception {
        if (recipientId == null || recipientId.isEmpty() || message == null || message.isEmpty()) {
            throw new Exception("ID Penerima dan isi pesan tidak boleh kosong.");
        }

        Notification notif = new Notification();
        notif.setId("NOTIF-" + UUID.randomUUID().toString().substring(0, 8)); // Generate ID unik
        notif.setRecipientId(recipientId);
        notif.setMessage(message);

        boolean success = notificationRepository.createNotification(notif);
        if (!success) {
            throw new Exception("Gagal menyimpan notifikasi ke database.");
        }
        return notif;
    }

    // --- Logika 2: Tarik Semua Notifikasi User ---
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.getNotificationsByUserId(userId);
    }
}