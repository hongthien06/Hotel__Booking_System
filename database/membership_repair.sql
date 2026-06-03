USE HotelBookingDB;
GO

IF OBJECT_ID('membership_tiers', 'U') IS NULL
BEGIN
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
END
GO

IF NOT EXISTS (SELECT 1 FROM membership_tiers WHERE tier_code = 'FIRST_TIME')
BEGIN
    INSERT INTO membership_tiers (tier_code, tier_level, discount_pct, min_total_spent, min_booking_count,
                                  display_name_vi, display_name_en, color_code, benefits_vi, benefits_en)
    VALUES
    ('FIRST_TIME', 0, 10.00, 0,        0,  N'thành viên mới',      N'First-Time Guest', '#607D8B',
     N'["Giảm 10% hóa đơn đầu tiên"]',
     N'["10% off your first booking"]'),
    ('SILVER',     1,  5.00, 5000000,  2,  N'Hội viên bạc',       N'Silver Member',     '#9E9E9E',
     N'["Giảm 5% mọi đặt phòng","Ưu tiên đặt phòng"]',
     N'["5% off every booking","Priority reservation"]'),
    ('GOLD',       2, 10.00, 15000000, 5,  N'Hội viên vàng',      N'Gold Member',       '#FFC107',
     N'["Giảm 10% mọi đặt phòng","Check-in sớm"]',
     N'["10% off every booking","Early check-in"]'),
    ('DIAMOND',    3, 15.00, 30000000, 10, N'Hội viên kim cương', N'Diamond Member',    '#00BCD4',
     N'["Giảm 15% mọi đặt phòng","Nâng hạng phòng miễn phí","Dịch vụ miễn phí","Check-in/out linh hoạt"]',
     N'["15% off every booking","Free room upgrade","Complimentary services","Flexible check-in/out"]'),
    ('VIP',        4, 20.00, 60000000, 20, N'Hội viên VIP',       N'VIP Member',        '#9C27B0',
     N'["Giảm 20% mọi đặt phòng","Phòng hạng cao nhất","Dịch vụ cá nhân hóa","Đón tiếp sân bay","Ưu đãi sinh nhật đặc biệt"]',
     N'["20% off every booking","Premier room class","Personalized butler service","Airport transfer","Special birthday perks"]');
END
GO

IF COL_LENGTH('Bookings', 'membership_discount_pct') IS NULL
    ALTER TABLE Bookings ADD membership_discount_pct DECIMAL(5,2) NOT NULL DEFAULT 0;
IF COL_LENGTH('Bookings', 'membership_discount_amt') IS NULL
    ALTER TABLE Bookings ADD membership_discount_amt DECIMAL(18,2) NOT NULL DEFAULT 0;
IF COL_LENGTH('Bookings', 'is_first_booking_discount') IS NULL
    ALTER TABLE Bookings ADD is_first_booking_discount BIT NOT NULL DEFAULT 0;
IF COL_LENGTH('Bookings', 'holiday_multiplier') IS NULL
    ALTER TABLE Bookings ADD holiday_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.00;
IF COL_LENGTH('Bookings', 'holiday_period_id') IS NULL
    ALTER TABLE Bookings ADD holiday_period_id BIGINT NULL;
IF COL_LENGTH('Bookings', 'group_discount_pct') IS NULL
    ALTER TABLE Bookings ADD group_discount_pct DECIMAL(5,2) NOT NULL DEFAULT 0;
IF COL_LENGTH('Bookings', 'group_discount_amt') IS NULL
    ALTER TABLE Bookings ADD group_discount_amt DECIMAL(18,2) NOT NULL DEFAULT 0;
IF COL_LENGTH('Bookings', 'guest_count') IS NULL
    ALTER TABLE Bookings ADD guest_count INT NOT NULL DEFAULT 1;
GO

IF OBJECT_ID('holiday_periods', 'U') IS NOT NULL
   AND NOT EXISTS (
       SELECT 1
       FROM sys.foreign_keys
       WHERE name = 'fk_bookings_holiday_period'
         AND parent_object_id = OBJECT_ID('Bookings')
   )
BEGIN
    ALTER TABLE Bookings
    ADD CONSTRAINT fk_bookings_holiday_period
    FOREIGN KEY (holiday_period_id) REFERENCES holiday_periods(holiday_id);
END
GO
