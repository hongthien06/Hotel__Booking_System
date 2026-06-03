-- Multi-room booking migration for SQL Server
-- Run after HotelBookingDB.sql / existing migrations.

IF OBJECT_ID('dbo.BookingRooms', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.BookingRooms (
        booking_room_id     BIGINT IDENTITY(1,1) PRIMARY KEY,
        booking_id          BIGINT NOT NULL,
        room_id             BIGINT NOT NULL,
        room_price_snapshot DECIMAL(18, 2) NOT NULL,
        sort_order          INT NOT NULL DEFAULT 0,

        CONSTRAINT fk_booking_rooms_booking
            FOREIGN KEY (booking_id) REFERENCES dbo.Bookings(booking_id) ON DELETE CASCADE,
        CONSTRAINT fk_booking_rooms_room
            FOREIGN KEY (room_id) REFERENCES dbo.Rooms(room_id),
        CONSTRAINT uq_booking_rooms_booking_room
            UNIQUE (booking_id, room_id)
    );

    CREATE INDEX idx_booking_rooms_room ON dbo.BookingRooms(room_id);
    CREATE INDEX idx_booking_rooms_booking ON dbo.BookingRooms(booking_id);
    PRINT 'Created table: BookingRooms';
END
ELSE
    PRINT 'Table BookingRooms already exists, skipped.';
GO

INSERT INTO dbo.BookingRooms (booking_id, room_id, room_price_snapshot, sort_order)
SELECT b.booking_id, b.room_id, b.room_price_snapshot, 0
FROM dbo.Bookings b
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.BookingRooms br
    WHERE br.booking_id = b.booking_id
      AND br.room_id = b.room_id
);
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Bookings' AND COLUMN_NAME = 'merged_into_booking_id'
)
BEGIN
    ALTER TABLE dbo.Bookings ADD merged_into_booking_id BIGINT NULL;
    ALTER TABLE dbo.Bookings
        ADD CONSTRAINT fk_bookings_merged_into
        FOREIGN KEY (merged_into_booking_id) REFERENCES dbo.Bookings(booking_id);
    PRINT 'Added column: Bookings.merged_into_booking_id';
END
ELSE
    PRINT 'Column Bookings.merged_into_booking_id already exists, skipped.';
GO
