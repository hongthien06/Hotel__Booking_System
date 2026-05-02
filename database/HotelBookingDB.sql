SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO
USE master;
GO
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'HotelBookingDB')
BEGIN
    CREATE DATABASE HotelBookingDB COLLATE Vietnamese_CI_AS;
END
GO
USE HotelBookingDB;
GO

-- Xóa bảng theo thứ tự chuẩn (từ bảng con đến bảng cha)
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS InvoiceItems;
DROP TABLE IF EXISTS Invoices;
DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS BookingServices;
DROP TABLE IF EXISTS ChatMessages;
DROP TABLE IF EXISTS Bookings;
DROP TABLE IF EXISTS Conversations;
DROP TABLE IF EXISTS HotelAmenityMap;
DROP TABLE IF EXISTS HotelServices;
DROP TABLE IF EXISTS Rooms;
DROP TABLE IF EXISTS RoomTypes;
DROP TABLE IF EXISTS Hotels;
DROP TABLE IF EXISTS Amenities;
DROP TABLE IF EXISTS ExtraServices;
DROP TABLE IF EXISTS UserRoles;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Roles;
GO

CREATE TABLE Users (
    user_id BIGINT NOT NULL IDENTITY(1,1),
    full_name NVARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    password_hash VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(512) NULL,
    avatar_url VARCHAR(512) NULL,
    reset_token VARCHAR(100) NULL,
    reset_token_expiry DATETIME2 NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT PK_Users PRIMARY KEY (user_id),
    CONSTRAINT UQ_Users_Email UNIQUE (email)
);

CREATE TABLE Roles (
    role_id INT NOT NULL IDENTITY(1,1),
    role_name VARCHAR(50) NOT NULL,
    description NVARCHAR(255) NULL,
    CONSTRAINT PK_Roles PRIMARY KEY (role_id),
    CONSTRAINT UQ_Roles_Name UNIQUE (role_name)
);

CREATE TABLE UserRoles (
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    assigned_at DATETIME2 NULL DEFAULT SYSDATETIME(),
    CONSTRAINT PK_UserRoles PRIMARY KEY (user_id, role_id),
    CONSTRAINT FK_UR_User FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT FK_UR_Role FOREIGN KEY (role_id) REFERENCES Roles(role_id) ON DELETE CASCADE
);

CREATE TABLE Hotels (
    hotel_id BIGINT NOT NULL IDENTITY(1,1),
    hotel_code VARCHAR(20) NOT NULL,
    hotel_name NVARCHAR(255) NOT NULL,
    province NVARCHAR(100) NOT NULL,
    province_code VARCHAR(10) NOT NULL,
    district NVARCHAR(100) NOT NULL,
    address NVARCHAR(500) NULL,
    star_rating TINYINT NULL,
    description NVARCHAR(MAX) NULL,
    thumbnail_url VARCHAR(512) NULL,
    image_urls NVARCHAR(MAX) NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(255) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT PK_Hotels PRIMARY KEY (hotel_id),
    CONSTRAINT UQ_Hotels_Code UNIQUE (hotel_code)
);

CREATE TABLE RoomTypes (
    type_id INT NOT NULL IDENTITY(1,1),
    hotel_id BIGINT NOT NULL,
    type_name NVARCHAR(100) NOT NULL,
    base_capacity TINYINT NOT NULL DEFAULT 2,
    description NVARCHAR(MAX) NULL,
    CONSTRAINT PK_RoomTypes PRIMARY KEY (type_id),
    CONSTRAINT FK_RT_Hotel FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id) ON DELETE CASCADE
);

CREATE TABLE Rooms (
    room_id BIGINT NOT NULL IDENTITY(1,1),
    hotel_id BIGINT NOT NULL,
    type_id INT NOT NULL,
    room_number VARCHAR(30) NOT NULL,
    floor SMALLINT NULL,
    bed_type VARCHAR(20) NOT NULL,
    price_per_night DECIMAL(18,2) NOT NULL,
    image_urls NVARCHAR(MAX) NULL,
    description NVARCHAR(MAX) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT PK_Rooms PRIMARY KEY (room_id),
    CONSTRAINT FK_Rooms_Hotel FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id),
    CONSTRAINT FK_Rooms_Type FOREIGN KEY (type_id) REFERENCES RoomTypes(type_id)
);

CREATE TABLE ExtraServices (
    service_id INT NOT NULL IDENTITY(1,1),
    service_name NVARCHAR(150) NOT NULL,
    unit_price DECIMAL(18,2) NOT NULL,
    price_type VARCHAR(20) NOT NULL DEFAULT 'PER_PERSON',
    CONSTRAINT PK_ExtraServices PRIMARY KEY (service_id)
);

