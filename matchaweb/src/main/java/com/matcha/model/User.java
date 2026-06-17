package com.matcha.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class User {
    protected String id;
    protected String nama;
    protected String email;

    // WRITE_ONLY: bisa diterima dari JSON request, tapi TIDAK akan dikembalikan di response
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    protected String password;

    protected String noTelp;
    protected String role;
    protected String bio;

    // Constructor kosong wajib ada untuk Jackson
    public User() {}

    public boolean verifyIdentity() {
        return email != null && !email.isEmpty() && password != null && !password.isEmpty();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNama() { return nama; }
    public void setNama(String nama) { this.nama = nama; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getNoTelp() { return noTelp; }
    public void setNoTelp(String noTelp) { this.noTelp = noTelp; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}