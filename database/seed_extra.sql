-- =====================================================
-- THÊM 20 khách sạn từ bộ HTML #2 và #5 (Mường Thanh)
-- Chạy sau khi HotelBookingDB.sql đã seed 10 KS đầu
-- =====================================================

-- Bộ 2: 10 KS mới (hotel_id 11-20)
INSERT INTO Hotels (hotel_code, hotel_name, province, province_code, district, address, star_rating) VALUES
('HN-002', N'Silk Path Hotel Hà Nội', N'Hà Nội', 'HN', N'Hoàn Kiếm', N'17 Tông Đản, Phường Tràng Tiền, Quận Hoàn Kiếm', 5),
('TH-001', N'FLC Luxury Hotel Sầm Sơn', N'Thanh Hóa', 'TH', N'Sầm Sơn', N'Đại lộ FLC, Phường Quảng Cư, TP. Sầm Sơn', 5),
('QN-002', N'Wyndham Legend Hạ Long', N'Quảng Ninh', 'QN', N'Bãi Cháy', N'12 Ha Long Road, Phường Bãi Cháy, TP. Hạ Long', 5),
('DN-002', N'InterContinental Đà Nẵng Sun Peninsula', N'Đà Nẵng', 'DN', N'Sơn Trà', N'Bán đảo Sơn Trà, Phường Thọ Quang, Quận Sơn Trà', 5),
('DN-003', N'Hilton Đà Nẵng', N'Đà Nẵng', 'DN', N'Hải Châu', N'50 Bạch Đằng, Phường Hải Châu 1, Quận Hải Châu', 5),
('QNM-002', N'Mercure Hội An Royal', N'Quảng Nam', 'QNM', N'Hội An', N'9 Trần Hưng Đạo, Phường Minh An, TP. Hội An', 4),
('KH-002', N'Sheraton Nha Trang Hotel & Spa', N'Khánh Hòa', 'KH', N'Nha Trang', N'26-28 Trần Phú, Phường Lộc Thọ, TP. Nha Trang', 5),
('LD-001', N'Premier Village Đà Lạt Resort', N'Lâm Đồng', 'LD', N'Đà Lạt', N'Đồi Dinh, Phường 1, TP. Đà Lạt', 5),
('KG-001', N'Vinpearl Resort & Golf Phú Quốc', N'Kiên Giang', 'KG', N'Phú Quốc', N'Bãi Dài, Xã Gành Dầu, TP. Phú Quốc', 5),
('KG-002', N'Salinda Resort Phú Quốc', N'Kiên Giang', 'KG', N'Phú Quốc', N'Đường Trần Hưng Đạo, Khu Ông Lang, Phường Dương Đông', 5);

