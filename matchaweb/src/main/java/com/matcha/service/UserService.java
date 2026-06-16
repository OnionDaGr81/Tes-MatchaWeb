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
        // Bisa tambahkan validasi sebelum melempar ke repository jika perlu
        return userRepository.getAllUsers();
    }

    public User getUserById(String userId) {
        // Validasi input
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("User ID tidak boleh kosong");
        }
        return userRepository.getUserById(userId);
    }

    
}