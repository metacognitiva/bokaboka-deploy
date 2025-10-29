mysqldump: [Warning] Using a password on the command line interface can be insecure.
-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: bokaboka
-- ------------------------------------------------------
-- Server version	8.0.43-0ubuntu0.22.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
mysqldump: Error: 'Access denied; you need (at least one of) the PROCESS privilege(s) for this operation' when trying to dump tablespaces

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activityType` enum('new_professional','new_review','badge_earned','milestone') COLLATE utf8mb4_unicode_ci NOT NULL,
  `professionalId` int DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `metadata` text COLLATE utf8mb4_unicode_ci,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `analytics`
--

DROP TABLE IF EXISTS `analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analytics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `professionalId` int NOT NULL,
  `date` timestamp NOT NULL,
  `profileViews` int NOT NULL DEFAULT '0',
  `whatsappClicks` int NOT NULL DEFAULT '0',
  `shareClicks` int NOT NULL DEFAULT '0',
  `photoViews` int NOT NULL DEFAULT '0',
  `uniqueVisitors` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analytics`
--

LOCK TABLES `analytics` WRITE;
/*!40000 ALTER TABLE `analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `badges`
--

DROP TABLE IF EXISTS `badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `badges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requirement` int NOT NULL,
  `type` enum('services','rating','reviews','referrals') COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `badges_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `badges`
--