-- RoomTypes cho KS 11-20
INSERT INTO RoomTypes (hotel_id, type_name, area_sqm, max_guests, price_per_night, bedrooms, bathrooms, description) VALUES
-- 11: Silk Path Hà Nội
(11,N'Deluxe',32,2,2800000,1,1,N'Giường Queen (1.6m x 2m)'),
(11,N'Superior Deluxe',38,2,3400000,1,1,N'Giường King (1.8m x 2m)'),
(11,N'Junior Suite',55,2,5200000,1,1,N'Giường King (1.8m x 2m)'),
(11,N'Grand Suite',85,2,8500000,1,1,N'Giường King (1.8m x 2m)'),
-- 12: FLC Sầm Sơn
(12,N'Deluxe City View',36,2,2100000,1,1,N'Giường King (1.8m x 2m)'),
(12,N'Deluxe Ocean View',36,2,2800000,1,1,N'Giường King (1.8m x 2m)'),
(12,N'Deluxe Twin',36,2,2100000,1,1,N'2 giường đơn (1.2m x 2m)'),
(12,N'Suite Ocean View',72,2,5500000,1,1,N'Giường King (1.8m x 2m)'),
(12,N'Penthouse Suite',150,4,12000000,2,2,N'Giường King + 2 giường đơn'),
-- 13: Wyndham Hạ Long
(13,N'Deluxe City View',34,2,1900000,1,1,N'Giường King (1.8m x 2m)'),
(13,N'Deluxe Bay View',34,2,2500000,1,1,N'Giường King (1.8m x 2m)'),
(13,N'Suite Bay View',68,2,5200000,1,1,N'Giường King (1.8m x 2m)'),
-- 14: InterContinental Đà Nẵng
(14,N'Beach View Room',65,2,8500000,1,1,N'Giường King (1.8m x 2m)'),
(14,N'Ocean View Suite',115,2,14000000,1,1,N'Giường King (1.8m x 2m)'),
(14,N'Family Suite',145,4,18000000,2,2,N'Giường King + 2 giường đơn'),
(14,N'Presidential Suite',400,4,55000000,2,2,N'2 giường King'),
-- 15: Hilton Đà Nẵng
(15,N'City View King',38,2,3000000,1,1,N'Giường King (1.8m x 2m)'),
(15,N'River View King',38,2,3800000,1,1,N'Giường King (1.8m x 2m)'),
(15,N'River View Twin',38,2,3800000,1,1,N'2 giường đơn (1.2m x 2m)'),
(15,N'Executive Suite',75,2,8000000,1,1,N'Giường King (1.8m x 2m)'),
(15,N'Presidential Suite',220,4,28000000,2,2,N'2 giường King'),
-- 16: Mercure Hội An
(16,N'Superior',30,2,1400000,1,1,N'Giường Queen (1.6m x 2m)'),
(16,N'Deluxe Pool View',32,2,1800000,1,1,N'Giường King (1.8m x 2m)'),
(16,N'Suite',60,2,4200000,1,1,N'Giường King (1.8m x 2m)'),
-- 17: Sheraton Nha Trang
(17,N'Deluxe Sea View',40,2,3200000,1,1,N'Giường King (1.8m x 2m)'),
(17,N'Club Deluxe Sea View',40,2,4500000,1,1,N'Giường King (1.8m x 2m)'),
(17,N'Junior Suite',65,3,7500000,1,1,N'Giường King + 1 giường đơn'),
(17,N'Grand Suite',100,2,12000000,1,1,N'Giường King (1.8m x 2m)'),
-- 18: Premier Village Đà Lạt
(18,N'Cozy Room',28,2,2500000,1,1,N'Giường Queen (1.6m x 2m)'),
(18,N'Deluxe Room',38,2,3500000,1,1,N'Giường King (1.8m x 2m)'),
(18,N'Superior Suite',60,2,6000000,1,1,N'Giường King (1.8m x 2m)'),
(18,N'Premier Suite',90,2,9500000,1,1,N'Giường King (1.8m x 2m)'),
-- 19: Vinpearl Phú Quốc
(19,N'Deluxe Garden View',42,2,3200000,1,1,N'Giường King (1.8m x 2m)'),
(19,N'Deluxe Sea View',42,2,4500000,1,1,N'Giường King (1.8m x 2m)'),
(19,N'Family Suite',90,4,9000000,2,2,N'Giường King + 2 giường đơn'),
(19,N'Pool Villa 2PN',280,4,18000000,2,2,N'2 giường King'),
-- 20: Salinda Phú Quốc
(20,N'Garden Pool Villa',120,2,6500000,1,1,N'Giường King (1.8m x 2m)'),
(20,N'Beach Front Pool Villa',145,2,10000000,1,1,N'Giường King (1.8m x 2m)'),
(20,N'Family Pool Villa',200,4,15000000,2,2,N'2 giường King');
GO

