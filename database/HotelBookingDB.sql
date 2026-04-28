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
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += 'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) + 
               ' DROP CONSTRAINT ' + QUOTENAME(name) + ';' + CHAR(13)
FROM sys.foreign_keys
WHERE referenced_object_id = OBJECT_ID('dbo.Users');
EXEC sp_executesql @sql;

IF OBJECT_ID('dbo.Reviews', 'U') IS NOT NULL DROP TABLE dbo.Reviews;
IF OBJECT_ID('dbo.InvoiceItems', 'U') IS NOT NULL DROP TABLE dbo.InvoiceItems;
IF OBJECT_ID('dbo.Invoices', 'U') IS NOT NULL DROP TABLE dbo.Invoices;
IF OBJECT_ID('dbo.Payments', 'U') IS NOT NULL DROP TABLE dbo.Payments;
IF OBJECT_ID('dbo.BookingServices', 'U') IS NOT NULL DROP TABLE dbo.BookingServices;
IF OBJECT_ID('dbo.Bookings', 'U') IS NOT NULL DROP TABLE dbo.Bookings;
IF OBJECT_ID('dbo.HotelAmenityMap', 'U') IS NOT NULL DROP TABLE dbo.HotelAmenityMap;
IF OBJECT_ID('dbo.HotelServices', 'U') IS NOT NULL DROP TABLE dbo.HotelServices;
IF OBJECT_ID('dbo.Rooms', 'U') IS NOT NULL DROP TABLE dbo.Rooms;
IF OBJECT_ID('dbo.RoomTypes', 'U') IS NOT NULL DROP TABLE dbo.RoomTypes;
IF OBJECT_ID('dbo.Hotels', 'U') IS NOT NULL DROP TABLE dbo.Hotels;
IF OBJECT_ID('dbo.Amenities', 'U') IS NOT NULL DROP TABLE dbo.Amenities;
IF OBJECT_ID('dbo.ExtraServices', 'U') IS NOT NULL DROP TABLE dbo.ExtraServices;
IF OBJECT_ID('dbo.UserRoles', 'U') IS NOT NULL DROP TABLE dbo.UserRoles;
IF OBJECT_ID('dbo.Roles', 'U') IS NOT NULL DROP TABLE dbo.Roles;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO
CREATE TABLE Users (
    user_id BIGINT NOT NULL IDENTITY(1,1),
    full_name NVARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    password_hash VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(512) NULL,
    avatar_url VARCHAR(512) NULL,
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
CREATE TABLE Amenities (
    amenity_id INT NOT NULL IDENTITY(1,1),
    amenity_name NVARCHAR(100) NOT NULL,
    icon_url VARCHAR(255) NULL,
    CONSTRAINT PK_Amenities PRIMARY KEY (amenity_id)
);
CREATE TABLE HotelAmenityMap (
    hotel_id BIGINT NOT NULL,
    amenity_id INT NOT NULL,
    CONSTRAINT PK_HotelAmenityMap PRIMARY KEY (hotel_id, amenity_id),
    CONSTRAINT FK_HAM_Hotel FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id) ON DELETE CASCADE,
    CONSTRAINT FK_HAM_Amenity FOREIGN KEY (amenity_id) REFERENCES Amenities(amenity_id) ON DELETE CASCADE
);
CREATE TABLE ExtraServices (
    service_id INT NOT NULL IDENTITY(1,1),
    service_name NVARCHAR(150) NOT NULL,
    description NVARCHAR(255) NULL,
    unit_price DECIMAL(18,2) NOT NULL,
    price_type VARCHAR(20) NOT NULL DEFAULT 'PER_PERSON',
    CONSTRAINT PK_ExtraServices PRIMARY KEY (service_id)
);
CREATE TABLE HotelServices (
    hotel_id BIGINT NOT NULL,
    service_id INT NOT NULL,
    custom_price DECIMAL(18,2) NULL,
    CONSTRAINT PK_HotelServices PRIMARY KEY (hotel_id, service_id),
    CONSTRAINT FK_HS_Hotel FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id) ON DELETE CASCADE,
    CONSTRAINT FK_HS_Service FOREIGN KEY (service_id) REFERENCES ExtraServices(service_id) ON DELETE CASCADE
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
    quantity TINYINT NOT NULL DEFAULT 1,
    unit_price_snapshot DECIMAL(18,2) NOT NULL,
    CONSTRAINT PK_BookingServices PRIMARY KEY (booking_id, service_id),
    CONSTRAINT FK_BS_Booking FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT FK_BS_Service FOREIGN KEY (service_id) REFERENCES ExtraServices(service_id)
);
CREATE TABLE Payments (
    payment_id BIGINT NOT NULL IDENTITY(1,1),
    booking_id BIGINT NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    transaction_id VARCHAR(100) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payment_date DATETIME2 NULL,
    CONSTRAINT PK_Payments PRIMARY KEY (payment_id),
    CONSTRAINT FK_Payments_Booking FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE
);
CREATE TABLE Invoices (
    invoice_id BIGINT NOT NULL IDENTITY(1,1),
    booking_id BIGINT NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    total_amount DECIMAL(18,2) NOT NULL,
    tax_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    final_amount DECIMAL(18,2) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT PK_Invoices PRIMARY KEY (invoice_id),
    CONSTRAINT FK_Invoices_Booking FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT UQ_Invoices_Number UNIQUE (invoice_number)
);
CREATE TABLE Reviews (
    review_id BIGINT NOT NULL IDENTITY(1,1),
    booking_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    hotel_id BIGINT NOT NULL,
    rating TINYINT NOT NULL,
    comment NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT PK_Reviews PRIMARY KEY (review_id),
    CONSTRAINT FK_Reviews_Booking FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id),
    CONSTRAINT FK_Reviews_User FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Reviews_Hotel FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id),
    CONSTRAINT CK_Reviews_Rating CHECK (rating BETWEEN 1 AND 5)
);
GO
INSERT INTO Roles (role_name) VALUES ('ROLE_ADMIN'), ('ROLE_MANAGER'), ('ROLE_USER');
INSERT INTO Users (full_name, email, phone, password_hash) VALUES 
(N'Admin System', 'admin@hbms.com', '0123456789', '$2a$10$Xm.tHn/zVzP6FpI3Y8i4YeI2u5zYvP2zYvP2zYvP2zYvP2zYvP2z'),
(N'Hotel Manager', 'manager@hbms.com', '0987654321', '$2a$10$Xm.tHn/zVzP6FpI3Y8i4YeI2u5zYvP2zYvP2zYvP2zYvP2zYvP2z');
INSERT INTO UserRoles (user_id, role_id) VALUES (1, 1), (2, 2);
INSERT INTO Hotels (hotel_code, hotel_name, province, province_code, district, address, star_rating) VALUES
('KS001', N'Hanoi Grand Hotel', N'Ha Noi', 'HN', N'Hoan Kiem', N'1 Ly Thai To', 5),
('KS002', N'Da Nang Beach Resort', N'Da Nang', 'DN', N'Ngu Hanh Son', N'99 Vo Nguyen Giap', 4);
INSERT INTO RoomTypes (hotel_id, type_name, base_capacity) VALUES (1, N'Standard Single', 1), (1, N'Deluxe Double', 2), (2, N'Sea View Suite', 2);
INSERT INTO Rooms (hotel_id, type_id, room_number, bed_type, price_per_night) VALUES
(1, 1, '101', 'SINGLE', 500000), (1, 2, '202', 'DOUBLE', 1200000), (2, 3, 'S-501', 'KING', 3500000);
GO
