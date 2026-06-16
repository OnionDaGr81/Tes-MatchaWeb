package com.matcha.model;

public interface IPayable {
    boolean processPayment();
    void generateReceipt();
}
