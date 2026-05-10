-- =====================================================
-- SEED DATA: 10 khách sạn từ bộ dữ liệu HTML #1
-- Schema mới: RoomTypes có price/area/maxGuests, RoomTypeBeds, Rooms không có bed_type/price
-- =====================================================

-- 1. Hotels (10 KS)
INSERT INTO Hotels (hotel_code, hotel_name, province, province_code, district, address, star_rating) VALUES
('CB-001', N'Mường Thanh Luxury Cao Bằng', N'Cao Bằng', 'CB', N'TP. Cao Bằng', N'Đường Bế Văn Đàn, phường Hợp Giang, TP. Cao Bằng', 5),
('HNM-001', N'Mường Thanh Luxury Hà Nam', N'Hà Nam', 'HNM', N'TP. Phủ Lý', N'Khu đất phía Bắc Cầu Hồng Phú, Phường Quang Trung, TP. Phủ Lý', 5),
('HN-001', N'Mường Thanh Grand Hà Nội', N'Hà Nội', 'HN', N'Hoàng Mai', N'Khu đô thị Bắc Linh Đàm, Phường Đại Kim, Quận Hoàng Mai', 4),
('QN-001', N'Novotel Ha Long Bay', N'Quảng Ninh', 'QN', N'Bãi Cháy', N'Đường Hạ Long, Phường Bãi Cháy, TP. Hạ Long', 4),
('HT-001', N'Mường Thanh Luxury Xuân Thành', N'Hà Tĩnh', 'HT', N'Nghi Xuân', N'Bãi biển Xuân Thành, Xã Xuân Thành, Huyện Nghi Xuân', 5),
('DN-001', N'Novotel Danang Premier Han River', N'Đà Nẵng', 'DN', N'Hải Châu', N'36 Bạch Đằng, Quận Hải Châu, TP. Đà Nẵng', 5),
('QNM-001', N'Vinpearl Resort & Spa Hội An', N'Quảng Nam', 'QNM', N'Hội An', N'Bãi biển Cửa Đại, Phường Cẩm An, TP. Hội An', 5),
('KH-001', N'Mường Thanh Luxury Khánh Hòa', N'Khánh Hòa', 'KH', N'Nha Trang', N'60 Trần Phú, Phường Lộc Thọ, TP. Nha Trang', 5),
('CT-001', N'Vinpearl Hotel Cần Thơ', N'Cần Thơ', 'CT', N'Ninh Kiều', N'209 Đường 30 Tháng 4, Phường Xuân Khánh, Quận Ninh Kiều', 5),
('HCM-001', N'Mường Thanh Luxury Sài Gòn', N'TP. Hồ Chí Minh', 'HCM', N'Quận 4', N'132 Bến Vân Đồn, Phường 6, Quận 4', 5);
GO

-- 2. RoomTypes (mỗi KS có 3-5 loại phòng, giá/diện tích/maxGuests từ HTML)
-- KS 1: Mường Thanh Luxury Cao Bằng (hotel_id=1)
INSERT INTO RoomTypes (hotel_id, type_name, area_sqm, max_guests, price_per_night) VALUES
(1, N'Deluxe King', 40, 2, 1250000),
(1, N'Deluxe Twin', 40, 2, 1250000),
(1, N'Superior King', 48, 2, 1400000),
(1, N'Superior Twin', 48, 2, 1400000),
(1, N'Suite', 96, 4, 2900000);

-- KS 2: Mường Thanh Luxury Hà Nam (hotel_id=2)
INSERT INTO RoomTypes (hotel_id, type_name, area_sqm, max_guests, price_per_night) VALUES
(2, N'Deluxe King', 33, 2, 900000),
(2, N'Deluxe Twin', 33, 2, 900000),
(2, N'Triple', 33, 3, 1100000);

-- KS 3: Mường Thanh Grand Hà Nội (hotel_id=3)
INSERT INTO RoomTypes (hotel_id, type_name, area_sqm, max_guests, price_per_night) VALUES
(3, N'Standard King', 28, 2, 850000),
(3, N'Standard Twin', 28, 2, 850000),
(3, N'Superior King', 32, 2, 1050000),
(3, N'Suite', 55, 2, 2200000);

