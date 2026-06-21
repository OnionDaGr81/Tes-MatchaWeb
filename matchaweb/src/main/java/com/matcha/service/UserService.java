package com.matcha.service;

import com.matcha.model.User;
import com.matcha.repository.UserRepository;
import java.util.List;

public class UserService {

    private final UserRepository userRepository;

    public UserService() {
        this.userRepository = new UserRepository();
    }

    public List<User> getAllUsers() {
        return userRepository.getAllUsers();
    }

    public User getUserById(String userId) {
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("User ID tidak boleh kosong.");
        }
        return userRepository.getUserById(userId);
    }

    public boolean updateUser(String userId, User updatedUser) throws Exception {
        if (userId == null || userId.isEmpty()) {
            throw new Exception("User ID tidak boleh kosong.");
        }
        // Cek user ada atau tidak sebelum update
        User existing = userRepository.getUserById(userId);
        if (existing == null) {
            throw new Exception("User dengan ID '" + userId + "' tidak ditemukan.");
        }

        // Merge (Partial Update) agar field yang tidak dikirim tidak menjadi null
        if (updatedUser.getNama() == null) updatedUser.setNama(existing.getNama());
        if (updatedUser.getEmail() == null) updatedUser.setEmail(existing.getEmail());
        if (updatedUser.getNoTelp() == null) updatedUser.setNoTelp(existing.getNoTelp());
        if (updatedUser.getProfilePhoto() == null) updatedUser.setProfilePhoto(existing.getProfilePhoto());
        if (updatedUser.getBio() == null) updatedUser.setBio(existing.getBio());

        boolean success = userRepository.updateUser(userId, updatedUser);
        if (!success) {
            throw new Exception("Gagal mengupdate data user.");
        }
        return true;
    }

    public boolean deleteUser(String userId) throws Exception {
        if (userId == null || userId.isEmpty()) {
            throw new Exception("User ID tidak boleh kosong.");
        }
        // Cek user ada atau tidak sebelum hapus
        User existing = userRepository.getUserById(userId);
        if (existing == null) {
            throw new Exception("User dengan ID '" + userId + "' tidak ditemukan.");
        }
        boolean success = userRepository.deleteUser(userId);
        if (!success) {
            throw new Exception("Gagal menghapus user.");
        }
        return true;
    }
}