CREATE TABLE Bookings (
    booking_id BIGINT NOT NULL IDENTITY(1,1),
    user_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    actual_checkin DATETIME2 NULL,
    actual_checkout DATETIME2 NULL,
    num_adults TINYINT NOT NULL DEFAULT 1,
    num_children TINYINT NOT NULL DEFAULT 0,
    special_request NVARCHAR(500) NULL,
    room_price_snapshot DECIMAL(18,2) NOT NULL,
    total_nights SMALLINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    expires_at DATETIME2 NULL,
    booking_code VARCHAR(20) NOT NULL,
    version INT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT PK_Bookings PRIMARY KEY (booking_id),
    CONSTRAINT FK_Bookings_User FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Bookings_Room FOREIGN KEY (room_id) REFERENCES Rooms(room_id),
    CONSTRAINT UQ_Bookings_Code UNIQUE (booking_code)
);

CREATE TABLE BookingServices (
    booking_id BIGINT NOT NULL,
    service_id INT NOT NULL,
    quantity SMALLINT NOT NULL DEFAULT 1,
    unit_price_snap DECIMAL(18,2) NOT NULL,
    subtotal AS (quantity * unit_price_snap),
    CONSTRAINT PK_BookingServices PRIMARY KEY (booking_id, service_id),
    CONSTRAINT FK_BS_Booking FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT FK_BS_Service FOREIGN KEY (service_id) REFERENCES ExtraServices(service_id) ON DELETE CASCADE
);

CREATE TABLE Conversations (
    conversation_id BIGINT NOT NULL IDENTITY(1,1),
    user_id BIGINT NULL,
    session_id VARCHAR(100) NOT NULL,
    title NVARCHAR(255) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT PK_Conversations PRIMARY KEY (conversation_id),
    CONSTRAINT FK_Conv_User FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

CREATE TABLE ChatMessages (
    message_id BIGINT NOT NULL IDENTITY(1,1),
    conversation_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    tokens_used INT NULL,
    ref_hotel_id BIGINT NULL,
    ref_room_id BIGINT NULL,
    ref_booking_id BIGINT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT PK_ChatMessages PRIMARY KEY (message_id),
    CONSTRAINT FK_Msg_Conv FOREIGN KEY (conversation_id) REFERENCES Conversations(conversation_id) ON DELETE CASCADE,
    CONSTRAINT FK_Msg_Hotel FOREIGN KEY (ref_hotel_id) REFERENCES Hotels(hotel_id) ON DELETE SET NULL,
    CONSTRAINT FK_Msg_Room FOREIGN KEY (ref_room_id) REFERENCES Rooms(room_id) ON DELETE SET NULL,
    CONSTRAINT FK_Msg_Booking FOREIGN KEY (ref_booking_id) REFERENCES Bookings(booking_id) ON DELETE SET NULL
);

CREATE TABLE Payments (
    payment_id      BIGINT          NOT NULL IDENTITY(1,1),
    booking_id      BIGINT          NOT NULL,
    gateway         VARCHAR(20)     NOT NULL,
    transaction_id  VARCHAR(255)    NULL,   -- TxnRef/OrderId từ MoMo, VNPAY
    amount          DECIMAL(18,2)   NOT NULL,
    currency        VARCHAR(10)     NOT NULL DEFAULT 'VND',
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    paid_at         DATETIME2       NULL,   -- Thời điểm thanh toán thành công
    raw_response    NVARCHAR(MAX)   NULL,   -- JSON response từ gateway (audit log)
    ip_address      VARCHAR(50)     NULL,   -- IP của khách lúc thanh toán
    created_at      DATETIME2       NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT PK_Payments              PRIMARY KEY (payment_id),
    CONSTRAINT FK_Payments_Booking      FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id),
    CONSTRAINT UQ_Payments_TxnId        UNIQUE (transaction_id),
    CONSTRAINT CK_Payments_Amount       CHECK (amount > 0),
    CONSTRAINT CK_Payments_Gateway      CHECK (gateway IN ('MOMO','VNPAY','ZALOPAY','CASH','TRANSFER')),
    CONSTRAINT CK_Payments_Status       CHECK (status  IN ('PENDING','SUCCESS','FAILED','REFUNDED'))
)