-- KS 4: Novotel Ha Long Bay (hotel_id=4)
INSERT INTO RoomTypes (hotel_id, type_name, area_sqm, max_guests, price_per_night) VALUES
(4, N'Standard', 32, 2, 1800000),
(4, N'Superior', 32, 2, 2100000),
(4, N'Executive', 42, 2, 2700000);

-- KS 5: Mường Thanh Luxury Xuân Thành (hotel_id=5)
INSERT INTO RoomTypes (hotel_id, type_name, area_sqm, max_guests, price_per_night) VALUES
(5, N'Deluxe King', 35, 2, 1100000),
(5, N'Deluxe Twin', 35, 2, 1100000),
(5, N'Superior Sea View', 40, 2, 1500000),
(5, N'Suite', 70, 2, 2500000),
(5, N'President Suite', 120, 4, 4500000);

-- KS 6: Novotel Danang (hotel_id=6)
INSERT INTO RoomTypes (hotel_id, type_name, area_sqm, max_guests, price_per_night) VALUES
(6, N'Superior', 28, 2, 2200000),
(6, N'Corner Deluxe', 28, 3, 2600000),
(6, N'Executive', 28, 2, 3000000),
(6, N'Suite', 55, 2, 5500000);

-- KS 7: Vinpearl Resort Hội An (hotel_id=7)
INSERT INTO RoomTypes (hotel_id, type_name, area_sqm, max_guests, price_per_night) VALUES
(7, N'Deluxe Garden King', 39, 2, 1950000),
(7, N'Deluxe Garden Twin', 39, 2, 1950000),
(7, N'Deluxe Sea View Twin', 39, 3, 2600000),
(7, N'Villa 2PN', 200, 4, 8500000),
(7, N'Villa 4PN', 400, 8, 18000000);

-- KS 8: Mường Thanh Luxury Khánh Hòa (hotel_id=8)
INSERT INTO RoomTypes (hotel_id, type_name, area_sqm, max_guests, price_per_night) VALUES
(8, N'Deluxe', 32, 2, 1600000),
(8, N'Deluxe Family', 40, 3, 2100000),
(8, N'Premium Deluxe Sea View', 45, 2, 2500000),
(8, N'Suite', 80, 2, 4500000);

-- KS 9: Vinpearl Hotel Cần Thơ (hotel_id=9)
INSERT INTO RoomTypes (hotel_id, type_name, area_sqm, max_guests, price_per_night) VALUES
(9, N'Deluxe City View King', 46, 2, 2000000),
(9, N'Deluxe City View Twin', 46, 2, 2000000),
(9, N'Deluxe River View', 46, 2, 2500000),
(9, N'Suite', 90, 2, 5500000),
(9, N'Presidential Suite', 225, 2, 15000000);

-- KS 10: Mường Thanh Luxury Sài Gòn (hotel_id=10)
INSERT INTO RoomTypes (hotel_id, type_name, area_sqm, max_guests, price_per_night) VALUES
(10, N'Deluxe King', 35, 2, 1500000),
(10, N'Deluxe Twin', 35, 2, 1500000),
(10, N'Superior King', 42, 2, 2000000),
(10, N'Junior Suite', 60, 2, 3500000),
(10, N'Suite', 85, 2, 5000000);
GO