-- RoomTypeBeds cho KS 11-20 (type_id tiếp nối từ 44)
INSERT INTO RoomTypeBeds (type_id, bed_type, quantity, bed_size) VALUES
-- 11: Silk Path (44-47)
(44,'QUEEN',1,'1.6m x 2m'),(45,'KING',1,'1.8m x 2m'),(46,'KING',1,'1.8m x 2m'),(47,'KING',1,'1.8m x 2m'),
-- 12: FLC (48-52)
(48,'KING',1,'1.8m x 2m'),(49,'KING',1,'1.8m x 2m'),(50,'SINGLE',2,'1.2m x 2m'),(51,'KING',1,'1.8m x 2m'),(52,'KING',1,'1.8m x 2m'),(52,'SINGLE',2,'1.2m x 2m'),
-- 13: Wyndham (53-55)
(53,'KING',1,'1.8m x 2m'),(54,'KING',1,'1.8m x 2m'),(55,'KING',1,'1.8m x 2m'),
-- 14: InterContinental (56-59)
(56,'KING',1,'1.8m x 2m'),(57,'KING',1,'1.8m x 2m'),(58,'KING',1,'1.8m x 2m'),(58,'SINGLE',2,'1.2m x 2m'),(59,'KING',2,'1.8m x 2m'),
-- 15: Hilton (60-64)
(60,'KING',1,'1.8m x 2m'),(61,'KING',1,'1.8m x 2m'),(62,'SINGLE',2,'1.2m x 2m'),(63,'KING',1,'1.8m x 2m'),(64,'KING',2,'1.8m x 2m'),
-- 16: Mercure (65-67)
(65,'QUEEN',1,'1.6m x 2m'),(66,'QUEEN',1,'1.6m x 2m'),(67,'KING',1,'1.8m x 2m'),
-- 17: Sheraton (68-71)
(68,'KING',1,'1.8m x 2m'),(69,'KING',1,'1.8m x 2m'),(70,'KING',1,'1.8m x 2m'),(71,'KING',1,'1.8m x 2m'),
-- 18: Premier Village (72-75)
(72,'QUEEN',1,'1.6m x 2m'),(73,'KING',1,'1.8m x 2m'),(74,'KING',1,'1.8m x 2m'),(75,'KING',1,'1.8m x 2m'),
-- 19: Vinpearl PQ (76-79)
(76,'KING',1,'1.8m x 2m'),(77,'KING',1,'1.8m x 2m'),(78,'KING',1,'1.8m x 2m'),(78,'SINGLE',2,'1.2m x 2m'),(79,'KING',2,'1.8m x 2m'),
-- 20: Salinda PQ (80-82)
(80,'KING',1,'1.8m x 2m'),(81,'KING',1,'1.8m x 2m'),(82,'KING',1,'1.8m x 2m'),(82,'SINGLE',2,'1.2m x 2m');
GO

-- Bộ 5: 10 KS Mường Thanh (hotel_id 21-30)
INSERT INTO Hotels (hotel_code, hotel_name, province, province_code, district, address, star_rating) VALUES
('DB-001', N'Mường Thanh Grand Điện Biên Phủ', N'Điện Biên', 'DB', N'TP. Điện Biên Phủ', N'514 Võ Nguyên Giáp, P. Him Lam', 4),
('CB-002', N'Mường Thanh Luxury Cao Bằng (CN2)', N'Cao Bằng', 'CB', N'TP. Cao Bằng', N'42 đường Kim Đồng, P. Hợp Giang', 5),
('SL-001', N'Mường Thanh Holiday Mộc Châu', N'Sơn La', 'SL', N'Mộc Châu', N'Đường Hoàng Quốc Việt, TT. Nông Trường Mộc Châu', 3),
('LC-001', N'Mường Thanh Sa Pa', N'Lào Cai', 'LC', N'Sa Pa', N'Trung tâm thị trấn Sa Pa', 3),
('TTH-001', N'Mường Thanh Holiday Huế', N'Thừa Thiên Huế', 'TTH', N'Huế', N'38 Lê Lợi, TP. Huế', 4),
('QNM-003', N'Mường Thanh Holiday Hội An', N'Quảng Nam', 'QNM', N'Hội An', N'Cách phố cổ Hội An 2,5 km', 4),
('DN-004', N'Mường Thanh Luxury Đà Nẵng', N'Đà Nẵng', 'DN', N'Ngũ Hành Sơn', N'270 Võ Nguyên Giáp, P. Mỹ An', 5),
('KH-003', N'Mường Thanh Luxury Khánh Hòa (CN2)', N'Khánh Hòa', 'KH', N'Nha Trang', N'Khu 1, khu dân cư Cồn Tân Lập, P. Xương Huân', 5),
('BT-001', N'Mường Thanh Holiday Mũi Né', N'Bình Thuận', 'BT', N'Phan Thiết', N'Khu Phố 6, P. Hàm Tiến, TP. Phan Thiết', 4),
('HCM-002', N'Mường Thanh Luxury Sài Gòn (Phú Nhuận)', N'TP. Hồ Chí Minh', 'HCM', N'Phú Nhuận', N'261 Nguyễn Văn Trỗi, P.10, Q. Phú Nhuận', 5);

