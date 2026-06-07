-- ============================================================
-- Membership Tier System Migration
-- Replaces voucher-based discounts with membership tiers
-- ============================================================

-- 1. Membership tier configuration (admin configures)
CREATE TABLE membership_tiers (
    tier_id          BIGINT PRIMARY KEY IDENTITY(1,1),
    tier_code        NVARCHAR(20)  NOT NULL UNIQUE,   -- FIRST_TIME, SILVER, GOLD, DIAMOND, VIP
    tier_level       INT           NOT NULL,            -- 0=first, 1=silver, 2=gold, 3=diamond, 4=vip
    discount_pct     DECIMAL(5,2)  NOT NULL DEFAULT 0,
    min_total_spent  DECIMAL(18,2) NOT NULL DEFAULT 0,  -- tổng chi tiêu tối thiểu để đạt hạng
    min_booking_count INT          NOT NULL DEFAULT 0,  -- số lần đặt tối thiểu
    display_name_vi  NVARCHAR(100) NOT NULL,
    display_name_en  NVARCHAR(100) NOT NULL,
    color_code       NVARCHAR(10)  DEFAULT '#888888',
    benefits_vi      NVARCHAR(MAX),
    benefits_en      NVARCHAR(MAX),
    created_at       DATETIME2     DEFAULT SYSDATETIME()
);

-- 2. Customer membership (one record per user)
CREATE TABLE customer_memberships (
    membership_id          BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id                BIGINT        NOT NULL UNIQUE REFERENCES Users(user_id),
    tier_id                BIGINT        NOT NULL REFERENCES membership_tiers(tier_id),
    total_spent            DECIMAL(18,2) NOT NULL DEFAULT 0,
    booking_count          INT           NOT NULL DEFAULT 0,
    is_first_booking_used  BIT           NOT NULL DEFAULT 0,  -- 1 = ưu đãi lần đầu đã dùng
    upgraded_at            DATETIME2,
    created_at             DATETIME2     DEFAULT SYSDATETIME(),
    updated_at             DATETIME2     DEFAULT SYSDATETIME()
);

-- 3. Holiday / peak pricing periods
CREATE TABLE holiday_periods (
    holiday_id       BIGINT PRIMARY KEY IDENTITY(1,1),
    name_vi          NVARCHAR(200) NOT NULL,
    name_en          NVARCHAR(200) NOT NULL,
    start_date       DATE          NOT NULL,
    end_date         DATE          NOT NULL,
    price_multiplier DECIMAL(5,2)  NOT NULL DEFAULT 1.50,  -- 1.5 = tăng 150% (×1.5)
    is_active        BIT           NOT NULL DEFAULT 1,
    created_at       DATETIME2     DEFAULT SYSDATETIME(),
    CONSTRAINT chk_holiday_dates CHECK (end_date >= start_date)
);

-- 4. Group discount rules (lũy tiến theo số khách)
CREATE TABLE group_discount_rules (
    rule_id      BIGINT PRIMARY KEY IDENTITY(1,1),
    min_guests   INT          NOT NULL,
    max_guests   INT,                              -- NULL = không giới hạn
    discount_pct DECIMAL(5,2) NOT NULL,
    is_active    BIT          NOT NULL DEFAULT 1,
    CONSTRAINT chk_group_guests CHECK (min_guests >= 1)
);

-- 5. Add new discount columns to Bookings (keep discount_amount for backward compat)
ALTER TABLE Bookings ADD
    membership_discount_pct   DECIMAL(5,2)  NOT NULL DEFAULT 0,
    membership_discount_amt   DECIMAL(18,2) NOT NULL DEFAULT 0,
    is_first_booking_discount BIT           NOT NULL DEFAULT 0,
    holiday_multiplier        DECIMAL(5,2)  NOT NULL DEFAULT 1.00,
    holiday_period_id         BIGINT        REFERENCES holiday_periods(holiday_id),
    group_discount_pct        DECIMAL(5,2)  NOT NULL DEFAULT 0,
    group_discount_amt        DECIMAL(18,2) NOT NULL DEFAULT 0,
    guest_count               INT           NOT NULL DEFAULT 1;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Membership tiers
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
 N'["Giảm 10% mọi đặt phòng","Nâng hạng phòng miễn phí","Check-in sớm"]',
 '["10% off every booking","Free room upgrade","Early check-in"]'),

('DIAMOND',    3, 15.00, 30000000,   0,  N'Hội viên kim cương',  'Diamond Member',     '#00BCD4',
 N'["Giảm 15% mọi đặt phòng","Nâng hạng phòng miễn phí","Dịch vụ miễn phí","Check-in/out linh hoạt"]',
 '["15% off every booking","Free room upgrade","Complimentary services","Flexible check-in/out"]'),

('VIP',        4, 20.00, 60000000,   0,  N'Hội viên VIP',        'VIP Member',         '#9C27B0',
 N'["Giảm 20% mọi đặt phòng","Phòng hạng cao nhất","Dịch vụ cá nhân hóa","Đón tiếp sân bay","Ưu đãi sinh nhật đặc biệt"]',
 '["20% off every booking","Premier room class","Personalized butler service","Airport transfer","Special birthday perks"]');

-- Group discount rules (áp dụng khi >= 4 khách, cộng thêm với ưu đãi thành viên)
INSERT INTO group_discount_rules (min_guests, max_guests, discount_pct)
VALUES
(4,  5,    5.00),
(6,  7,    8.00),
(8,  9,   12.00),
(10, NULL, 15.00);

-- Sample holiday periods (có thể admin thêm/sửa qua API)
INSERT INTO holiday_periods (name_vi, name_en, start_date, end_date, price_multiplier)
VALUES
(N'Tết Nguyên Đán 2026', 'Lunar New Year 2026', '2026-01-26', '2026-02-02', 1.50),
(N'Giỗ Tổ Hùng Vương 2026', 'Hung Kings Festival 2026', '2026-04-06', '2026-04-07', 1.50),
(N'Lễ 30/4 - 1/5 2026', 'Reunification & Labor Day 2026', '2026-04-30', '2026-05-01', 1.50),
(N'Lễ Quốc Khánh 2026', 'National Day 2026', '2026-09-02', '2026-09-03', 1.50),
(N'Giáng Sinh & Năm Mới 2026-2027', 'Christmas & New Year 2026-2027', '2026-12-24', '2027-01-02', 1.50);
