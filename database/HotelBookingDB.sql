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
DROP TABLE IF EXISTS voucher_usages;
DROP TABLE IF EXISTS Bookings;
DROP TABLE IF EXISTS customer_memberships;
DROP TABLE IF EXISTS membership_tiers;
DROP TABLE IF EXISTS holiday_periods;
DROP TABLE IF EXISTS group_discount_rules;
DROP TABLE IF EXISTS vouchers;
DROP TABLE IF EXISTS Conversations;
DROP TABLE IF EXISTS HotelAmenityMap;
DROP TABLE IF EXISTS HotelServices;
DROP TABLE IF EXISTS Rooms;
DROP TABLE IF EXISTS RoomTypeBeds;
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
    area_sqm SMALLINT NULL,
    max_guests TINYINT NOT NULL DEFAULT 2,
    bedrooms TINYINT NOT NULL DEFAULT 1,
    bathrooms TINYINT NOT NULL DEFAULT 1,
    price_per_night DECIMAL(18,2) NOT NULL DEFAULT 0,
    description NVARCHAR(MAX) NULL,
    CONSTRAINT PK_RoomTypes PRIMARY KEY (type_id),
    CONSTRAINT FK_RT_Hotel FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id) ON DELETE CASCADE
);

CREATE TABLE RoomTypeBeds (
    bed_id INT NOT NULL IDENTITY(1,1),
    type_id INT NOT NULL,
    bed_type VARCHAR(20) NOT NULL,
    quantity TINYINT NOT NULL DEFAULT 1,
    bed_size VARCHAR(30) NULL,
    CONSTRAINT PK_RoomTypeBeds PRIMARY KEY (bed_id),
    CONSTRAINT FK_RTB_Type FOREIGN KEY (type_id) REFERENCES RoomTypes(type_id) ON DELETE CASCADE,
    CONSTRAINT CK_RTB_BedType CHECK (bed_type IN ('KING','QUEEN','SINGLE','DOUBLE'))
);

CREATE TABLE Rooms (
    room_id BIGINT NOT NULL IDENTITY(1,1),
    hotel_id BIGINT NOT NULL,
    type_id INT NOT NULL,
    room_number VARCHAR(30) NOT NULL,
    floor SMALLINT NULL,
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
    service_id   INT            NOT NULL IDENTITY(1,1),
    service_name NVARCHAR(150)  NOT NULL,
    description  NVARCHAR(500)  NULL,
    unit_price   DECIMAL(18,2)  NOT NULL,
    price_type   VARCHAR(20)    NOT NULL DEFAULT 'PER_BOOKING',
    is_active    BIT            NOT NULL DEFAULT 1,
    CONSTRAINT PK_ExtraServices PRIMARY KEY (service_id)
);

CREATE TABLE Amenities (
    amenity_id   INT            NOT NULL IDENTITY(1,1),
    amenity_name NVARCHAR(100)  NOT NULL,
    icon_class   VARCHAR(100)   NULL,
    description  NVARCHAR(255)  NULL,
    CONSTRAINT PK_Amenities     PRIMARY KEY (amenity_id),
    CONSTRAINT UQ_Amenities_Name UNIQUE (amenity_name)
);

CREATE TABLE HotelAmenityMap (
    hotel_id   BIGINT NOT NULL,
    amenity_id INT    NOT NULL,
    CONSTRAINT PK_HotelAmenityMap  PRIMARY KEY (hotel_id, amenity_id),
    CONSTRAINT FK_HAM_Hotel        FOREIGN KEY (hotel_id)   REFERENCES Hotels(hotel_id)   ON DELETE CASCADE,
    CONSTRAINT FK_HAM_Amenity      FOREIGN KEY (amenity_id) REFERENCES Amenities(amenity_id) ON DELETE CASCADE
);

CREATE TABLE HotelServices (
    hotel_id     BIGINT         NOT NULL,
    service_id   INT            NOT NULL,
    custom_price DECIMAL(18,2)  NULL,
    CONSTRAINT PK_HotelServices PRIMARY KEY (hotel_id, service_id),
    CONSTRAINT FK_HS_Hotel      FOREIGN KEY (hotel_id)   REFERENCES Hotels(hotel_id)   ON DELETE CASCADE,
    CONSTRAINT FK_HS_Service    FOREIGN KEY (service_id) REFERENCES ExtraServices(service_id) ON DELETE CASCADE
);

