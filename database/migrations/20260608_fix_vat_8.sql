USE HotelBookingDB;
GO

IF OBJECT_ID('dbo.schema_migrations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.schema_migrations (
        migration_key VARCHAR(100) NOT NULL PRIMARY KEY,
        applied_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );
END;
GO

IF EXISTS (SELECT 1 FROM dbo.schema_migrations WHERE migration_key = '20260608_fix_vat_8')
BEGIN
    PRINT 'Migration 20260608_fix_vat_8 already applied. Skipping.';
    RETURN;
END;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID('tempdb..#InvoiceFix', 'U') IS NOT NULL
        DROP TABLE #InvoiceFix;

    SELECT
        i.invoice_id,
        i.payment_id,
        CAST(ROUND(i.subtotal * 0.10, 2) AS DECIMAL(18, 2)) AS old_tax_amount,
        CAST(ROUND(i.subtotal * 0.08, 2) AS DECIMAL(18, 2)) AS new_tax_amount,
        CAST(ROUND(i.subtotal + ROUND(i.subtotal * 0.10, 2) - i.discount_amount, 2) AS DECIMAL(18, 2)) AS old_total_amount,
        CAST(ROUND(i.subtotal + ROUND(i.subtotal * 0.08, 2) - i.discount_amount, 2) AS DECIMAL(18, 2)) AS new_total_amount
    INTO #InvoiceFix
    FROM Invoices i
    WHERE i.tax_amount = CAST(ROUND(i.subtotal * 0.10, 2) AS DECIMAL(18, 2))
      AND i.total_amount = CAST(ROUND(i.subtotal + ROUND(i.subtotal * 0.10, 2) - i.discount_amount, 2) AS DECIMAL(18, 2));

    UPDATE i
    SET
        i.tax_rate = 8.00,
        i.tax_amount = f.new_tax_amount,
        i.total_amount = f.new_total_amount
    FROM Invoices i
    INNER JOIN #InvoiceFix f ON f.invoice_id = i.invoice_id;

    UPDATE p
    SET p.amount = f.new_total_amount
    FROM Payments p
    INNER JOIN #InvoiceFix f ON f.payment_id = p.payment_id
    WHERE p.amount = f.old_total_amount;

    IF OBJECT_ID('tempdb..#PaymentFixNoInvoice', 'U') IS NOT NULL
        DROP TABLE #PaymentFixNoInvoice;

    ;WITH RoomTotals AS (
        SELECT
            b.booking_id,
            CAST(SUM(br.room_price_snapshot * b.total_nights) AS DECIMAL(18, 2)) AS room_total
        FROM Bookings b
        INNER JOIN BookingRooms br ON br.booking_id = b.booking_id
        GROUP BY b.booking_id
    ),
    ServiceTotals AS (
        SELECT
            bs.booking_id,
            CAST(SUM(bs.quantity * bs.unit_price_snap) AS DECIMAL(18, 2)) AS service_total
        FROM BookingServices bs
        GROUP BY bs.booking_id
    )
    SELECT
        p.payment_id,
        CAST(subtotal.subtotal AS DECIMAL(18, 2)) AS subtotal,
        CAST(ROUND(subtotal.subtotal + ROUND(subtotal.subtotal * 0.10, 2) - b.discount_amount, 2) AS DECIMAL(18, 2)) AS old_total_amount,
        CAST(ROUND(subtotal.subtotal + ROUND(subtotal.subtotal * 0.08, 2) - b.discount_amount, 2) AS DECIMAL(18, 2)) AS new_total_amount
    INTO #PaymentFixNoInvoice
    FROM Payments p
    INNER JOIN Bookings b ON b.booking_id = p.booking_id
    LEFT JOIN Invoices i ON i.payment_id = p.payment_id
    OUTER APPLY (
        SELECT
            COALESCE(rt.room_total,
                CAST(b.room_price_snapshot * b.total_nights AS DECIMAL(18, 2))) +
            COALESCE(st.service_total, 0) AS subtotal
        FROM (SELECT 1 AS marker) seed
        LEFT JOIN RoomTotals rt ON rt.booking_id = b.booking_id
        LEFT JOIN ServiceTotals st ON st.booking_id = b.booking_id
    ) subtotal
    WHERE i.invoice_id IS NULL
      AND p.amount = CAST(ROUND(subtotal.subtotal + ROUND(subtotal.subtotal * 0.10, 2) - b.discount_amount, 2) AS DECIMAL(18, 2));

    UPDATE p
    SET p.amount = f.new_total_amount
    FROM Payments p
    INNER JOIN #PaymentFixNoInvoice f ON f.payment_id = p.payment_id;

    INSERT INTO dbo.schema_migrations (migration_key)
    VALUES ('20260608_fix_vat_8');

    COMMIT TRANSACTION;
    PRINT 'Migration 20260608_fix_vat_8 applied successfully.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO
