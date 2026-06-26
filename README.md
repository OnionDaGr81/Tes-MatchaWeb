## 4. Konfigurasi Aplikasi

### 4.1 Requirement

- Java Development Kit (JDK) versi 17 atau lebih baru
- Apache Maven 3.6+
- MariaDB / MySQL Server yang berjalan di `localhost:3306`

### 4.2 Setup Database

Buat database dan import skema:

```sql
CREATE DATABASE matcha_db;
```

```bash
mysql -u root -p matcha_db < database/matcha_db.sql
```

Atau gunakan tool seperti **HeidiSQL** / **phpMyAdmin** untuk import file `matcha_db.sql`.

### 4.3 Konfigurasi Koneksi Database

Sesuaikan kredensial database di file berikut:

`src/main/java/com/matcha/util/DBUtil.java`

```java
private static final String URL  = "jdbc:mariadb://localhost:3306/matcha_db";
private static final String USER = "root";   // sesuaikan
private static final String PASS = "";       // sesuaikan
```

### 4.4 Menjalankan Aplikasi

**Opsi A** — Jalankan langsung dari JAR yang sudah tersedia:

```bash
java -jar target/matchaweb-1.0-SNAPSHOT-jar-with-dependencies.jar
```

**Opsi B** — Build ulang dari source code:

```bash
mvn clean package
java -jar target/matchaweb-1.0-SNAPSHOT-jar-with-dependencies.jar
```

Aplikasi dapat diakses di: `http://localhost:7070`

---

## 5. Akun Default untuk Pengujian

Berikut akun yang sudah tersedia setelah import database:

| Role   | Email                      | Password | Nama                        |
|--------|----------------------------|----------|-----------------------------|
| CLIENT | DiditLemonTea@gmail.com    | 12345    | Didit Suyou Putra Lemon Tea |
| TALENT | haneil@gmail.com           | 12345    | Haniel J.S                  |

---

## 6. Struktur Project

```
matchaweb/
├── src/main/java/com/matcha/
│   ├── MatchaApp.java          ← Entry point, routing, exception handler
│   ├── controller/             ← Auth, Booking, Catalog, Payment, Review, ...
│   ├── service/                ← Business logic per fitur
│   ├── repository/             ← Akses database (JDBC)
│   ├── model/                  ← POJO: User, Booking, Payment, ...
│   └── util/DBUtil.java        ← Koneksi database
├── src/main/resources/public/  ← Frontend (HTML, CSS, JS)
├── database/matcha_db.sql      ← Skema + data awal database
└── pom.xml                     ← Konfigurasi Maven & dependencies
```