-- RoomTypes cho KS 21-30
INSERT INTO RoomTypes (hotel_id, type_name, area_sqm, max_guests, price_per_night) VALUES
-- 21: MT Điện Biên
(21,N'Deluxe Twin',30,2,900000),(21,N'Deluxe King',30,2,900000),(21,N'Deluxe Triple',30,3,1100000),(21,N'Executive Suite',60,2,2000000),(21,N'Royal Suite',120,2,4000000),
-- 22: MT Cao Bằng CN2
(22,N'Deluxe',40,2,1300000),(22,N'Premier Deluxe',48,2,1800000),(22,N'Executive Suite',66,2,2900000),(22,N'Căn hộ 2PN',96,4,4500000),
-- 23: MT Mộc Châu
(23,N'Deluxe King',32,2,800000),(23,N'Deluxe Twin',32,2,800000),(23,N'Executive Suite',65,2,2200000),
-- 24: MT Sa Pa
(24,N'Standard',25,2,600000),(24,N'Superior',30,2,900000),(24,N'Suite',55,2,2000000),
-- 25: MT Huế
(25,N'Deluxe City View',32,3,1000000),(25,N'Deluxe River View',32,3,1200000),(25,N'Premium Deluxe',45,3,1800000),
-- 26: MT Hội An
(26,N'Standard',28,2,800000),(26,N'Deluxe',30,2,1100000),(26,N'Suite Pool',58,2,3000000),
-- 27: MT Đà Nẵng
(27,N'Superior',30,2,900000),(27,N'Deluxe Sea View',33,2,1400000),(27,N'Premier Deluxe',40,2,1900000),(27,N'Executive Suite',75,2,3500000),(27,N'President Suite',405,4,20000000),
-- 28: MT Khánh Hòa CN2
(28,N'Deluxe Sea View',38,2,1100000),(28,N'Deluxe Family',45,3,1600000),(28,N'Executive Suite',78,2,3200000),
-- 29: MT Mũi Né
(29,N'Deluxe King',30,2,1000000),(29,N'Deluxe Twin',30,2,1000000),(29,N'Deluxe Triple',32,3,1350000),(29,N'Suite Grand',63,2,3000000),
-- 30: MT Sài Gòn PN
(30,N'Deluxe Twin',32,2,1600000),(30,N'Deluxe King',32,2,1600000),(30,N'Deluxe Triple',35,3,2000000),(30,N'Executive Suite',60,2,3500000);
GO

-- RoomTypeBeds cho KS 21-30 (type_id tiếp nối từ 83)
INSERT INTO RoomTypeBeds (type_id, bed_type, quantity, bed_size) VALUES
-- 21: MT Điện Biên (83-87)
(83,'SINGLE',2,'1.2m x 2m'),(84,'KING',1,'1.8m x 2m'),(85,'SINGLE',3,'1.2m x 2m'),(86,'KING',1,'1.8m x 2m'),(87,'KING',1,'1.8m x 2m'),
-- 22: MT Cao Bằng CN2 (88-91)
(88,'KING',1,'1.8m x 2m'),(89,'KING',1,'1.8m x 2m'),(90,'KING',1,'1.8m x 2m'),(91,'KING',1,'1.8m x 2m'),(91,'SINGLE',2,'1.2m x 2m'),
-- 23: MT Mộc Châu (92-94)
(92,'KING',1,'1.8m x 2m'),(93,'SINGLE',2,'1.2m x 2m'),(94,'KING',1,'1.8m x 2m'),
-- 24: MT Sa Pa (95-97)
(95,'DOUBLE',1,'1.6m x 2m'),(96,'KING',1,'1.8m x 2m'),(97,'KING',1,'1.8m x 2m'),
-- 25: MT Huế (98-100)
(98,'DOUBLE',1,'1.6m x 2m'),(99,'DOUBLE',1,'1.6m x 2m'),(100,'DOUBLE',1,'1.6m x 2m'),
-- 26: MT Hội An (101-103)
(101,'DOUBLE',1,'1.6m x 2m'),(102,'DOUBLE',1,'1.6m x 2m'),(103,'KING',1,'1.8m x 2m'),
-- 27: MT Đà Nẵng (104-108)
(104,'SINGLE',2,'1.2m x 2m'),(105,'KING',1,'1.8m x 2m'),(106,'KING',1,'1.8m x 2m'),(107,'KING',1,'1.8m x 2m'),(108,'KING',1,'1.8m x 2m'),(108,'SINGLE',2,'1.2m x 2m'),
-- 28: MT Khánh Hòa CN2 (109-111)
(109,'KING',1,'1.8m x 2m'),(110,'KING',1,'1.8m x 2m'),(110,'SINGLE',1,'1.2m x 2m'),(111,'KING',1,'1.8m x 2m'),
-- 29: MT Mũi Né (112-115)
(112,'KING',1,'1.8m x 2m'),(113,'SINGLE',2,'1.2m x 2m'),(114,'KING',1,'1.8m x 2m'),(114,'SINGLE',1,'1.2m x 2m'),(115,'KING',1,'1.8m x 2m'),
-- 30: MT Sài Gòn PN (116-119)
(116,'SINGLE',2,'1.2m x 2m'),(117,'KING',1,'1.8m x 2m'),(118,'SINGLE',3,'1.2m x 2m'),(119,'KING',1,'1.8m x 2m');
GO

