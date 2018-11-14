-- MySQL dump 10.13  Distrib 5.7.24, for Linux (x86_64)
--
-- Host: localhost    Database: holandly
-- ------------------------------------------------------
-- Server version	5.7.24-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `eventpattern`
--

DROP TABLE IF EXISTS `eventpattern`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `eventpattern` (
  `patternId` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(40) CHARACTER SET utf8 NOT NULL,
  `number` smallint(6) NOT NULL,
  `duration` smallint(6) NOT NULL,
  `description` text CHARACTER SET utf8,
  `userId` int(11) NOT NULL,
  `multiaccess` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`patternId`),
  UNIQUE KEY `id_UNIQUE` (`patternId`),
  KEY `fk_eventpattern_1_idx` (`userId`),
  CONSTRAINT `fk_eventpattern_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventpattern`
--

LOCK TABLES `eventpattern` WRITE;
/*!40000 ALTER TABLE `eventpattern` DISABLE KEYS */;
INSERT INTO `eventpattern` VALUES (1,'рфвдлыадвфы',1,1,'явыфафыа',1,0),(2,'sfd',1,1,'sadf',1,0);
/*!40000 ALTER TABLE `eventpattern` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventslist`
--

DROP TABLE IF EXISTS `eventslist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `eventslist` (
  `eventId` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `patternId` int(11) NOT NULL,
  PRIMARY KEY (`eventId`),
  UNIQUE KEY `id` (`eventId`),
  KEY `id_idx` (`patternId`),
  CONSTRAINT `id` FOREIGN KEY (`patternId`) REFERENCES `eventpattern` (`patternId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventslist`
--

LOCK TABLES `eventslist` WRITE;
/*!40000 ALTER TABLE `eventslist` DISABLE KEYS */;
INSERT INTO `eventslist` VALUES (1,'2018-11-11','15:00:00',1),(2,'2018-11-10','12:00:00',2);
/*!40000 ALTER TABLE `eventslist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventvisitors`
--

DROP TABLE IF EXISTS `eventvisitors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `eventvisitors` (
  `eventId` int(11) NOT NULL,
  `visitorId` int(11) NOT NULL,
  `evId` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`evId`),
  UNIQUE KEY `id_UNIQUE` (`evId`),
  KEY `visitorId` (`visitorId`),
  KEY `eventVisitors_ibfk_1` (`eventId`),
  CONSTRAINT `eventvisitors_ibfk_1` FOREIGN KEY (`eventId`) REFERENCES `eventslist` (`eventId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `eventvisitors_ibfk_2` FOREIGN KEY (`visitorId`) REFERENCES `visitors` (`visitorId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventvisitors`
--

LOCK TABLES `eventvisitors` WRITE;
/*!40000 ALTER TABLE `eventvisitors` DISABLE KEYS */;
INSERT INTO `eventvisitors` VALUES (1,1,1),(2,2,2);
/*!40000 ALTER TABLE `eventvisitors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('LhYerdP9DlPxeU_XEAPKE81n72WTIptu',1541441457,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":{\"userId\":1,\"login\":\"andrey\"}}}'),('OTBiz8yvVIJB4lKYjpf9UJR6biLFXFa2',1541505389,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('XQWo6UxTx1PVm_CkNBtAZp2Jxvc7qFGo',1541510874,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":{\"userId\":1,\"login\":\"andrey\"}}}'),('vPH-42r9_Sf1Auke2k4BUDswSgKTzglh',1541505389,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('yaqWqbZBgUXsK69xZoalqobuMR0aDSbk',1541505389,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `userId` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(45) CHARACTER SET utf8 NOT NULL,
  `password` varchar(45) CHARACTER SET utf8 NOT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `email_UNIQUE` (`login`),
  UNIQUE KEY `id_UNIQUE` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'andrey','z001'),(2,'фа','a'),(3,'1','1');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visitors`
--

DROP TABLE IF EXISTS `visitors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `visitors` (
  `visitorId` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(40) CHARACTER SET utf8 NOT NULL,
  `email` varchar(255) CHARACTER SET utf8 NOT NULL,
  PRIMARY KEY (`visitorId`),
  UNIQUE KEY `id` (`visitorId`),
  UNIQUE KEY `id_2` (`visitorId`),
  UNIQUE KEY `id_3` (`visitorId`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visitors`
--

LOCK TABLES `visitors` WRITE;
/*!40000 ALTER TABLE `visitors` DISABLE KEYS */;
INSERT INTO `visitors` VALUES (1,'petro','asdf@adf.com'),(2,'kateryna','kat@kat.com'),(3,'vasyl','vas@vas.com'),(4,'ivan','iv@iv.com'),(5,'вася','g@f.com'),(6,'коля','а@a.com'),(7,'тарас','t@a.com'),(8,'Лера','v@gm.com'),(9,'Люда','liuda@g.com'),(10,'антон','a@afds.com'),(11,'петро','p@afds.com'),(12,'Марина','m@m.com'),(13,'петя','p@p.com'),(14,'вася','v@v.com'),(15,'кирюха','kir@k.com'),(16,'орест','o@m.com'),(17,'вуди','w@a.com'),(18,'лаки','lucky@l.com'),(19,'бенни','b@b.com'),(20,'таня','t@t.com'),(21,'валера','val@v.com'),(22,'тоник','ton@t.com'),(23,'костя','kos@k.com'),(24,'гена','gma@gma.com'),(25,'матвей','m@m.com'),(26,'Петя','z@a.com'),(27,'андрей','a@a.com'),(28,'вася','w@w.com'),(29,'анатолий','anat@a.com'),(30,'saf','afds@a.com'),(31,'kaka','kaka@kaka.com'),(32,'kaka','ka@ka.com'),(33,'afdsaf','afdasafads@csdfs.com'),(34,'asdfdsafasd','dsfads@adsfa.com'),(35,'fdsfdsfads','sdfads@adfa.com'),(36,'sdfaads','adsfs@sadfg.com'),(37,'sdsf','adfd@fdsf.com'),(38,'safsd','dsafads@gsadf.com'),(39,'dsfafddsafdsf','dsfds@asdfdsfs.com'),(40,'adfadsf','asdfds@gcmcma.com'),(41,'Василися','das@das.com'),(42,'Тартар','dsafa@gads.com'),(43,'Ляля','lala@la.com'),(44,'Конь','kon@das.com'),(45,'Кит','kit@gsa.com'),(46,'Лось','los@saa.com'),(47,'Дуб','dub@adf.com'),(48,'Бук','buk@gas.com'),(49,'Ананас','anna@ga.com'),(50,'Свинья','svin@ga.com'),(51,'Жаба','dsa@gmci.com'),(52,'Туз','dfsaaa@sl.com'),(53,'Бемби','bembi@ga.com'),(54,'Jason','gra@fsd.com'),(55,'Stas','adfsds@gsad.com');
/*!40000 ALTER TABLE `visitors` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-11-07 18:36:40
