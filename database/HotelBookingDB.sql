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

-- Xóa bảng theo thứ tự chuẩn
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS InvoiceItems;
DROP TABLE IF EXISTS Invoices;
DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS BookingServices;
DROP TABLE IF EXISTS Bookings;
DROP TABLE IF EXISTS ChatMessages;
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

-- Dữ liệu mẫu tối giản
GO
INSERT INTO Roles (role_name) VALUES ('ROLE_ADMIN'), ('ROLE_MANAGER'), ('ROLE_USER');
INSERT INTO Hotels (hotel_code, hotel_name, province, province_code, district, address, star_rating) VALUES
('HNK-001', N'Mường Thanh Grand Hanoi', N'Hà Nội', 'HN', N'Hoàn Kiếm', N'1 Lý Thái Tổ', 5),
('DNS-001', N'InterContinental Danang', N'Đà Nẵng', 'DN', N'Sơn Trà', N'Bãi Bắc, Sơn Trà', 5);

INSERT INTO RoomTypes (hotel_id, type_name, base_capacity) VALUES
(1, N'Standard', 2), (1, N'Deluxe', 2), (1, N'VIP Suite', 2),
(2, N'Standard', 2), (2, N'Deluxe', 2), (2, N'VIP Suite', 2);

INSERT INTO Rooms (hotel_id, type_id, room_number, bed_type, price_per_night) VALUES
(1, 1, 'S-101', 'SINGLE', 500000), (1, 2, 'D-201', 'DOUBLE', 1000000),
(2, 4, 'S-101', 'SINGLE', 800000), (2, 5, 'D-201', 'DOUBLE', 1500000);
GO