-- Amenities cho KS 11-30
INSERT INTO HotelAmenityMap (hotel_id, amenity_id) VALUES
(11,1),(11,2),(11,3),(11,5),(11,6),(11,7),(11,8),(11,9),
(12,1),(12,2),(12,3),(12,5),(12,6),(12,7),(12,8),(12,9),
(13,1),(13,2),(13,3),(13,5),(13,6),(13,7),(13,8),(13,9),
(14,1),(14,2),(14,3),(14,5),(14,6),(14,7),(14,8),(14,9),(14,10),
(15,1),(15,2),(15,3),(15,5),(15,6),(15,7),(15,8),(15,9),
(16,1),(16,2),(16,3),(16,5),(16,6),(16,7),(16,8),(16,9),
(17,1),(17,2),(17,3),(17,5),(17,6),(17,7),(17,8),(17,9),
(18,1),(18,2),(18,3),(18,5),(18,6),(18,9),
(19,1),(19,2),(19,3),(19,5),(19,6),(19,7),(19,8),(19,9),
(20,1),(20,2),(20,3),(20,5),(20,6),(20,7),(20,9),
(21,1),(21,2),(21,3),(21,5),(21,6),(21,8),(21,9),
(22,1),(22,2),(22,3),(22,5),(22,6),(22,7),(22,8),(22,9),
(23,3),(23,5),(23,6),(23,9),
(24,3),(24,5),(24,9),
(25,1),(25,2),(25,3),(25,5),(25,6),(25,7),(25,8),(25,9),
(26,1),(26,3),(26,5),(26,6),(26,8),(26,9),
(27,1),(27,2),(27,3),(27,5),(27,6),(27,7),(27,8),(27,9),
(28,1),(28,2),(28,3),(28,5),(28,6),(28,9),
(29,1),(29,3),(29,5),(29,6),(29,8),(29,9),
(30,1),(30,2),(30,3),(30,5),(30,6),(30,7),(30,8),(30,9);
GO

-- Rooms cho KS 11-30 (3 phòng mỗi loại)
DECLARE @TID INT = 44;
DECLARE @MaxT INT = (SELECT MAX(type_id) FROM RoomTypes);
DECLARE @HID2 BIGINT;
DECLARE @RI2 INT;
WHILE @TID <= @MaxT
BEGIN
    SELECT @HID2 = hotel_id FROM RoomTypes WHERE type_id = @TID;
    SET @RI2 = 1;
    WHILE @RI2 <= 3
    BEGIN
        INSERT INTO Rooms (hotel_id, type_id, room_number, floor, status)
        VALUES (@HID2, @TID,
                CAST(@TID AS VARCHAR) + RIGHT('0'+CAST(@RI2 AS VARCHAR),2),
                @RI2, 'AVAILABLE');
        SET @RI2 = @RI2 + 1;
    END
    SET @TID = @TID + 1;
END
GO
