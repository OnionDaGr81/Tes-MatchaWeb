package matcha.model;

import java.util.ArrayList;

public class Rating {
    private ArrayList<Integer> scoreList = new ArrayList<>();
    private double averageScore;

    public void addScore(int score) {
        scoreList.add(score);
        calculateAverageRating();
    }

    public double calculateAverageRating() {
        if (scoreList.isEmpty()) {
            averageScore = 0.0;
            return averageScore;
        }
        int total = 0;
        for (int s : scoreList) {
            total += s;
        }
        averageScore = (double) total / scoreList.size();
        return averageScore;
    }

    public double getAverageScore() {
        return averageScore;
    }

    public ArrayList<Integer> getScoreList() {
        return scoreList;
    }

    public int getTotalReviews() {
        return scoreList.size();
    }
}