CREATE TABLE membership_tiers (
    tier_id           BIGINT PRIMARY KEY IDENTITY(1,1),
    tier_code         NVARCHAR(20)  NOT NULL UNIQUE,
    tier_level        INT           NOT NULL,
    discount_pct      DECIMAL(5,2)  NOT NULL DEFAULT 0,
    min_total_spent   DECIMAL(18,2) NOT NULL DEFAULT 0,
    min_booking_count INT           NOT NULL DEFAULT 0,
    display_name_vi   NVARCHAR(100) NOT NULL,
    display_name_en   NVARCHAR(100) NOT NULL,
    color_code        NVARCHAR(10)  DEFAULT '#888888',
    benefits_vi       NVARCHAR(MAX),
    benefits_en       NVARCHAR(MAX),
    created_at        DATETIME2     DEFAULT SYSDATETIME()
);

CREATE TABLE holiday_periods (
    holiday_id       BIGINT PRIMARY KEY IDENTITY(1,1),
    name_vi          NVARCHAR(200) NOT NULL,
    name_en          NVARCHAR(200) NOT NULL,
    start_date       DATE          NOT NULL,
    end_date         DATE          NOT NULL,
    price_multiplier DECIMAL(5,2)  NOT NULL DEFAULT 1.50,
    is_active        BIT           NOT NULL DEFAULT 1,
    created_at       DATETIME2     DEFAULT SYSDATETIME(),
    CONSTRAINT chk_holiday_dates CHECK (end_date >= start_date)
);

CREATE TABLE group_discount_rules (
    rule_id      BIGINT PRIMARY KEY IDENTITY(1,1),
    min_guests   INT          NOT NULL,
    max_guests   INT,
    discount_pct DECIMAL(5,2) NOT NULL,
    is_active    BIT          NOT NULL DEFAULT 1,
    CONSTRAINT chk_group_guests CHECK (min_guests >= 1)
);

CREATE TABLE vouchers (
    voucher_id           BIGINT IDENTITY(1,1)  PRIMARY KEY,
    code                 NVARCHAR(50)           NOT NULL UNIQUE,
    description          NVARCHAR(500)          NULL,
    discount_type        NVARCHAR(20)           NOT NULL,   -- PERCENTAGE | FIXED_AMOUNT
    discount_value       DECIMAL(18, 2)         NOT NULL,
    min_order_amount     DECIMAL(18, 2)         NOT NULL DEFAULT 0,
    max_discount_amount  DECIMAL(18, 2)         NULL,
    usage_limit          INT                    NULL,
    used_count           INT                    NOT NULL DEFAULT 0,
    usage_limit_per_user INT                    NOT NULL DEFAULT 1,
    status               NVARCHAR(20)           NOT NULL DEFAULT 'ACTIVE',
    start_date           DATETIME2              NULL,
    end_date             DATETIME2              NULL,
    created_at           DATETIME2              NOT NULL DEFAULT SYSDATETIME(),
    updated_at           DATETIME2              NULL
);

CREATE TABLE Bookings (
    booking_id          BIGINT NOT NULL IDENTITY(1,1),
    user_id             BIGINT NOT NULL,
    room_id             BIGINT NOT NULL,
    voucher_id          BIGINT NULL,
    check_in_date       DATE NOT NULL,
    check_out_date      DATE NOT NULL,
    actual_checkin      DATETIME2 NULL,
    actual_checkout     DATETIME2 NULL,
    num_adults          TINYINT NOT NULL DEFAULT 1,
    num_children        TINYINT NOT NULL DEFAULT 0,
    special_request     NVARCHAR(500) NULL,
    room_price_snapshot DECIMAL(18,2) NOT NULL,
    total_nights        SMALLINT NOT NULL,
    discount_amount     DECIMAL(18,2) NOT NULL DEFAULT 0,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    expires_at          DATETIME2 NULL,
    booking_code        VARCHAR(20) NOT NULL,
    version             INT NOT NULL DEFAULT 0,
    created_at          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    
    -- New columns for membership & peak discount system
    membership_discount_pct   DECIMAL(5,2)  NOT NULL DEFAULT 0,
    membership_discount_amt   DECIMAL(18,2) NOT NULL DEFAULT 0,
    is_first_booking_discount BIT           NOT NULL DEFAULT 0,
    holiday_multiplier        DECIMAL(5,2)  NOT NULL DEFAULT 1.00,
    holiday_period_id         BIGINT        NULL,
    group_discount_pct        DECIMAL(5,2)  NOT NULL DEFAULT 0,
    group_discount_amt        DECIMAL(18,2) NOT NULL DEFAULT 0,
    guest_count               INT           NOT NULL DEFAULT 1,
    merged_into_booking_id    BIGINT        NULL,

    CONSTRAINT PK_Bookings          PRIMARY KEY (booking_id),
    CONSTRAINT FK_Bookings_User     FOREIGN KEY (user_id)    REFERENCES Users(user_id),
    CONSTRAINT FK_Bookings_Room     FOREIGN KEY (room_id)    REFERENCES Rooms(room_id),
    CONSTRAINT FK_Bookings_Voucher  FOREIGN KEY (voucher_id) REFERENCES vouchers(voucher_id),
    CONSTRAINT FK_Bookings_Holiday  FOREIGN KEY (holiday_period_id) REFERENCES holiday_periods(holiday_id),
    CONSTRAINT FK_Bookings_MergedInto FOREIGN KEY (merged_into_booking_id) REFERENCES Bookings(booking_id),
    CONSTRAINT UQ_Bookings_Code     UNIQUE (booking_code)
);

