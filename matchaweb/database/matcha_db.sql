-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               12.3.2-MariaDB-log - MariaDB Server
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for matcha_db
CREATE DATABASE IF NOT EXISTS `matcha_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `matcha_db`;

-- Dumping structure for table matcha_db.bookings
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` varchar(50) NOT NULL,
  `client_id` varchar(50) DEFAULT NULL,
  `talent_id` varchar(50) DEFAULT NULL,
  `service_id` varchar(50) DEFAULT NULL,
  `waktu_mulai` datetime NOT NULL,
  `waktu_selesai` datetime NOT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` timestamp DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_bookings_client` (`client_id`),
  KEY `fk_bookings_talent` (`talent_id`),
  KEY `fk_bookings_service` (`service_id`),
  CONSTRAINT `1` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`talent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `3` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_client` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_talent` FOREIGN KEY (`talent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table matcha_db.bookings: ~0 rows (approximately)

-- Dumping structure for table matcha_db.invoices
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` varchar(50) NOT NULL,
  `booking_id` varchar(50) NOT NULL,
  `total_amount` double NOT NULL,
  `extra_fee` double DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table matcha_db.invoices: ~0 rows (approximately)

-- Dumping structure for table matcha_db.notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` varchar(50) NOT NULL,
  `recipient_id` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `recipient_id` (`recipient_id`),
  CONSTRAINT `1` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table matcha_db.notifications: ~0 rows (approximately)

-- Dumping structure for table matcha_db.payments
CREATE TABLE IF NOT EXISTS `payments` (
  `id` varchar(50) NOT NULL,
  `invoice_id` varchar(50) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`),
  CONSTRAINT `1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table matcha_db.payments: ~0 rows (approximately)

-- Dumping structure for table matcha_db.profiles
CREATE TABLE IF NOT EXISTS `profiles` (
  `id` varchar(50) NOT NULL,
  `talent_id` varchar(50) NOT NULL,
  `bio` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `talent_id` (`talent_id`),
  CONSTRAINT `1` FOREIGN KEY (`talent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table matcha_db.profiles: ~0 rows (approximately)

-- Dumping structure for table matcha_db.reviews
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` varchar(50) NOT NULL,
  `booking_id` varchar(50) NOT NULL,
  `score` int(11) NOT NULL CHECK (`score` >= 1 and `score` <= 5),
  `comment` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table matcha_db.reviews: ~0 rows (approximately)

-- Dumping structure for table matcha_db.services
CREATE TABLE IF NOT EXISTS `services` (
  `id` varchar(50) NOT NULL,
  `talent_id` varchar(50) NOT NULL,
  `nama_layanan` varchar(100) NOT NULL,
  `tarif_dasar` double NOT NULL,
  `deskripsi` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_services_talent` (`talent_id`),
  CONSTRAINT `1` FOREIGN KEY (`talent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_services_talent` FOREIGN KEY (`talent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table matcha_db.services: ~3 rows (approximately)
INSERT INTO `services` (`id`, `talent_id`, `nama_layanan`, `tarif_dasar`, `deskripsi`) VALUES
	('SRV001', 'TL001', 'Teman Mabar Game', 50000, 'Mabar game online rank up'),
	('SRV002', 'TL002', 'Teman Nonton Bioskop', 150000, 'Nemenin nonton film di bioskop'),
	('SRV003', 'TL001', 'Teman Curhat Online', 30000, 'Dengerin curhat via Discord / Telpon');

-- Dumping structure for table matcha_db.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(50) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `no_telp` varchar(20) DEFAULT NULL,
  `role` varchar(20) NOT NULL,
  `profile_photo` LONGTEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table matcha_db.users: ~3 rows (approximately)
INSERT INTO `users` (`id`, `nama`, `email`, `password`, `no_telp`, `role`) VALUES
	('CL001', 'Didit Suyou Putra Lemon Tea', 'DiditLemonTea@gmail.com', '12345', '081122334455', 'CLIENT'),
	('TL001', 'Haniel J.S', 'haneil@gmail.com', '12345', '081234567890', 'TALENT'),
	('TL002', 'Kaizone', 'Kaizone@gmail.com', '12345', '081298765432', 'TALENT');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