CREATE TABLE Invoices (
    invoice_id      BIGINT          NOT NULL IDENTITY(1,1),
    booking_id      BIGINT          NOT NULL,
    payment_id      BIGINT          NOT NULL,
    invoice_number  VARCHAR(30)     NOT NULL,   -- VD: INV-20240615-00001
    subtotal        DECIMAL(18,2)   NOT NULL,   -- Tổng trước thuế (phòng + dịch vụ)
    tax_rate        DECIMAL(5,2)    NOT NULL DEFAULT 10.00,  -- VAT 10%
    tax_amount      DECIMAL(18,2)   NOT NULL,
    discount_amount DECIMAL(18,2)   NOT NULL DEFAULT 0,
    total_amount    DECIMAL(18,2)   NOT NULL,   -- = subtotal + tax_amount - discount
    pdf_url         VARCHAR(512)    NULL,
    issued_at       DATETIME2       NOT NULL DEFAULT SYSDATETIME(),
    notes           NVARCHAR(500)   NULL,

    CONSTRAINT PK_Invoices              PRIMARY KEY (invoice_id),
    CONSTRAINT FK_Invoices_Booking      FOREIGN KEY (booking_id)  REFERENCES Bookings(booking_id),
    CONSTRAINT FK_Invoices_Payment      FOREIGN KEY (payment_id)  REFERENCES Payments(payment_id),
    CONSTRAINT UQ_Invoices_Number       UNIQUE (invoice_number),
    CONSTRAINT UQ_Invoices_Booking      UNIQUE (booking_id),     -- 1 booking chỉ có 1 invoice
    CONSTRAINT CK_Invoices_Total        CHECK (total_amount >= 0)
);


CREATE TABLE InvoiceItems (
    item_id         BIGINT          NOT NULL IDENTITY(1,1),
    invoice_id      BIGINT          NOT NULL,
    item_type       VARCHAR(20)     NOT NULL,
    description     NVARCHAR(255)   NOT NULL,   -- "Phòng 101 - 3 đêm", "Bữa sáng x2"
    quantity        SMALLINT        NOT NULL DEFAULT 1,
    unit_price      DECIMAL(18,2)   NOT NULL,
    line_total      AS (quantity * unit_price) PERSISTED,

    CONSTRAINT PK_InvoiceItems          PRIMARY KEY (item_id),
    CONSTRAINT FK_InvoiceItems_Invoice  FOREIGN KEY (invoice_id) REFERENCES Invoices(invoice_id) ON DELETE CASCADE,
    CONSTRAINT CK_InvoiceItems_Type     CHECK (item_type IN ('ROOM','SERVICE','DISCOUNT','TAX'))
)

-- Dữ liệu mẫu mở rộng (15 khách sạn, 5 loại phòng mỗi KS, 50 phòng thực tế)
GO
INSERT INTO Roles (role_name) VALUES ('ADMIN'), ('MANAGER'), ('CUSTOMER');

-- 1. Thêm 15 khách sạn đa dạng vùng miền
INSERT INTO Hotels (hotel_code, hotel_name, province, province_code, district, address, star_rating) VALUES
('HNK-001', N'Mường Thanh Grand Hanoi', N'Hà Nội', 'HN', N'Hoàn Kiếm', N'1 Lý Thái Tổ', 5),
('DNS-001', N'InterContinental Danang', N'Đà Nẵng', 'DN', N'Sơn Trà', N'Bãi Bắc, Sơn Trà', 5),
('HCM-001', N'Vinpearl Landmark 81', N'TP. Hồ Chí Minh', 'HCM', N'Quận 1', N'720A Điện Biên Phủ', 5),
('HCM-002', N'Caravelle Saigon', N'TP. Hồ Chí Minh', 'HCM', N'Quận 1', N'19-23 Lam Sơn Square', 5),
('DLT-001', N'Ana Mandara Villas Dalat', N'Lâm Đồng', 'LD', N'Đà Lạt', N'Lê Lai, Phường 5', 5),
('NTR-001', N'Sheraton Nha Trang', N'Khánh Hòa', 'KH', N'Nha Trang', N'26-28 Trần Phú', 5),
('PQU-001', N'JW Marriott Phu Quoc', N'Kiên Giang', 'KG', N'Phú Quốc', N'Bãi Khem, An Thới', 5),
('SAP-001', N'Silk Path Grand Resort', N'Lào Cai', 'LC', N'Sapa', N'Đồi Quan 6, Tổ 10', 5),
('HUE-001', N'Azerai La Residence', N'Thừa Thiên Huế', 'TTH', N'Huế', N'5 Lê Lợi, Vĩnh Ninh', 5),
('HPH-001', N'Flamingo Cat Ba', N'Hải Phòng', 'HP', N'Cát Hải', N'Bãi tắm Cát Cò 1, 2', 5),
('VTU-001', N'Pullman Vung Tau', N'Bà Rịa - Vũng Tàu', 'VT', N'Vũng Tàu', N'15 Thi Sách, Thắng Tam', 5),
('HCM-003', N'Rex Hotel', N'TP. Hồ Chí Minh', 'HCM', N'Quận 1', N'141 Nguyễn Huệ', 5),
('HNK-002', N'Metropole Hanoi', N'Hà Nội', 'HN', N'Hoàn Kiếm', N'15 Ngô Quyền', 5),
('DNS-002', N'Novotel Danang', N'Đà Nẵng', 'DN', N'Hải Châu', N'36 Bạch Đằng', 5),
('DLT-002', N'Dalat Palace Heritage', N'Lâm Đồng', 'LD', N'Đà Lạt', N'2 Trần Phú', 5);