CREATE TABLE BookingRooms (
    booking_room_id     BIGINT NOT NULL IDENTITY(1,1),
    booking_id          BIGINT NOT NULL,
    room_id             BIGINT NOT NULL,
    room_price_snapshot DECIMAL(18,2) NOT NULL,
    sort_order          INT NOT NULL DEFAULT 0,

    CONSTRAINT PK_BookingRooms PRIMARY KEY (booking_room_id),
    CONSTRAINT FK_BookingRooms_Booking FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT FK_BookingRooms_Room FOREIGN KEY (room_id) REFERENCES Rooms(room_id),
    CONSTRAINT UQ_BookingRooms_BookingRoom UNIQUE (booking_id, room_id)
);

CREATE INDEX IX_BookingRooms_Room ON BookingRooms(room_id);
CREATE INDEX IX_BookingRooms_Booking ON BookingRooms(booking_id);

CREATE TABLE customer_memberships (
    membership_id          BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id                BIGINT        NOT NULL UNIQUE REFERENCES Users(user_id) ON DELETE CASCADE,
    tier_id                BIGINT        NOT NULL REFERENCES membership_tiers(tier_id),
    total_spent            DECIMAL(18,2) NOT NULL DEFAULT 0,
    booking_count          INT           NOT NULL DEFAULT 0,
    is_first_booking_used  BIT           NOT NULL DEFAULT 0,
    upgraded_at            DATETIME2,
    created_at             DATETIME2     DEFAULT SYSDATETIME(),
    updated_at             DATETIME2     DEFAULT SYSDATETIME()
);