-- 3. RoomTypeBeds (giường cho mỗi loại phòng, type_id tự tăng từ 1)
INSERT INTO RoomTypeBeds (type_id, bed_type, quantity, bed_size) VALUES
-- KS1: Deluxe King(1), Deluxe Twin(2), Superior King(3), Superior Twin(4), Suite(5)
(1, 'KING', 1, '1.8m x 2m'),
(2, 'SINGLE', 2, '1.2m x 2m'),
(3, 'KING', 1, '1.8m x 2m'),
(4, 'SINGLE', 2, '1.2m x 2m'),
(5, 'KING', 1, '1.8m x 2m'), (5, 'SINGLE', 2, '1.2m x 2m'),
-- KS2: Deluxe King(6), Deluxe Twin(7), Triple(8)
(6, 'DOUBLE', 1, '1.6m x 2m'),
(7, 'SINGLE', 2, '1.2m x 2m'),
(8, 'SINGLE', 3, '1.2m x 2m'),
-- KS3: Standard King(9), Standard Twin(10), Superior King(11), Suite(12)
(9, 'DOUBLE', 1, '1.6m x 2m'),
(10, 'SINGLE', 2, '1.2m x 2m'),
(11, 'DOUBLE', 1, '1.8m x 2m'),
(12, 'DOUBLE', 1, '1.8m x 2m'),
-- KS4: Standard(13), Superior(14), Executive(15)
(13, 'DOUBLE', 1, '1.6m x 2m'),
(14, 'DOUBLE', 1, '1.6m x 2m'),
(15, 'DOUBLE', 1, '1.6m x 2m'),
-- KS5: Deluxe King(16), Deluxe Twin(17), Superior Sea View(18), Suite(19), President(20)
(16, 'DOUBLE', 1, '1.8m x 2m'),
(17, 'SINGLE', 2, '1.2m x 2m'),
(18, 'DOUBLE', 1, '1.8m x 2m'),
(19, 'DOUBLE', 1, '1.8m x 2m'),
(20, 'DOUBLE', 1, '1.8m x 2m'),
-- KS6: Superior(21), Corner Deluxe(22), Executive(23), Suite(24)
(21, 'DOUBLE', 1, '1.6m x 2m'),
(22, 'DOUBLE', 1, '1.6m x 2m'),
(23, 'DOUBLE', 1, '1.6m x 2m'),
(24, 'DOUBLE', 1, '1.8m x 2m'),
-- KS7: Deluxe Garden King(25), Twin(26), Sea View Twin(27), Villa 2PN(28), Villa 4PN(29)
(25, 'DOUBLE', 1, '1.8m x 2m'),
(26, 'SINGLE', 2, '1.2m x 2m'),
(27, 'SINGLE', 2, '1.2m x 2m'),
(28, 'DOUBLE', 2, '1.8m x 2m'),
(29, 'DOUBLE', 4, '1.8m x 2m'),
-- KS8: Deluxe(30), Deluxe Family(31), Premium Deluxe(32), Suite(33)
(30, 'DOUBLE', 1, '1.6m x 2m'),
(31, 'DOUBLE', 1, '1.6m x 2m'), (31, 'SINGLE', 1, '1.2m x 2m'),
(32, 'DOUBLE', 1, '1.8m x 2m'),
(33, 'DOUBLE', 1, '1.8m x 2m'),
-- KS9: City View King(34), City View Twin(35), River View(36), Suite(37), Presidential(38)
(34, 'KING', 1, '1.8m x 2m'),
(35, 'SINGLE', 2, '1.2m x 2m'),
(36, 'KING', 1, '1.8m x 2m'),
(37, 'KING', 1, '1.8m x 2m'),
(38, 'KING', 1, '1.8m x 2m'),
-- KS10: Deluxe King(39), Deluxe Twin(40), Superior King(41), Junior Suite(42), Suite(43)
(39, 'KING', 1, '1.8m x 2m'),
(40, 'SINGLE', 2, '1.2m x 2m'),
(41, 'KING', 1, '1.8m x 2m'),
(42, 'KING', 1, '1.8m x 2m'),
(43, 'KING', 1, '1.8m x 2m');
GO

-- 4. Rooms (3 phòng vật lý mỗi loại phòng, tổng ~120+ phòng)
DECLARE @TypeID INT = 1;
DECLARE @MaxType INT = (SELECT MAX(type_id) FROM RoomTypes);
DECLARE @HotelID_R BIGINT;
DECLARE @RoomIdx INT;
WHILE @TypeID <= @MaxType
BEGIN
    SELECT @HotelID_R = hotel_id FROM RoomTypes WHERE type_id = @TypeID;
    SET @RoomIdx = 1;
    WHILE @RoomIdx <= 3
    BEGIN
        INSERT INTO Rooms (hotel_id, type_id, room_number, floor, status)
        VALUES (@HotelID_R, @TypeID, 
                CAST(@TypeID AS VARCHAR) + RIGHT('0' + CAST(@RoomIdx AS VARCHAR), 2),
                @RoomIdx, 'AVAILABLE');
        SET @RoomIdx = @RoomIdx + 1;
    END
    SET @TypeID = @TypeID + 1;
END
GO