-- 2. Thêm 5 loại phòng cho mỗi khách sạn (Tổng 75 RoomTypes)
DECLARE @HotelID BIGINT = 1;
WHILE @HotelID <= 15
BEGIN
    INSERT INTO RoomTypes (hotel_id, type_name, base_capacity) VALUES
    (@HotelID, N'Standard', 2),
    (@HotelID, N'Deluxe', 2),
    (@HotelID, N'Superior', 3),
    (@HotelID, N'Family Room', 4),
    (@HotelID, N'Presidential Suite', 2);
    SET @HotelID = @HotelID + 1;
END

-- 3. Thêm 50 phòng đa dạng (Phân bổ trên các khách sạn và loại phòng)
INSERT INTO Rooms (hotel_id, type_id, room_number, floor, bed_type, price_per_night, status) VALUES
-- Khách sạn 1 (Hà Nội) - Types: 1-5
(1, 1, '101', 1, 'SINGLE', 850000, 'AVAILABLE'),
(1, 2, '201', 2, 'DOUBLE', 1350000, 'AVAILABLE'),
(1, 4, '401', 4, 'TRIPLE', 2800000, 'AVAILABLE'),
(1, 5, 'P-01', 5, 'KING', 5500000, 'AVAILABLE'),
-- Khách sạn 2 (Đà Nẵng) - Types: 6-10
(2, 6, 'V-101', 1, 'SINGLE', 2500000, 'AVAILABLE'),
(2, 7, 'V-201', 2, 'DOUBLE', 3800000, 'AVAILABLE'),
(2, 8, 'V-301', 3, 'KING', 5200000, 'AVAILABLE'),
(2, 10, 'ROYAL', 5, 'KING', 12000000, 'AVAILABLE'),
-- Khách sạn 3 (Landmark 81) - Types: 11-15
(3, 11, '8101', 81, 'KING', 6500000, 'AVAILABLE'),
(3, 13, '8105', 81, 'KING', 9000000, 'AVAILABLE'),
(3, 15, 'TOP-81', 81, 'KING', 35000000, 'AVAILABLE'),
-- Khách sạn 4 (Caravelle) - Types: 16-20
(4, 16, '402', 4, 'DOUBLE', 3200000, 'AVAILABLE'),
(4, 18, '605', 6, 'KING', 4500000, 'AVAILABLE'),
(4, 19, '901', 9, 'TRIPLE', 5800000, 'AVAILABLE'),
-- Khách sạn 5 (Ana Mandara) - Types: 21-25
(5, 21, 'V1-1', 1, 'QUEEN', 2200000, 'AVAILABLE'),
(5, 22, 'V2-2', 1, 'KING', 3600000, 'AVAILABLE'),
(5, 24, 'V4-1', 1, 'TRIPLE', 5200000, 'AVAILABLE'),
-- Khách sạn 6 (Sheraton NT) - Types: 26-30
(6, 26, '1201', 12, 'DOUBLE', 2900000, 'AVAILABLE'),
(6, 27, '1505', 15, 'KING', 4200000, 'AVAILABLE'),
(6, 30, 'S-101', 20, 'KING', 15000000, 'AVAILABLE'),
-- Khách sạn 7 (JW Marriott PQ) - Types: 31-35
(7, 31, 'EM-10', 1, 'KING', 8500000, 'AVAILABLE'),
(7, 33, 'EM-25', 2, 'KING', 12000000, 'AVAILABLE'),
(7, 35, 'LAM-01', 1, 'KING', 55000000, 'AVAILABLE'),
-- Khách sạn 8 (Silk Path Sapa) - Types: 36-40
(8, 36, '102', 1, 'SINGLE', 2400000, 'AVAILABLE'),
(8, 38, '205', 2, 'DOUBLE', 3800000, 'AVAILABLE'),
(8, 39, '308', 3, 'TRIPLE', 4800000, 'AVAILABLE'),
-- Khách sạn 9 (Azerai Hue) - Types: 41-45
(9, 41, '105', 1, 'DOUBLE', 3600000, 'AVAILABLE'),
(9, 44, '201', 2, 'TRIPLE', 6000000, 'AVAILABLE'),
(9, 45, 'KING-H', 2, 'KING', 18000000, 'AVAILABLE'),
-- Khách sạn 10 (Flamingo CB) - Types: 46-50
(10, 46, 'A-101', 1, 'DOUBLE', 2600000, 'AVAILABLE'),
(10, 48, 'A-301', 3, 'KING', 4200000, 'AVAILABLE'),
(10, 49, 'A-501', 5, 'TRIPLE', 6500000, 'AVAILABLE'),
-- Khách sạn 11 (Pullman VT) - Types: 51-55
(11, 51, '505', 5, 'DOUBLE', 2500000, 'AVAILABLE'),
(11, 53, '701', 7, 'KING', 3800000, 'AVAILABLE'),
(11, 54, '901', 9, 'TRIPLE', 5200000, 'AVAILABLE'),
-- Khách sạn 12 (Rex) - Types: 56-60
(12, 56, '210', 2, 'DOUBLE', 3400000, 'AVAILABLE'),
(12, 59, '405', 4, 'TRIPLE', 6200000, 'AVAILABLE'),
(12, 60, '501', 5, 'KING', 10000000, 'AVAILABLE'),
-- Khách sạn 13 (Metropole) - Types: 61-65
(13, 61, '101H', 1, 'KING', 9500000, 'AVAILABLE'),
(13, 63, '205H', 2, 'KING', 13000000, 'AVAILABLE'),
(13, 65, 'SOM-01', 3, 'KING', 65000000, 'AVAILABLE'),
-- Khách sạn 14 (Novotel DN) - Types: 66-70
(14, 66, '1010', 10, 'DOUBLE', 2300000, 'AVAILABLE'),
(14, 68, '1405', 14, 'KING', 3800000, 'AVAILABLE'),
(14, 69, '1801', 18, 'TRIPLE', 5500000, 'AVAILABLE'),
-- Khách sạn 15 (Dalat Palace) - Types: 71-75
(15, 71, '105', 1, 'KING', 4500000, 'AVAILABLE'),
(15, 74, '201', 2, 'TRIPLE', 7500000, 'AVAILABLE'),
(15, 75, 'ROYAL-D', 2, 'KING', 25000000, 'AVAILABLE'),
-- Thêm các phòng bổ sung cho đủ 50
(1, 1, '102', 1, 'SINGLE', 850000, 'AVAILABLE'),
(1, 2, '202', 2, 'DOUBLE', 1350000, 'AVAILABLE'),
(2, 6, 'V-102', 1, 'SINGLE', 2500000, 'AVAILABLE'),
(3, 11, '8102', 81, 'KING', 6500000, 'AVAILABLE'),
(4, 16, '403', 4, 'DOUBLE', 3200000, 'AVAILABLE');
GO