CREATE TABLE voucher_usages (
    usage_id        BIGINT IDENTITY(1,1)  PRIMARY KEY,
    voucher_id      BIGINT                NOT NULL REFERENCES vouchers(voucher_id),
    booking_id      BIGINT                NOT NULL REFERENCES Bookings(booking_id),
    user_id         BIGINT                NOT NULL REFERENCES Users(user_id),
    discount_amount DECIMAL(18, 2)        NOT NULL,
    used_at         DATETIME2             NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT uq_voucher_booking UNIQUE (voucher_id, booking_id)
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
    tax_rate        DECIMAL(5,2)    NOT NULL DEFAULT 8.00,  -- VAT 8%
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

CREATE TABLE Reviews (
    review_id       BIGINT          NOT NULL IDENTITY(1,1),
    booking_id      BIGINT          NOT NULL,
    user_id         BIGINT          NOT NULL,
    room_id         BIGINT          NOT NULL,
    rating_overall  TINYINT         NOT NULL,
    rating_clean    TINYINT         NULL,
    rating_service  TINYINT         NULL,
    rating_location TINYINT         NULL,
    rating_value    TINYINT         NULL,
    comment         NVARCHAR(MAX)   NULL,
    is_approved     BIT             NOT NULL DEFAULT 0,
    admin_reply     NVARCHAR(MAX)   NULL,
    created_at      DATETIME2       NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT PK_Reviews              PRIMARY KEY (review_id),
    CONSTRAINT FK_Reviews_Booking      FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id),
    CONSTRAINT FK_Reviews_User         FOREIGN KEY (user_id)    REFERENCES Users(user_id),
    CONSTRAINT FK_Reviews_Room         FOREIGN KEY (room_id)    REFERENCES Rooms(room_id),
    CONSTRAINT UQ_Reviews_Booking      UNIQUE (booking_id)
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

-- Dữ liệu mẫu: 10 khách sạn thực tế từ HTML, schema mới
GO
INSERT INTO Roles (role_name) VALUES ('ADMIN'), ('MANAGER'), ('CUSTOMER');

-- Hotels, RoomTypes, RoomTypeBeds, Rooms — xem file seed_hotels.sql
-- Inline seed data below:

INSERT INTO Hotels (hotel_code, hotel_name, province, province_code, district, address, star_rating) VALUES
('CB-001', N'Mường Thanh Luxury Cao Bằng', N'Cao Bằng', 'CB', N'TP. Cao Bằng', N'Đường Bế Văn Đàn, phường Hợp Giang', 5),
('HNM-001', N'Mường Thanh Luxury Hà Nam', N'Hà Nam', 'HNM', N'TP. Phủ Lý', N'Khu đất phía Bắc Cầu Hồng Phú, Phường Quang Trung', 5),
('HN-001', N'Mường Thanh Grand Hà Nội', N'Hà Nội', 'HN', N'Hoàng Mai', N'Khu đô thị Bắc Linh Đàm, Phường Đại Kim', 4),
('QN-001', N'Novotel Ha Long Bay', N'Quảng Ninh', 'QN', N'Bãi Cháy', N'Đường Hạ Long, Phường Bãi Cháy, TP. Hạ Long', 4),
('HT-001', N'Mường Thanh Luxury Xuân Thành', N'Hà Tĩnh', 'HT', N'Nghi Xuân', N'Bãi biển Xuân Thành, Xã Xuân Thành', 5),
('DN-001', N'Novotel Danang Premier Han River', N'Đà Nẵng', 'DN', N'Hải Châu', N'36 Bạch Đằng, Quận Hải Châu', 5),
('QNM-001', N'Vinpearl Resort & Spa Hội An', N'Quảng Nam', 'QNM', N'Hội An', N'Bãi biển Cửa Đại, Phường Cẩm An', 5),
('KH-001', N'Mường Thanh Luxury Khánh Hòa', N'Khánh Hòa', 'KH', N'Nha Trang', N'60 Trần Phú, Phường Lộc Thọ', 5),
('CT-001', N'Vinpearl Hotel Cần Thơ', N'Cần Thơ', 'CT', N'Ninh Kiều', N'209 Đường 30 Tháng 4, Phường Xuân Khánh', 5),
('HCM-001', N'Mường Thanh Luxury Sài Gòn', N'TP. Hồ Chí Minh', 'HCM', N'Quận 4', N'132 Bến Vân Đồn, Phường 6', 5);

INSERT INTO RoomTypes (hotel_id, type_name, area_sqm, max_guests, price_per_night, bedrooms, bathrooms, description) VALUES
(1,N'Deluxe King',40,2,1250000,1,1,N'1 giường King (1.8m x 2m)'),
(1,N'Deluxe Twin',40,2,1250000,1,1,N'2 giường đơn (1.2m x 2m)'),
(1,N'Superior King',48,2,1400000,1,1,N'1 giường King (1.8m x 2m)'),
(1,N'Superior Twin',48,2,1400000,1,1,N'2 giường đơn (1.2m x 2m)'),
(1,N'Suite',96,4,2900000,2,2,N'1 giường King + 2 giường đơn'),
(2,N'Deluxe King',33,2,900000,1,1,N'1 giường Double cỡ lớn'),
(2,N'Deluxe Twin',33,2,900000,1,1,N'2 giường đơn (1.2m x 2m)'),
(2,N'Triple',33,3,1100000,1,1,N'3 giường đơn (1.2m x 2m)'),
(3,N'Standard King',28,2,850000,1,1,N'1 giường Double cỡ lớn'),
(3,N'Standard Twin',28,2,850000,1,1,N'2 giường đơn (1.2m x 2m)'),
(3,N'Superior King',32,2,1050000,1,1,N'1 giường Double (1.8m x 2m)'),
(3,N'Suite',55,2,2200000,1,1,N'1 giường Double (1.8m x 2m)'),
(4,N'Standard',32,2,1800000,1,1,N'1 giường Double (1.6m x 2m)'),
(4,N'Superior',32,2,2100000,1,1,N'1 giường Double (1.6m x 2m)'),
(4,N'Executive',42,2,2700000,1,1,N'1 giường Double (1.6m x 2m)'),
(5,N'Deluxe King',35,2,1100000,1,1,N'1 giường Double (1.8m x 2m)'),
(5,N'Deluxe Twin',35,2,1100000,1,1,N'2 giường đơn (1.2m x 2m)'),
(5,N'Superior Sea View',40,2,1500000,1,1,N'1 giường Double (1.8m x 2m)'),
(5,N'Suite',70,2,2500000,1,1,N'1 giường Double (1.8m x 2m)'),
(5,N'President Suite',120,4,4500000,2,2,N'1 giường Double (1.8m x 2m) + 1 phòng ngủ phụ'),
(6,N'Superior',28,2,2200000,1,1,N'1 giường Double (1.6m x 2m)'),
(6,N'Corner Deluxe',28,3,2600000,1,1,N'1 giường Double (1.6m x 2m)'),
(6,N'Executive',28,2,3000000,1,1,N'1 giường Double (1.6m x 2m)'),
(6,N'Suite',55,2,5500000,1,1,N'1 giường Double (1.8m x 2m)'),
(7,N'Deluxe Garden King',39,2,1950000,1,1,N'1 giường Double (1.8m x 2m)'),
(7,N'Deluxe Garden Twin',39,2,1950000,1,1,N'2 giường đơn (1.2m x 2m)'),
(7,N'Deluxe Sea View Twin',39,3,2600000,1,1,N'2 giường đơn (1.2m x 2m)'),
(7,N'Villa 2PN',200,4,8500000,2,2,N'2 giường Double (1.8m x 2m)'),
(7,N'Villa 4PN',400,8,18000000,4,4,N'4 giường Double (1.8m x 2m)'),
(8,N'Deluxe',32,2,1600000,1,1,N'1 giường Double (1.6m x 2m)'),
(8,N'Deluxe Family',40,3,2100000,1,1,N'1 giường Double (1.6m x 2m) + 1 giường đơn'),
(8,N'Premium Deluxe Sea View',45,2,2500000,1,1,N'1 giường Double (1.8m x 2m)'),
(8,N'Suite',80,2,4500000,1,1,N'1 giường Double (1.8m x 2m)'),
(9,N'Deluxe City View King',46,2,2000000,1,1,N'1 giường King (1.8m x 2m)'),
(9,N'Deluxe City View Twin',46,2,2000000,1,1,N'2 giường đơn (1.2m x 2m)'),
(9,N'Deluxe River View',46,2,2500000,1,1,N'1 giường King (1.8m x 2m)'),
(9,N'Suite',90,2,5500000,1,1,N'1 giường King (1.8m x 2m)'),
(9,N'Presidential Suite',225,2,15000000,2,2,N'1 giường King (1.8m x 2m)'),
(10,N'Deluxe King',35,2,1500000,1,1,N'1 giường King (1.8m x 2m)'),
(10,N'Deluxe Twin',35,2,1500000,1,1,N'2 giường đơn (1.2m x 2m)'),
(10,N'Superior King',42,2,2000000,1,1,N'1 giường King (1.8m x 2m)'),
(10,N'Junior Suite',60,2,3500000,1,1,N'1 giường King (1.8m x 2m)'),
(10,N'Suite',85,2,5000000,1,1,N'1 giường King (1.8m x 2m)');

INSERT INTO RoomTypeBeds (type_id, bed_type, quantity, bed_size) VALUES
(1,'KING',1,'1.8m x 2m'),(2,'SINGLE',2,'1.2m x 2m'),(3,'KING',1,'1.8m x 2m'),(4,'SINGLE',2,'1.2m x 2m'),
(5,'KING',1,'1.8m x 2m'),(5,'SINGLE',2,'1.2m x 2m'),
(6,'DOUBLE',1,'1.6m x 2m'),(7,'SINGLE',2,'1.2m x 2m'),(8,'SINGLE',3,'1.2m x 2m'),
(9,'DOUBLE',1,'1.6m x 2m'),(10,'SINGLE',2,'1.2m x 2m'),(11,'DOUBLE',1,'1.8m x 2m'),(12,'DOUBLE',1,'1.8m x 2m'),
(13,'DOUBLE',1,'1.6m x 2m'),(14,'DOUBLE',1,'1.6m x 2m'),(15,'DOUBLE',1,'1.6m x 2m'),
(16,'DOUBLE',1,'1.8m x 2m'),(17,'SINGLE',2,'1.2m x 2m'),(18,'DOUBLE',1,'1.8m x 2m'),(19,'DOUBLE',1,'1.8m x 2m'),(20,'DOUBLE',1,'1.8m x 2m'),
(21,'DOUBLE',1,'1.6m x 2m'),(22,'DOUBLE',1,'1.6m x 2m'),(23,'DOUBLE',1,'1.6m x 2m'),(24,'DOUBLE',1,'1.8m x 2m'),
(25,'DOUBLE',1,'1.8m x 2m'),(26,'SINGLE',2,'1.2m x 2m'),(27,'SINGLE',2,'1.2m x 2m'),(28,'DOUBLE',2,'1.8m x 2m'),(29,'DOUBLE',4,'1.8m x 2m'),
(30,'DOUBLE',1,'1.6m x 2m'),(31,'DOUBLE',1,'1.6m x 2m'),(31,'SINGLE',1,'1.2m x 2m'),(32,'DOUBLE',1,'1.8m x 2m'),(33,'DOUBLE',1,'1.8m x 2m'),
(34,'KING',1,'1.8m x 2m'),(35,'SINGLE',2,'1.2m x 2m'),(36,'KING',1,'1.8m x 2m'),(37,'KING',1,'1.8m x 2m'),(38,'KING',1,'1.8m x 2m'),
(39,'KING',1,'1.8m x 2m'),(40,'SINGLE',2,'1.2m x 2m'),(41,'KING',1,'1.8m x 2m'),(42,'KING',1,'1.8m x 2m'),(43,'KING',1,'1.8m x 2m');

-- Rooms: tạo 3 phòng vật lý cho mỗi loại phòng
DECLARE @TypeID INT = 1;
DECLARE @MaxType INT = (SELECT MAX(type_id) FROM RoomTypes);
DECLARE @HID BIGINT;
DECLARE @RI INT;
WHILE @TypeID <= @MaxType
BEGIN
    SELECT @HID = hotel_id FROM RoomTypes WHERE type_id = @TypeID;
    SET @RI = 1;
    WHILE @RI <= 3
    BEGIN
        INSERT INTO Rooms (hotel_id, type_id, room_number, floor, status)
        VALUES (@HID, @TypeID, CAST(@TypeID AS VARCHAR) + RIGHT('0'+CAST(@RI AS VARCHAR),2), @RI, 'AVAILABLE');
        SET @RI = @RI + 1;
    END
    SET @TypeID = @TypeID + 1;
END
GO

-- Seed data Amenities (10 tiện ích phổ biến)
INSERT INTO Amenities (amenity_name, icon_class, description) VALUES
(N'Hồ bơi',           'pool',           N'Hồ bơi ngoài trời hoặc trong nhà'),
(N'Gym / Fitness',     'fitness_center',  N'Phòng tập thể dục đầy đủ thiết bị'),
(N'WiFi miễn phí',    'wifi',            N'WiFi tốc độ cao miễn phí toàn khách sạn'),
(N'Bãi đỗ xe',        'local_parking',   N'Bãi đỗ xe miễn phí hoặc có phí'),
(N'Nhà hàng',         'restaurant',      N'Nhà hàng phục vụ các bữa ăn trong ngày'),
(N'Spa & Làm đẹp',    'spa',             N'Trung tâm spa và các dịch vụ thư giãn'),
(N'Bar / Lounge',     'local_bar',       N'Bar cocktail và khu vực nghỉ ngơi'),
(N'Phòng họp',        'meeting_room',    N'Phòng họp và hội nghị chuyên nghiệp'),
(N'Lễ tân 24/7',      'support_agent',   N'Dịch vụ lễ tân phục vụ 24/7'),
(N'Bể sục / Jacuzzi', 'hot_tub',         N'Bể sục thư giãn');
GO

-- Seed data HotelAmenityMap — gán tiện ích cho 10 khách sạn
-- (1=Hồ bơi, 2=Gym, 3=WiFi, 4=Bãi đỗ xe, 5=Nhà hàng, 6=Spa, 7=Bar, 8=Phòng họp, 9=Lễ tân 24/7, 10=Bể sục)
INSERT INTO HotelAmenityMap (hotel_id, amenity_id) VALUES
(1,1),(1,2),(1,3),(1,5),(1,6),(1,7),(1,8),(1,9),
(2,1),(2,2),(2,3),(2,5),(2,6),(2,7),(2,8),(2,9),
(3,1),(3,2),(3,3),(3,5),(3,6),(3,7),(3,8),(3,9),
(4,1),(4,2),(4,3),(4,5),(4,7),(4,8),(4,9),
(5,1),(5,2),(5,3),(5,5),(5,6),(5,7),(5,8),(5,9),
(6,1),(6,2),(6,3),(6,5),(6,6),(6,7),(6,8),(6,9),
(7,1),(7,2),(7,3),(7,5),(7,6),(7,9),
(8,1),(8,2),(8,3),(8,5),(8,6),(8,7),(8,9),
(9,1),(9,2),(9,3),(9,5),(9,6),(9,7),(9,9),
(10,1),(10,2),(10,3),(10,5),(10,6),(10,7),(10,8),(10,9);
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

-- Index cho vouchers va voucher_usages
CREATE INDEX idx_vouchers_code   ON vouchers(code);
CREATE INDEX idx_vouchers_status ON vouchers(status);
CREATE INDEX idx_vu_user_voucher ON voucher_usages(user_id, voucher_id);
GO

-- =====================================================
-- THÊM 20 khách sạn từ bộ HTML #2 và #5 (Mường Thanh)
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
INSERT INTO RoomTypes (hotel_id, type_name, area_sqm, max_guests, price_per_night) VALUES
-- 11: Silk Path Hà Nội
(11,N'Deluxe',32,2,2800000),(11,N'Superior Deluxe',38,2,3400000),(11,N'Junior Suite',55,2,5200000),(11,N'Grand Suite',85,2,8500000),
-- 12: FLC Sầm Sơn
(12,N'Deluxe City View',36,2,2100000),(12,N'Deluxe Ocean View',36,2,2800000),(12,N'Deluxe Twin',36,2,2100000),(12,N'Suite Ocean View',72,2,5500000),(12,N'Penthouse Suite',150,4,12000000),
-- 13: Wyndham Hạ Long
(13,N'Deluxe City View',34,2,1900000),(13,N'Deluxe Bay View',34,2,2500000),(13,N'Suite Bay View',68,2,5200000),
-- 14: InterContinental Đà Nẵng
(14,N'Beach View Room',65,2,8500000),(14,N'Ocean View Suite',115,2,14000000),(14,N'Family Suite',145,4,18000000),(14,N'Presidential Suite',400,4,55000000),
-- 15: Hilton Đà Nẵng
(15,N'City View King',38,2,3000000),(15,N'River View King',38,2,3800000),(15,N'River View Twin',38,2,3800000),(15,N'Executive Suite',75,2,8000000),(15,N'Presidential Suite',220,4,28000000),
-- 16: Mercure Hội An
(16,N'Superior',30,2,1400000),(16,N'Deluxe Pool View',32,2,1800000),(16,N'Suite',60,2,4200000),
-- 17: Sheraton Nha Trang
(17,N'Deluxe Sea View',40,2,3200000),(17,N'Club Deluxe Sea View',40,2,4500000),(17,N'Junior Suite',65,3,7500000),(17,N'Grand Suite',100,2,12000000),
-- 18: Premier Village Đà Lạt
(18,N'Cozy Room',28,2,2500000),(18,N'Deluxe Room',38,2,3500000),(18,N'Superior Suite',60,2,6000000),(18,N'Premier Suite',90,2,9500000),
-- 19: Vinpearl Phú Quốc
(19,N'Deluxe Garden View',42,2,3200000),(19,N'Deluxe Sea View',42,2,4500000),(19,N'Family Suite',90,4,9000000),(19,N'Pool Villa 2PN',280,4,18000000),
-- 20: Salinda Phú Quốc
(20,N'Garden Pool Villa',120,2,6500000),(20,N'Beach Front Pool Villa',145,2,10000000),(20,N'Family Pool Villa',200,4,15000000);

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

INSERT INTO vouchers (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, usage_limit_per_user, status, start_date, end_date) VALUES
('WELCOME10', N'Giảm 10% cho lần đặt đầu tiên', 'PERCENTAGE', 10, 500000, 200000, 100, 1, 'ACTIVE', '2025-01-01', '2026-12-31'),
('SUMMER20', N'Giảm 20% mùa hè', 'PERCENTAGE', 20, 1000000, 500000, 50, 1, 'ACTIVE', '2025-06-01', '2026-08-31'),
('FLAT100K', N'Giảm 100.000đ cho đơn từ 500K', 'FIXED_AMOUNT', 100000, 500000, NULL, 200, 1, 'ACTIVE', '2025-01-01', '2026-12-31'),
('FLAT200K', N'Giảm 200.000đ cho đơn từ 1 triệu', 'FIXED_AMOUNT', 200000, 1000000, NULL, 100, 1, 'ACTIVE', '2025-01-01', '2026-12-31'),
('VIP30', N'Giảm 30% cho khách VIP', 'PERCENTAGE', 30, 2000000, 1000000, 20, 1, 'ACTIVE', '2025-01-01', '2026-12-31'),
('WEEKEND15', N'Giảm 15% cuối tuần', 'PERCENTAGE', 15, 800000, 300000, 150, 1, 'ACTIVE', '2025-01-01', '2026-12-31'),
('NEWUSER50K', N'Giảm 50.000đ cho user mới', 'FIXED_AMOUNT', 50000, 200000, NULL, 500, 1, 'ACTIVE', '2025-01-01', '2026-12-31'),
('LUXURY25', N'Giảm 25% khách sạn 5 sao', 'PERCENTAGE', 25, 3000000, 1500000, 30, 1, 'ACTIVE', '2025-01-01', '2026-12-31');


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

-- Seed data for membership_tiers
INSERT INTO membership_tiers (tier_code, tier_level, discount_pct, min_total_spent, min_booking_count,
                               display_name_vi, display_name_en, color_code, benefits_vi, benefits_en)
VALUES
('FIRST_TIME', 0, 10.00, 0,          0,  N'thành viên mới',       'First-Time Guest',   '#607D8B',
 N'["Giảm 10% hóa đơn đầu tiên"]',
 '["10% off your first booking"]'),

('SILVER',     1,  5.00, 5000000,    0,  N'Hội viên bạc',        'Silver Member',      '#9E9E9E',
 N'["Giảm 5% mọi đặt phòng","Ưu tiên đặt phòng"]',
 '["5% off every booking","Priority reservation"]'),

('GOLD',       2, 10.00, 15000000,   0,  N'Hội viên vàng',       'Gold Member',        '#FFC107',
 N'["Giảm 10% mọi đặt phòng","Check-in sớm"]',
 '["10% off every booking","Early check-in"]'),

('DIAMOND',    3, 15.00, 30000000,   0,  N'Hội viên kim cương',  'Diamond Member',     '#00BCD4',
 N'["Giảm 15% mọi đặt phòng","Nâng hạng phòng miễn phí","Dịch vụ miễn phí","Check-in/out linh hoạt"]',
 '["15% off every booking","Free room upgrade","Complimentary services","Flexible check-in/out"]'),

('VIP',        4, 20.00, 60000000,   0,  N'Hội viên VIP',        'VIP Member',         '#9C27B0',
 N'["Giảm 20% mọi đặt phòng","Phòng hạng cao nhất","Dịch vụ cá nhân hóa","Đón tiếp sân bay","Ưu đãi sinh nhật đặc biệt"]',
 '["20% off every booking","Premier room class","Personalized butler service","Airport transfer","Special birthday perks"]');

-- Seed data for group_discount_rules
INSERT INTO group_discount_rules (min_guests, max_guests, discount_pct)
VALUES
(4,  5,    5.00),
(6,  7,    8.00),
(8,  9,   12.00),
(10, NULL, 15.00);

-- Seed data for holiday_periods
INSERT INTO holiday_periods (name_vi, name_en, start_date, end_date, price_multiplier)
VALUES
(N'Tết Nguyên Đán 2026', 'Lunar New Year 2026', '2026-01-26', '2026-02-02', 1.50),
(N'Giỗ Tổ Hùng Vương 2026', 'Hung Kings Festival 2026', '2026-04-06', '2026-04-07', 1.50),
(N'Lễ 30/4 - 1/5 2026', 'Reunification & Labor Day 2026', '2026-04-30', '2026-05-01', 1.50),
(N'Lễ Quốc Khánh 2026', 'National Day 2026', '2026-09-02', '2026-09-03', 1.50),
(N'Giáng Sinh & Năm Mới 2026-2027', 'Christmas & New Year 2026-2027', '2026-12-24', '2027-01-02', 1.50);
GO

-- Seed high-quality room images based on room type names
UPDATE r
SET r.image_urls = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800,https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800'
FROM Rooms r
INNER JOIN RoomTypes rt ON r.type_id = rt.type_id
WHERE rt.type_name LIKE N'%Suite%' 
   OR rt.type_name LIKE N'%President%' 
   OR rt.type_name LIKE N'%Royal%' 
   OR rt.type_name LIKE N'%Villa%' 
   OR rt.type_name LIKE N'%Căn hộ%' 
   OR rt.type_name LIKE N'%Penthouse%';

UPDATE r
SET r.image_urls = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800,https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'
FROM Rooms r
INNER JOIN RoomTypes rt ON r.type_id = rt.type_id
WHERE (rt.type_name LIKE N'%Deluxe%' 
    OR rt.type_name LIKE N'%Executive%' 
    OR rt.type_name LIKE N'%Premium%' 
    OR rt.type_name LIKE N'%Superior%')
  AND r.image_urls IS NULL;

UPDATE r
SET r.image_urls = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800,https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800'
FROM Rooms r
INNER JOIN RoomTypes rt ON r.type_id = rt.type_id
WHERE r.image_urls IS NULL;
GO

ALTER TABLE Bookings ADD
    booking_type           VARCHAR(20)  NOT NULL DEFAULT 'OVERNIGHT',
    -- 'OVERNIGHT' = qua đêm bình thường
    -- 'SAME_DAY'  = nhận trả trong ngày

    expected_checkout_time TIME         NULL;
    -- Giờ trả phòng mong muốn (chỉ dùng khi SAME_DAY)

CREATE TABLE BookingRooms (
    booking_room_id     BIGINT NOT NULL IDENTITY(1,1),
    booking_id          BIGINT NOT NULL,
    room_id             BIGINT NOT NULL,
    room_price_snapshot DECIMAL(18,2) NOT NULL,
    sort_order          INT NOT NULL DEFAULT 0,
    CONSTRAINT PK_BookingRooms PRIMARY KEY (booking_room_id),
    CONSTRAINT FK_BookingRooms_Booking FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT FK_BookingRooms_Room FOREIGN KEY (room_id) REFERENCES Rooms(room_id),
    CONSTRAINT UQ_BookingRooms_BookingRoom UNIQUE (booking_id, room_id)
);
CREATE INDEX IX_BookingRooms_Room ON BookingRooms(room_id);
CREATE INDEX IX_BookingRooms_Booking ON BookingRooms(booking_id);
