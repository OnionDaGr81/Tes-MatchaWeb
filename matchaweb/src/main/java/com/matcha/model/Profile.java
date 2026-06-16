package com.matcha.model;

public class Profile {
    private String id;
    private String talentId;
    private String bio;

    public Profile() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTalentId() { return talentId; }
    public void setTalentId(String talentId) { this.talentId = talentId; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}