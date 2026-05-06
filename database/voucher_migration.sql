-- =============================================
-- Voucher Migration - Chay script nay tren SQL Server
-- An toan: kiem tra truoc khi tao/alter
-- =============================================

-- 1. Tao bang vouchers (neu chua co)
IF OBJECT_ID('dbo.vouchers', 'U') IS NULL
BEGIN
    CREATE TABLE vouchers (
        voucher_id           BIGINT IDENTITY(1,1)  PRIMARY KEY,
        code                 NVARCHAR(50)           NOT NULL UNIQUE,
        description          NVARCHAR(500),
        discount_type        NVARCHAR(20)           NOT NULL,
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
    PRINT 'Created table: vouchers';
END
ELSE
    PRINT 'Table vouchers already exists, skipped.';
GO

-- 2. Tao bang voucher_usages (neu chua co)
IF OBJECT_ID('dbo.voucher_usages', 'U') IS NULL
BEGIN
    CREATE TABLE voucher_usages (
        usage_id        BIGINT IDENTITY(1,1)  PRIMARY KEY,
        voucher_id      BIGINT                NOT NULL REFERENCES vouchers(voucher_id),
        booking_id      BIGINT                NOT NULL REFERENCES Bookings(booking_id),
        user_id         BIGINT                NOT NULL REFERENCES Users(user_id),
        discount_amount DECIMAL(18, 2)        NOT NULL,
        used_at         DATETIME2             NOT NULL DEFAULT SYSDATETIME(),

        CONSTRAINT uq_voucher_booking UNIQUE (voucher_id, booking_id)
    );
    PRINT 'Created table: voucher_usages';
END
ELSE
    PRINT 'Table voucher_usages already exists, skipped.';
GO

-- 3. Them cot voucher_id vao Bookings (neu chua co)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Bookings' AND COLUMN_NAME = 'voucher_id'
)
BEGIN
    ALTER TABLE Bookings
        ADD voucher_id BIGINT NULL REFERENCES vouchers(voucher_id);
    PRINT 'Added column: Bookings.voucher_id';
END
ELSE
    PRINT 'Column Bookings.voucher_id already exists, skipped.';
GO

-- 4. Them cot discount_amount vao Bookings (neu chua co)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Bookings' AND COLUMN_NAME = 'discount_amount'
)
BEGIN
    ALTER TABLE Bookings
        ADD discount_amount DECIMAL(18, 2) NOT NULL DEFAULT 0;
    PRINT 'Added column: Bookings.discount_amount';
END
ELSE
    PRINT 'Column Bookings.discount_amount already exists, skipped.';
GO

-- 5. Tao index (neu chua co)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_vouchers_code')
    CREATE INDEX idx_vouchers_code   ON vouchers(code);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_vouchers_status')
    CREATE INDEX idx_vouchers_status ON vouchers(status);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_vu_user_voucher')
    CREATE INDEX idx_vu_user_voucher ON voucher_usages(user_id, voucher_id);

PRINT 'Migration completed successfully.';
GO
