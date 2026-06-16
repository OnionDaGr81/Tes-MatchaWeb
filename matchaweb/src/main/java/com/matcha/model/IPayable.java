/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package matcha.model;

/**
 *
 * Modul 4: Kalkulasi Tarif dan Transaksi
 */
public interface IPayable {
    boolean processPayment();
    void generateReceipt();
}