INSERT INTO Users (full_name, email, phone, password_hash) VALUES
(N'Hoàng Đức Anh',    'ducanhdz2403@gmail.com',       '0387310342', '$2b$10$BM5J07/Yhf5iNtxYrLJyq.dbO1s8wl2Y93/dasivHZd6d41oo0UF.'),
(N'Hồng Thiên',       'hongthienn280706@gmail.com',    '0961934724', '$2b$10$FPfhOitDtpwfPzi4QGuVp..UYc59jkItb9LHLLZwJTTZHKSTMG.V2'),
(N'Nguyễn Gia Khang', 'khangnguyek135@gmail.com',      '0326409667', '$2b$10$/WbZKGr7MMzeyta9d1TuaOVvXzol.pObDI.LUWEo3vBWu1Itt/Eb2'),
(N'Dư Nguyên An',     'nguyenann1204@gmail.com',       '0939163059', '$2b$10$2/0z4V1G9T0bnnfbvV2F7.cCvUvEDEgJVRC3xXBgcOjhlKQz7oTji');

INSERT INTO UserRoles (user_id, role_id)
SELECT user_id, 3
FROM Users
WHERE email IN (
    'ducanhdz2403@gmail.com',
    'hongthienn280706@gmail.com',
    'khangnguyek135@gmail.com',
    'nguyenann1204@gmail.com'
);
GO