LOCK TABLES `badges` WRITE;
/*!40000 ALTER TABLE `badges` DISABLE KEYS */;
/*!40000 ALTER TABLE `badges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `displayOrder` int NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `follows`
--

DROP TABLE IF EXISTS `follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `follows` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `professionalId` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `follows`
--

LOCK TABLES `follows` WRITE;
/*!40000 ALTER TABLE `follows` DISABLE KEYS */;
/*!40000 ALTER TABLE `follows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leads`
--

DROP TABLE IF EXISTS `leads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `professionalId` int NOT NULL,
  `userId` int NOT NULL,
  `status` enum('pending','contacted','converted','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leads`
--

LOCK TABLES `leads` WRITE;
/*!40000 ALTER TABLE `leads` DISABLE KEYS */;
/*!40000 ALTER TABLE `leads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `moderation_actions`
--

DROP TABLE IF EXISTS `moderation_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `moderation_actions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `adminId` int NOT NULL,
  `targetProfessionalId` int NOT NULL,
  `actionType` enum('warning','suspend_7_days','suspend_15_days','suspend_30_days','ban_permanent','delete_account') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `relatedReportId` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `moderation_actions`
--

LOCK TABLES `moderation_actions` WRITE;
/*!40000 ALTER TABLE `moderation_actions` DISABLE KEYS */;
/*!40000 ALTER TABLE `moderation_actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `page_views`
--

DROP TABLE IF EXISTS `page_views`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `page_views` (
  `id` int NOT NULL AUTO_INCREMENT,
  `path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` int DEFAULT NULL,
  `sessionId` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referrer` text COLLATE utf8mb4_unicode_ci,
  `userAgent` text COLLATE utf8mb4_unicode_ci,
  `device` enum('mobile','desktop','tablet') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page_views`
--

LOCK TABLES `page_views` WRITE;
/*!40000 ALTER TABLE `page_views` DISABLE KEYS */;
/*!40000 ALTER TABLE `page_views` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `professionalId` int NOT NULL,
  `amount` int NOT NULL,
  `planType` enum('base','destaque') COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentMethod` enum('credit_card','pix','boleto') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentStatus` enum('pending','completed','failed','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `transactionId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentGateway` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subscriptionStartDate` timestamp NULL DEFAULT NULL,
  `subscriptionEndDate` timestamp NULL DEFAULT NULL,
  `isRecurring` tinyint(1) NOT NULL DEFAULT '1',
  `nextBillingDate` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `professionalBadges`
--

DROP TABLE IF EXISTS `professionalBadges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `professionalBadges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `professionalId` int NOT NULL,
  `badgeId` int NOT NULL,
  `earnedAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `professionalBadges`
--

LOCK TABLES `professionalBadges` WRITE;
/*!40000 ALTER TABLE `professionalBadges` DISABLE KEYS */;
/*!40000 ALTER TABLE `professionalBadges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `professionals`
--

DROP TABLE IF EXISTS `professionals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `professionals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `displayName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(320) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `audioUrl` text COLLATE utf8mb4_unicode_ci,
  `photoUrl` text COLLATE utf8mb4_unicode_ci,
  `galleryPhotos` text COLLATE utf8mb4_unicode_ci,
  `beforeAfterPhotos` text COLLATE utf8mb4_unicode_ci,
  `instagramVideoUrl` text COLLATE utf8mb4_unicode_ci,
  `instagramHandle` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stars` int NOT NULL DEFAULT '0',
  `reviewCount` int NOT NULL DEFAULT '0',
  `responseTime` int DEFAULT NULL,
  `badge` enum('none','verified','trusted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'none',
  `planType` enum('base','destaque') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'base',
  `documentPhotoUrl` text COLLATE utf8mb4_unicode_ci,
  `selfiePhotoUrl` text COLLATE utf8mb4_unicode_ci,
  `verificationStatus` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `points` int DEFAULT '0',
  `aiVerificationResult` text COLLATE utf8mb4_unicode_ci,
  `trialEndsAt` timestamp NULL DEFAULT NULL,
  `subscriptionEndsAt` timestamp NULL DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `professionals_uid_unique` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=570002 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `professionals`
--

LOCK TABLES `professionals` WRITE;
/*!40000 ALTER TABLE `professionals` DISABLE KEYS */;
INSERT INTO `professionals` VALUES (1,'d4l4iplt','maria-eduarda-de-araujo-nobrega-psicologo-natal---rn','Maria Eduarda de Araújo Nóbrega','Psicólogo','Natal - RN',NULL,NULL,'84991033259','84991033259','eduardanobreega@gmail.com','Psicoterapia na abordagem terapia cognitivo comportamental. Atendimento infantil, adolescente, adulto e pessoa idosa. Modalidade presencial e on-line ',NULL,'https://files.manuscdn.com/user_upload_by_module/session_file/310419663030984273/KgThFExdbcZanSyB.jpeg','[\"https://files.manuscdn.com/user_upload_by_module/session_file/310419663030984273/KgThFExdbcZanSyB.jpeg\"]',NULL,NULL,'@psi.eduardanobregaa ',0,0,NULL,'verified','destaque','https://forge.manus.ai/v1/storage/download/NrWeLgtg6s34u2tsaL2qQY/uploads/db785ebf-dc43-48b8-8fd9-f4818c3c29eb.jpg','https://forge.manus.ai/v1/storage/download/SVMpEWJsHb3aRDdnzbuC2U/uploads/876ee6c9-dbd2-4cc4-815b-3e55188c671b.jpg','approved',0,'{\"recommendation\":\"approve\",\"reasoning\":\"Verificação facial aprovada e sem registros negativos encontrados.\",\"faceMatchScore\":98,\"confidenceScore\":94,\"backgroundCheckPassed\":true,\"backgroundCheckNotes\":\"Nenhum registro negativo encontrado em busca na internet\"}','2025-11-01 00:05:29',NULL,1,'2025-10-27 00:05:28','2025-10-27 00:36:21'),(2,'gbyyvvq3','maria-eduarda-de-araujo-nobrega-psicologo-natal---rn-1','Maria Eduarda de Araújo Nóbrega','Psicólogo','Natal - RN',NULL,NULL,'84991033259','84991033259','eduardanobreega@gmail.com','Psicoterapia na abordagem terapia cognitivo comportamental. Atendimento infantil, adolescente, adulto e pessoa idosa. Modalidade presencial e on-line ',NULL,'https://files.manuscdn.com/user_upload_by_module/session_file/310419663030984273/KgThFExdbcZanSyB.jpeg','[\"https://files.manuscdn.com/user_upload_by_module/session_file/310419663030984273/KgThFExdbcZanSyB.jpeg\"]',NULL,NULL,'@psi.eduardanobregaa ',0,0,NULL,'none','base','https://forge.manus.ai/v1/storage/download/KdK9EoTspKgDQAXmPMqehe/uploads/b50d36cc-4e61-486f-a6ab-73e07f7a291f.jpg','https://forge.manus.ai/v1/storage/download/V9DzkhANkf2C6XUAq4Sm6a/uploads/9dc4c795-8980-409d-9b2d-2c76501dfd4d.jpg','rejected',0,'{\"recommendation\":\"manual_review\",\"reasoning\":\"Confiança da análise abaixo do limite (85%). Requer revisão manual.\",\"faceMatchScore\":99,\"confidenceScore\":84,\"backgroundCheckPassed\":true,\"backgroundCheckNotes\":\"Nenhum registro negativo encontrado em busca na internet\"}','2025-11-01 00:05:33',NULL,1,'2025-10-27 00:05:32','2025-10-27 00:36:21'),(3,'a0rcgphh','david-guilherme-macedo-de-sousa-marketing-digital-natal---rn','David Guilherme Macedo de Sousa','Marketing Digital','Natal - RN',NULL,NULL,'84988921386','84988921386','davidguilhermems@gmail.com','Gerenciamento de Redes Sociais',NULL,'https://files.manuscdn.com/user_upload_by_module/session_file/310419663030984273/uonMlJEqyxtlCZWs.jpeg','[\"https://forge.manus.ai/v1/storage/download/UFTpRddfWx4JJC8gZo2kca/uploads/6c60180a-7a53-4b75-90aa-d19f09b9e2e9.jpg\",\"https://forge.manus.ai/v1/storage/download/HKQiUX6nmtK46BjWTM5nUq/uploads/13e507b7-4cdc-4979-aae0-dafc30817aba.jpg\",\"https://forge.manus.ai/v1/storage/download/W6gyVnPUKAynq9VLSpeMrd/uploads/8208096f-9fe9-4d0b-8a08-3c08fc69b062.jpg\"]',NULL,NULL,'',50,1,NULL,'verified','destaque','https://forge.manus.ai/v1/storage/download/EzFPw9pbGQE4gAH4jdVZYD/uploads/e5304212-4dcc-443e-9718-3849b96ab4c5.jpg','https://forge.manus.ai/v1/storage/download/fAWAmWgZ44cL4fXME5ik75/uploads/e080caf1-7a69-434e-b600-6e16a17ada63.jpg','approved',0,'{\"recommendation\":\"manual_review\",\"reasoning\":\"Similaridade facial abaixo do limite (90%). Requer revisão manual.\",\"faceMatchScore\":76,\"confidenceScore\":92,\"backgroundCheckPassed\":true,\"backgroundCheckNotes\":\"Nenhum registro negativo encontrado em busca na internet\"}','2025-11-02 01:01:25',NULL,1,'2025-10-28 01:01:25','2025-10-28 01:52:21'),(4,'yr631b46',NULL,'Allison Araújo Barbosa ','Animador de Festas','Natal - RN',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,'none','base',NULL,NULL,'pending',0,NULL,NULL,NULL,1,'2025-10-29 18:51:02','2025-10-29 18:51:02'),(5,'w9qsgdmz',NULL,'Allison Araújo Barbosa ','Animador de Festas','Natal - RN',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,'none','base',NULL,NULL,'pending',0,NULL,NULL,NULL,1,'2025-10-29 18:51:02','2025-10-29 18:51:02'),(120001,'test-professional','profissional-de-teste-psicologo-sao-paulo-sp','Profissional de Teste','Psicólogo','São Paulo, SP',NULL,NULL,'(11) 99999-9999','5511999999999','teste@bokaboka.com','Este é um profissional de teste para simular pagamentos. Não é um perfil real.',NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,'none','base',NULL,NULL,'rejected',0,NULL,NULL,NULL,0,'2025-10-25 02:15:22','2025-10-26 17:14:04'),(150001,'robwqds4',NULL,'Diego Macedo Gonçalves ','Psicólogo ','Natal - RN',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,'none','base',NULL,NULL,'pending',0,NULL,NULL,NULL,1,'2025-10-29 18:51:02','2025-10-29 18:51:02'),(180001,'kiz6ib8h','vinicius-marques-filgueira-psicologo-natal---rn','Vinicius Marques Filgueira','Psicólogo','Natal - RN',NULL,NULL,'(84) 98127-1716','+55 (84) 98127-1716','vinicius@primeirasessao.com.br','Sou psicólogo especialista em Terapia Cognitivo-Comportamental',NULL,'https://files.manuscdn.com/user_upload_by_module/session_file/310419663030984273/GEKLsYETBBxFGaTV.jpeg','[\"https://files.manuscdn.com/user_upload_by_module/session_file/310419663030984273/GEKLsYETBBxFGaTV.jpeg\", \"https://files.manuscdn.com/user_upload_by_module/session_file/310419663030984273/aKXaPmbiJvnKFwkV.jpeg\"]',NULL,NULL,'@veinicius',0,0,NULL,'none','base','https://forge.manus.ai/v1/storage/download/TRGhA48ZLNPYvgCZ73MWLa/uploads/1b2e2ca6-e9fd-4e6f-8855-95cce71f7e44.jpg','https://forge.manus.ai/v1/storage/download/5qiuGqavxD285CtA5rQkqF/uploads/d9533390-675b-4fa8-aaf3-2eec86f0ca1d.jpg','rejected',0,'{\"recommendation\":\"manual_review\",\"reasoning\":\"Similaridade facial abaixo do limite (75%). Requer revisão manual.\",\"faceMatchScore\":71,\"confidenceScore\":92,\"backgroundCheckPassed\":true,\"backgroundCheckNotes\":\"Nenhum registro negativo encontrado em busca na internet\"}','2025-10-30 14:47:20',NULL,1,'2025-10-25 14:47:20','2025-10-26 17:14:04'),(180002,'774t32ns','vinicius-marques-filgueira-psicologo-natal---rn-1','Vinicius Marques Filgueira','Psicólogo','Natal - RN',NULL,NULL,'(84) 98127-1716','+55 (84) 98127-1716','vinicius@primeirasessao.com.br','Sou psicólogo especialista em Terapia Cognitivo-Comportamental',NULL,'https://files.manuscdn.com/user_upload_by_module/session_file/310419663030984273/GEKLsYETBBxFGaTV.jpeg','[\"https://files.manuscdn.com/user_upload_by_module/session_file/310419663030984273/GEKLsYETBBxFGaTV.jpeg\", \"https://files.manuscdn.com/user_upload_by_module/session_file/310419663030984273/aKXaPmbiJvnKFwkV.jpeg\"]','{\"before\":\"https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800\",\"after\":\"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800\"}',NULL,'@veinicius',50,2,30,'verified','destaque','https://forge.manus.ai/v1/storage/download/84BcPChdEyvYaPLpRyJhvN/uploads/17a2950e-0032-467f-91d7-95e645a7b3f3.jpg','https://forge.manus.ai/v1/storage/download/8cY6Gb8HMtzmgoW5qSHfvT/uploads/797cba05-c82b-4e59-89f0-8f48f3a59111.jpg','approved',0,'{\"recommendation\":\"approve\",\"reasoning\":\"Verificação facial aprovada e sem registros negativos encontrados.\",\"faceMatchScore\":87,\"confidenceScore\":87,\"backgroundCheckPassed\":true,\"backgroundCheckNotes\":\"Nenhum registro negativo encontrado em busca na internet\"}','2025-10-30 14:47:23',NULL,1,'2025-10-25 14:47:22','2025-10-28 17:54:43'),(210001,'jjpzfssd','alynne-patricia-da-silva-goncalves-psicologa-natal---rn','Alynne Gonçalves ','Psicóloga ','Natal - RN',-5.84372350,-35.22144830,'84987143374','84987143374','alynnetcc@gmail.com','Terapeuta de relacionamentos e terapia de casais com 10 anos de experiência ',NULL,'https://forge.manus.ai/v1/storage/download/oGbanrU9gmhnt7EchQHy6K/uploads/cd9b7997-d84c-4612-acd7-a3bea3c3130e.jpg','[\"https://forge.manus.ai/v1/storage/download/oGbanrU9gmhnt7EchQHy6K/uploads/cd9b7997-d84c-4612-acd7-a3bea3c3130e.jpg\",\"https://forge.manus.ai/v1/storage/download/DuNUpXbkujQfV3oACuCBua/uploads/8396038a-b229-499b-9645-72827fa2c189.jpg\",\"https://forge.manus.ai/v1/storage/download/2ttaNGvezphwHGNvRXXbNL/uploads/c05d0c4f-3fe4-4da6-aa72-488875f271eb.jpg\",\"https://forge.manus.ai/v1/storage/download/a3LCZGwUZpjS47uHsEFxRo/uploads/4f56d728-74d7-4a81-b57a-a72fb5d8cd07.jpg\",\"https://forge.manus.ai/v1/storage/download/KVLay8KyxSwnYSyFBTuVsW/uploads/c6cc2b2e-70e6-4d83-b071-fc0ebfab1a24.jpg\",\"https://forge.manus.ai/v1/storage/download/kHKZL9k2n3GjoeyUMBppGX/uploads/9a2aa8a3-591f-4f24-b582-cb47c6c3db41.jpg\"]','{\"before\":\"https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800\",\"after\":\"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800\"}','https://www.instagram.com/reel/DQJZt3kjfa9/?igsh=MWVsZjdwemNlaG9maA==','https://www.instagram.com/alynnegoncalvespsi?igsh=MWlzNGJnN3k4NDd3dw==',50,1,30,'verified','destaque','https://forge.manus.ai/v1/storage/download/ZCHyfkkQV3U72owsTh5yd9/uploads/8a98e1f8-ceb2-4b76-9ae2-2d080f502559.jpg','https://forge.manus.ai/v1/storage/download/BSPYcu3U3jzsvvXLo5hhuf/uploads/bbae49ab-2bd3-420a-9666-771542ee9df6.jpg','approved',0,'{\"recommendation\":\"approve\",\"reasoning\":\"Verificação facial aprovada e sem registros negativos encontrados.\",\"faceMatchScore\":83,\"confidenceScore\":86,\"backgroundCheckPassed\":true,\"backgroundCheckNotes\":\"Nenhum registro negativo encontrado em busca na internet\"}','2025-10-31 12:09:20',NULL,1,'2025-10-26 12:09:19','2025-10-28 17:54:43'),(240001,'1xd2vnsk','diego-macedo-goncalves-advogado-criminalista-natal---rn','Diego Macedo Gonçalves','Advogado Criminalista','Natal - RN',NULL,NULL,'84987335940','84987335940','diego@metacognitiva.com','Dff',NULL,'https://forge.manus.ai/v1/storage/download/2YoEoM5aDuDyGy9fiCdEKz/uploads/4b01eb66-0075-47ea-ac5e-2c183bd47dfb.jpg','[\"https://forge.manus.ai/v1/storage/download/guaND2HSCVme6Xu7ajLGee/uploads/77f57df7-3613-4376-9d7e-26cf831f0d4b.jpg\",\"https://forge.manus.ai/v1/storage/download/CL55KhaKJZQDhWZBKNxA3X/uploads/df502a52-137a-43a9-bb5a-39a15989dfb2.jpg\",\"https://forge.manus.ai/v1/storage/download/kLUxQxFKPKyxztGNHXYarW/uploads/99ae5d0c-8dc9-469a-8838-f8f89c22c22c.jpg\"]',NULL,NULL,'@drdiego',0,0,NULL,'none','base','https://forge.manus.ai/v1/storage/download/gUAMv6gZfpHAMogBBTEKw4/uploads/109ad429-b435-4470-9727-53a06c63dd84.jpg','https://forge.manus.ai/v1/storage/download/2YoEoM5aDuDyGy9fiCdEKz/uploads/4b01eb66-0075-47ea-ac5e-2c183bd47dfb.jpg','rejected',0,'{\"recommendation\":\"manual_review\",\"reasoning\":\"Similaridade facial abaixo do limite (90%). Requer revisão manual.\",\"faceMatchScore\":87,\"confidenceScore\":88,\"backgroundCheckPassed\":true,\"backgroundCheckNotes\":\"Nenhum registro negativo encontrado em busca na internet\"}','2025-10-31 22:06:56',NULL,1,'2025-10-26 22:06:55','2025-10-26 22:07:43'),(300001,'f2soyf4f','jose-ricardo-duarte-advogado-criminalista-natal---rn','José Duarte','Advogado Criminalista','Natal - RN',-5.86011805,-35.24584466,'84996050060','84996050060','jose.duarteadv2016@gmail.com','Pós-graduação em Direito Penal, Processo Penal e Execução Penal e Tribunal do Juri',NULL,'https://forge.manus.ai/v1/storage/download/N8qBkC3wnndveAqftrtQLU/uploads/a467cb01-dcce-4699-9669-89d3d60dc2a1.jpg','[\"https://forge.manus.ai/v1/storage/download/iBWxDwy3pH3QB8yRNzCiGi/uploads/d0c534e1-5b92-4e6d-b3fa-e44914110cdf.jpg\",\"https://forge.manus.ai/v1/storage/download/D4St9Utd4bHYuPdehjB29w/uploads/3e2a9c11-4c78-4331-81fa-ab4e9bc1b6e2.jpg\",\"https://forge.manus.ai/v1/storage/download/7Ei9yaFoctpEjt2aeaS2AN/uploads/d3765798-cea7-4f1b-b85c-d5ee1ab36c38.jpg\",\"https://forge.manus.ai/v1/storage/download/SoUNkeFhCZwsvkVjfSYCRe/uploads/fedd89b1-2a94-43fc-b20c-94ab1d99c81a.jpg\",\"https://forge.manus.ai/v1/storage/download/KmQDVqBLXGDcXU9uPpbsxq/uploads/0d3987a2-8e37-406a-b914-00e4a8d2aff6.jpg\",\"https://forge.manus.ai/v1/storage/download/4onoVeUK4YxMSwSdg7oE3h/uploads/c87aa044-d0af-449d-846d-6b4c78e7990b.jpg\"]',NULL,NULL,'josé.duarteadv',50,1,NULL,'verified','destaque','https://forge.manus.ai/v1/storage/download/SQmabqZibBVHFAMFVJj423/uploads/04c0a41e-bb75-42b7-bd84-cbd942cc99a1.jpg','https://forge.manus.ai/v1/storage/download/N8qBkC3wnndveAqftrtQLU/uploads/a467cb01-dcce-4699-9669-89d3d60dc2a1.jpg','approved',0,'{\"recommendation\":\"manual_review\",\"reasoning\":\"Similaridade facial abaixo do limite (90%). Requer revisão manual.\",\"faceMatchScore\":82,\"confidenceScore\":95,\"backgroundCheckPassed\":true,\"backgroundCheckNotes\":\"Nenhum registro negativo encontrado em busca na internet\"}','2025-11-01 01:02:41',NULL,1,'2025-10-27 01:02:41','2025-10-27 01:09:08'),(450001,'5strr43j','sama-micaela-dos-anjos-bezerra-psicologo-natal---rn','Sama Micaela dos Anjos Bezerra','Psicólogo','Natal - RN',NULL,NULL,'84996027912','84996027912','samamicaela@yahoo.com.br','Psicoterapia com ênfase na Terapia Cognitiva Comportamental.',NULL,'https://forge.manus.ai/v1/storage/download/NUsZSjMoHXvRiTopY4h6TM/uploads/5456f748-9971-432a-ae32-942a8d3c31f7.jpg','[\"https://forge.manus.ai/v1/storage/download/NUsZSjMoHXvRiTopY4h6TM/uploads/5456f748-9971-432a-ae32-942a8d3c31f7.jpg\",\"https://forge.manus.ai/v1/storage/download/eneBY4HbgSR6YHisKxhkb5/uploads/45957f2e-de28-4f86-b595-67a1d7c6f869.jpg\",\"https://forge.manus.ai/v1/storage/download/8E2JkHCDT8VSMrGTeeG4rr/uploads/221de5d5-2464-49d9-b9d6-01e62af0033e.jpg\",\"https://forge.manus.ai/v1/storage/download/K5keQokLJzBDRpvJXGBSME/uploads/103c35e4-b862-476e-891e-ef24874ab1a1.jpg\"]',NULL,NULL,'@psi_samamicaela',0,0,NULL,'verified','base','https://forge.manus.ai/v1/storage/download/8ktKFETPvpqUcL8ZU9ugTy/uploads/55bf6069-1e46-4b97-b8d4-a704a5853e93.jpg','https://forge.manus.ai/v1/storage/download/fVYSy3V6HvcquaJ3zm7rSu/uploads/091569f6-f806-4a02-8ce3-43a3e5ac33dc.jpg','approved',0,'{\"recommendation\":\"manual_review\",\"reasoning\":\"Confiança da análise abaixo do limite (85%). Requer revisão manual.\",\"faceMatchScore\":98,\"confidenceScore\":84,\"backgroundCheckPassed\":true,\"backgroundCheckNotes\":\"Nenhum registro negativo encontrado em busca na internet\"}','2025-11-02 01:46:22',NULL,1,'2025-10-28 01:46:22','2025-10-28 02:14:37'),(510001,'wwk86g1x','paulo-gaudi-de-araujo-motorista-particular-natal---rn','Paulo Gaudi de Araujo','Motorista Particular','Natal - RN',NULL,NULL,'(84)999021942','(84)998487499','paulogaudi1967@gmail.com','Trabalhei como motorista de coletivo 11 anos. Sou funcionário público e trabalho como motorista da uber e 99pop.',NULL,'https://forge.manus.ai/v1/storage/download/ASfJFmkhMgk8YUH6JdYvwS/uploads/88d379a7-3062-414e-92e7-26dac94b26d3.jpg','[\"https://forge.manus.ai/v1/storage/download/Tfp2L5CywEB4fnVBXuVXvc/uploads/670699a6-6785-43df-bee3-2af4c67adfcf.jpg\",\"https://forge.manus.ai/v1/storage/download/BjrL47b9dwiHR9M5Y3872E/uploads/decc59ed-b7b5-41d6-881a-e40b99f3ebf3.jpg\",\"https://forge.manus.ai/v1/storage/download/7pTaDVQ66napEzLRdonJZW/uploads/260e7695-3691-46d4-9320-e3acbd84c2f8.jpg\"]',NULL,NULL,NULL,0,0,NULL,'verified','base','https://forge.manus.ai/v1/storage/download/b62ykTiM3rzQz3rLUHh28q/uploads/f93b7874-ab30-40f8-9081-2c614ac68a42.jpg','https://forge.manus.ai/v1/storage/download/ASfJFmkhMgk8YUH6JdYvwS/uploads/88d379a7-3062-414e-92e7-26dac94b26d3.jpg','approved',0,'{\"recommendation\":\"manual_review\",\"reasoning\":\"Similaridade facial abaixo do limite (90%). Requer revisão manual.\",\"faceMatchScore\":84,\"confidenceScore\":92,\"backgroundCheckPassed\":true,\"backgroundCheckNotes\":\"Nenhum registro negativo encontrado em busca na internet\"}','2025-11-02 09:11:50',NULL,1,'2025-10-28 09:11:50','2025-10-28 09:15:53'),(540001,'6lwuk0bz','amanda-sara-psicologo-natal---rn','Amanda Sara','Psicólogo','Natal - RN',NULL,NULL,'84991838113','84991838113','amandasara@outlook.com','Psicóloga, atendo o público infanto-juvenil e adulto, pós graduanda em tcc, neuropsicologia e psicologia e saúde. ',NULL,'https://forge.manus.ai/v1/storage/download/Ls7CVgNdeUMou73A7TTe9Z/uploads/b6c42086-5d22-40fb-a931-992a279aa37d.jpg','[\"https://forge.manus.ai/v1/storage/download/dKxDmHTGQ8EHKwiLo4AmMH/uploads/e223eb2a-6795-4d8d-b1bf-a63806313f84.jpg\",\"https://forge.manus.ai/v1/storage/download/Dd3psN3E7fyCzmv4bX3LzP/uploads/0a682b44-5a24-4f56-aaeb-cdac1e932e2d.jpg\",\"https://forge.manus.ai/v1/storage/download/DGdwCFTZbsLF3UDauujkmd/uploads/49ea0d38-a230-42ab-9763-a39454a9d536.jpg\",\"https://forge.manus.ai/v1/storage/download/gbwDfoyQkEXmqWGLPQpYvL/uploads/1f080a53-5791-4a72-88a1-3841c01375b1.jpg\"]',NULL,NULL,'amandasarapsi',0,0,NULL,'none','base','https://forge.manus.ai/v1/storage/download/LSXcgwYCygqovGxgWfnG3f/uploads/d3f082c0-6de0-451c-a5ca-8c37d86441b6.jpg','https://forge.manus.ai/v1/storage/download/Ls7CVgNdeUMou73A7TTe9Z/uploads/b6c42086-5d22-40fb-a931-992a279aa37d.jpg','pending',0,'{\"recommendation\":\"manual_review\",\"reasoning\":\"Similaridade facial abaixo do limite (90%). Requer revisão manual.\",\"faceMatchScore\":85,\"confidenceScore\":94,\"backgroundCheckPassed\":true,\"backgroundCheckNotes\":\"Nenhum registro negativo encontrado em busca na internet\"}','2025-11-02 12:24:17',NULL,1,'2025-10-28 12:24:16','2025-10-28 12:24:16'),(570001,'TeGPdsMazb3yDdfPNGgnso',NULL,'Doutor Diego Gonçalves','Psicólogo','Natal - RN',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,'none','destaque',NULL,NULL,'approved',0,NULL,NULL,NULL,1,'2025-10-29 18:51:02','2025-10-29 18:51:02');
/*!40000 ALTER TABLE `professionals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promoCodeUsage`
--

DROP TABLE IF EXISTS `promoCodeUsage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promoCodeUsage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `promoCodeId` int NOT NULL,
  `professionalId` int NOT NULL,
  `usedAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promoCodeUsage`
--

LOCK TABLES `promoCodeUsage` WRITE;
/*!40000 ALTER TABLE `promoCodeUsage` DISABLE KEYS */;
/*!40000 ALTER TABLE `promoCodeUsage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promoCodes`
--

DROP TABLE IF EXISTS `promoCodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promoCodes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `planType` enum('base','destaque') COLLATE utf8mb4_unicode_ci NOT NULL,
  `maxUses` int NOT NULL DEFAULT '0',
  `currentUses` int NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `expiresAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `promoCodes_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promoCodes`
--

LOCK TABLES `promoCodes` WRITE;
/*!40000 ALTER TABLE `promoCodes` DISABLE KEYS */;
/*!40000 ALTER TABLE `promoCodes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `referrals`
--

DROP TABLE IF EXISTS `referrals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `referrals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `referrerId` int NOT NULL,
  `referredId` int NOT NULL,
  `referralCode` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','completed','rewarded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `discountAmount` int NOT NULL DEFAULT '1000',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `completedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `referrals_referralCode_unique` (`referralCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `referrals`
--

LOCK TABLES `referrals` WRITE;
/*!40000 ALTER TABLE `referrals` DISABLE KEYS */;
/*!40000 ALTER TABLE `referrals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reporterUserId` int DEFAULT NULL,
  `reportedProfessionalId` int NOT NULL,
  `category` enum('fraud','inappropriate_behavior','service_not_delivered','fake_profile','harassment','illegal_activity','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `evidenceUrls` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','under_review','resolved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `resolution` text COLLATE utf8mb4_unicode_ci,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `resolvedAt` timestamp NULL DEFAULT NULL,
  `resolvedByAdminId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `professionalId` int NOT NULL,
  `userId` int DEFAULT NULL,
  `rating` int NOT NULL,
  `weight` int NOT NULL DEFAULT '1',
  `comment` text COLLATE utf8mb4_unicode_ci,
  `audioUrl` text COLLATE utf8mb4_unicode_ci,
  `emoji` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `servicePhotoUrl` text COLLATE utf8mb4_unicode_ci,
  `verificationPhotoUrl` text COLLATE utf8mb4_unicode_ci,
  `confirmationToken` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isVerified` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stories`
--

DROP TABLE IF EXISTS `stories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `professionalId` int NOT NULL,
  `mediaUrl` text COLLATE utf8mb4_unicode_ci,
  `mediaType` enum('image','video','text') COLLATE utf8mb4_unicode_ci NOT NULL,
  `caption` text COLLATE utf8mb4_unicode_ci,
  `backgroundColor` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `textElements` text COLLATE utf8mb4_unicode_ci,
  `stickerElements` text COLLATE utf8mb4_unicode_ci,
  `locationData` text COLLATE utf8mb4_unicode_ci,
  `professionBadge` text COLLATE utf8mb4_unicode_ci,
  `viewCount` int NOT NULL DEFAULT '0',
  `expiresAt` timestamp NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stories`
--

LOCK TABLES `stories` WRITE;
/*!40000 ALTER TABLE `stories` DISABLE KEYS */;
/*!40000 ALTER TABLE `stories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storyViews`
--

DROP TABLE IF EXISTS `storyViews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storyViews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `storyId` int NOT NULL,
  `userId` int NOT NULL,
  `viewedAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storyViews`
--

LOCK TABLES `storyViews` WRITE;
/*!40000 ALTER TABLE `storyViews` DISABLE KEYS */;
/*!40000 ALTER TABLE `storyViews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `systemSettings`
--

DROP TABLE IF EXISTS `systemSettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `systemSettings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `settingKey` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `settingValue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `updatedBy` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `systemSettings_settingKey_unique` (`settingKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `systemSettings`
--

LOCK TABLES `systemSettings` WRITE;
/*!40000 ALTER TABLE `systemSettings` DISABLE KEYS */;
/*!40000 ALTER TABLE `systemSettings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `openId` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci,
  `email` varchar(320) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `loginMethod` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('user','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `userType` enum('client','professional','none') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'none',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_openId_unique` (`openId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'TeGPdsMazb3yDdfPNGgnso','Doutor Diego Gonçalves','diego@metacognitiva.com.br','google','admin','professional','2025-10-24 22:24:17','2025-10-25 13:52:06','2025-10-25 13:52:07');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-29 15:02:29
