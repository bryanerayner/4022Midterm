-- phpMyAdmin SQL Dump
-- version 4.0.4
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Nov 09, 2013 at 04:24 AM
-- Server version: 5.6.12-log
-- PHP Version: 5.4.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `reflex_sports`
--
CREATE DATABASE IF NOT EXISTS `reflex_sports` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `reflex_sports`;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE IF NOT EXISTS `products` (
  `product_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_name` varchar(512) NOT NULL,
  `product_colors` varchar(512) NOT NULL,
  `brand_name` varchar(512) NOT NULL,
  `product_image` text NOT NULL,
  `product_price` decimal(10,2) NOT NULL,
  `promotion_price` decimal(10,2) DEFAULT NULL,
  `promotion_active` tinyint(1) NOT NULL DEFAULT '0',
  `product_gender` varchar(8) NOT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=11 ;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `product_name`, `product_colors`, `brand_name`, `product_image`, `product_price`, `promotion_price`, `promotion_active`, `product_gender`) VALUES
(1, 'Adidas 11 Pro Adipure Cleat', '"black"', 'Adidas', 'adidas_mens_adipure_11Pro_trx_fg_cleats.jpg', '89.99', NULL, 0, 'male'),
(2, 'Adidas F30 Messi TRX Cleat', '"red", "blue"', 'Adidas', 'adidas_mens_f30_trx_fg_Messi.jpg', '150.33', '119.98', 1, 'Male'),
(3, 'Adidas F50 Adizero TRX Cleat', '"purple", "pink", "blue"', 'Adidas', 'adidas_mens_f50_adizero_trx_fg_cleats.jpg', '75.99', '60.95', 1, 'Male'),
(4, 'Adidas Predator LZ Cleat', '"black", "green"', 'Adidas', 'adidas_mens_predator_absolado_lz_trx_fg_soccer_cleats_green.jpg', '65.99', NULL, 0, 'Male'),
(5, 'Adidas Predator Absolado TRX FG Cleat', '"black", "yellow"', 'Adidas', 'adidas_mens_predator_absolado_lz_trx_fg_soccer_cleats_yellow.jpg', '65.99', NULL, 0, 'Male'),
(6, 'Adidas F5 TRX FG Cleat', '"purple", "white"', 'Adidas', 'adidas_womens_f5_trx_fg_soccer_cleat.jpg', '65.99', NULL, 0, 'Female'),
(7, 'New Balance 5464 Cleat', '"black", "white"', 'New Balance', 'new_balance_5464_lacrosse_cleats_men.jpg', '48.95', NULL, 0, 'Male'),
(8, 'New Balance MB4040 Cleat', '"gray", "white"', 'New Balance', 'new_balance_mb4040_d_width_low_cut_baseball_cleats_men.jpg', '50.54', '39.99', 1, 'Male'),
(9, 'Nike Hypervenom Phelon Cleat', '"orange", "black"', 'Nike', 'nike_hypervenom_phelon_fg_outdoor_soccer_cleats_mens.jpg', '130.44', NULL, 0, 'Male'),
(10, 'Nike Mercurial Victory II Cleat', '"orange", "black"', 'Nike', 'nike_mercurial_victory_II_fg_soccer_cleats_mens.jpg', '120.99', NULL, 0, 'Male');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
