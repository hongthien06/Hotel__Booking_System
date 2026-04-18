CREATE TABLE [Users] (
  [user_id] BIGINT NOT NULL IDENTITY(1, 1),
  [full_name] NVARCHAR(150) NOT NULL,
  [email] VARCHAR(255) NOT NULL,
  [phone] VARCHAR(20),
  [password_hash] VARCHAR(255) NOT NULL,
  [refresh_token] VARCHAR(512),
  [avatar_url] VARCHAR(512),
  [is_active] BIT NOT NULL DEFAULT (1),
  [created_at] DATETIME2 NOT NULL DEFAULT (SYSDATETIME()),
  [updated_at] DATETIME2 NOT NULL DEFAULT (SYSDATETIME()),
  CONSTRAINT [CK_Users_Email] CHECK (email LIKE '%_@__%.__%'),
  PRIMARY KEY ([user_id])
)
GO

CREATE TABLE [Roles] (
  [role_id] INT NOT NULL IDENTITY(1, 1),
  [role_name] VARCHAR(50) NOT NULL,
  [description] NVARCHAR(255),
  PRIMARY KEY ([role_id])
)
GO

CREATE TABLE [UserRoles] (
  [user_id] BIGINT NOT NULL,
  [role_id] INT NOT NULL,
  [assigned_at] DATETIME2 NOT NULL DEFAULT (SYSDATETIME()),
  PRIMARY KEY ([user_id], [role_id])
)
GO

CREATE TABLE [RoomTypes] (
  [type_id] INT NOT NULL IDENTITY(1, 1),
  [type_name] NVARCHAR(100) NOT NULL,
  [description] NVARCHAR(500),
  [base_price] DECIMAL(18,2) NOT NULL,
  [max_occupancy] TINYINT NOT NULL DEFAULT (2),
  CONSTRAINT [CK_RoomTypes_Price] CHECK (base_price > 0),
  CONSTRAINT [CK_RoomTypes_Cap] CHECK (max_occupancy BETWEEN 1 AND 10),
  PRIMARY KEY ([type_id])
)
GO

CREATE TABLE [Rooms] (
  [room_id] BIGINT NOT NULL IDENTITY(1, 1),
  [type_id] INT NOT NULL,
  [room_number] VARCHAR(20) NOT NULL,
  [floor] SMALLINT,
  [bed_type] VARCHAR(20) NOT NULL DEFAULT 'DOUBLE',
  [province] NVARCHAR(100) NOT NULL,
  [district] NVARCHAR(100) NOT NULL,
  [address] NVARCHAR(500),
  [price_per_night] DECIMAL(18,2) NOT NULL,
  [thumbnail_url] VARCHAR(512),
  [image_urls] NVARCHAR(MAX),
  [description] NVARCHAR(MAX),
  [status] VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
  [created_at] DATETIME2 NOT NULL DEFAULT (SYSDATETIME()),
  [updated_at] DATETIME2 NOT NULL DEFAULT (SYSDATETIME()),
  CONSTRAINT [CK_Rooms_Price] CHECK (price_per_night > 0),
  CONSTRAINT [CK_Rooms_BedType] CHECK (bed_type IN ('SINGLE','DOUBLE','TRIPLE','KING','QUEEN')),
  CONSTRAINT [CK_Rooms_Status] CHECK (status   IN ('AVAILABLE','OCCUPIED','MAINTENANCE','INACTIVE')),
  PRIMARY KEY ([room_id])
)
GO

CREATE TABLE [Amenities] (
  [amenity_id] INT NOT NULL IDENTITY(1, 1),
  [amenity_name] NVARCHAR(100) NOT NULL,
  [icon_class] VARCHAR(100),
  [description] NVARCHAR(255),
  PRIMARY KEY ([amenity_id])
)
GO

CREATE TABLE [RoomAmenityMap] (
  [room_id] BIGINT NOT NULL,
  [amenity_id] INT NOT NULL,
  PRIMARY KEY ([room_id], [amenity_id])
)
GO

CREATE TABLE [ExtraServices] (
  [service_id] INT NOT NULL IDENTITY(1, 1),
  [service_name] NVARCHAR(150) NOT NULL,
  [description] NVARCHAR(500),
  [unit_price] DECIMAL(18,2) NOT NULL,
  [price_type] VARCHAR(20) NOT NULL DEFAULT 'PER_BOOKING',
  [is_active] BIT NOT NULL DEFAULT (1),
  CONSTRAINT [CK_Services_Price] CHECK (unit_price >= 0),
  CONSTRAINT [CK_Services_PriceType] CHECK (price_type IN ('PER_BOOKING','PER_NIGHT','PER_PERSON')),
  PRIMARY KEY ([service_id])
)
GO

CREATE TABLE [Bookings] (
  [booking_id] BIGINT NOT NULL IDENTITY(1, 1),
  [user_id] BIGINT NOT NULL,
  [room_id] BIGINT NOT NULL,
  [check_in_date] DATE NOT NULL,
  [check_out_date] DATE NOT NULL,
  [actual_checkin] DATETIME2,
  [actual_checkout] DATETIME2,
  [num_guests] TINYINT NOT NULL DEFAULT (1),
  [special_request] NVARCHAR(500),
  [room_price_snapshot] DECIMAL(18,2) NOT NULL,
  [total_nights] SMALLINT NOT NULL,
  [status] VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  [expires_at] DATETIME2,
  [booking_code] VARCHAR(20) NOT NULL,
  [version] INT NOT NULL DEFAULT (0),
  [created_at] DATETIME2 NOT NULL DEFAULT (SYSDATETIME()),
  [updated_at] DATETIME2 NOT NULL DEFAULT (SYSDATETIME()),
  CONSTRAINT [CK_Bookings_Dates] CHECK (check_out_date > check_in_date),
  CONSTRAINT [CK_Bookings_Guests] CHECK (num_guests >= 1),
  CONSTRAINT [CK_Bookings_Nights] CHECK (total_nights >= 1),
  CONSTRAINT [CK_Bookings_Status] CHECK (status IN (
        'PENDING','CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED','REFUNDED'
    )),
  PRIMARY KEY ([booking_id])
)
GO

CREATE TABLE [BookingServices] (
  [booking_id] BIGINT NOT NULL,
  [service_id] INT NOT NULL,
  [quantity] SMALLINT NOT NULL DEFAULT (1),
  [unit_price_snap] DECIMAL(18,2) NOT NULL,
  [subtotal] AS quantity * unit_price_snap PERSISTED,
  CONSTRAINT [CK_BS_Quantity] CHECK (quantity >= 1),
  PRIMARY KEY ([booking_id], [service_id])
)
GO

CREATE TABLE [Payments] (
  [payment_id] BIGINT NOT NULL IDENTITY(1, 1),
  [booking_id] BIGINT NOT NULL,
  [gateway] VARCHAR(20) NOT NULL,
  [transaction_id] VARCHAR(255),
  [amount] DECIMAL(18,2) NOT NULL,
  [currency] VARCHAR(10) NOT NULL DEFAULT 'VND',
  [status] VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  [paid_at] DATETIME2,
  [raw_response] NVARCHAR(MAX),
  [ip_address] VARCHAR(50),
  [created_at] DATETIME2 NOT NULL DEFAULT (SYSDATETIME()),
  CONSTRAINT [CK_Payments_Amount] CHECK (amount > 0),
  CONSTRAINT [CK_Payments_Gateway] CHECK (gateway IN ('MOMO','VNPAY','ZALOPAY','CASH','TRANSFER')),
  CONSTRAINT [CK_Payments_Status] CHECK (status  IN ('PENDING','SUCCESS','FAILED','REFUNDED')),
  PRIMARY KEY ([payment_id])
)
GO

CREATE TABLE [Invoices] (
  [invoice_id] BIGINT NOT NULL IDENTITY(1, 1),
  [booking_id] BIGINT NOT NULL,
  [payment_id] BIGINT NOT NULL,
  [invoice_number] VARCHAR(30) NOT NULL,
  [subtotal] DECIMAL(18,2) NOT NULL,
  [tax_rate] DECIMAL(5,2) NOT NULL DEFAULT (10),
  [tax_amount] DECIMAL(18,2) NOT NULL,
  [discount_amount] DECIMAL(18,2) NOT NULL DEFAULT (0),
  [total_amount] DECIMAL(18,2) NOT NULL,
  [pdf_url] VARCHAR(512),
  [issued_at] DATETIME2 NOT NULL DEFAULT (SYSDATETIME()),
  [notes] NVARCHAR(500),
  CONSTRAINT [CK_Invoices_Total] CHECK (total_amount >= 0),
  PRIMARY KEY ([invoice_id])
)
GO

CREATE TABLE [InvoiceItems] (
  [item_id] BIGINT NOT NULL IDENTITY(1, 1),
  [invoice_id] BIGINT NOT NULL,
  [item_type] VARCHAR(20) NOT NULL,
  [description] NVARCHAR(255) NOT NULL,
  [quantity] SMALLINT NOT NULL DEFAULT (1),
  [unit_price] DECIMAL(18,2) NOT NULL,
  [line_total] AS quantity * unit_price PERSISTED,
  CONSTRAINT [CK_InvoiceItems_Type] CHECK (item_type IN ('ROOM','SERVICE','DISCOUNT','TAX')),
  PRIMARY KEY ([item_id])
)
GO

CREATE TABLE [Reviews] (
  [review_id] BIGINT NOT NULL IDENTITY(1, 1),
  [booking_id] BIGINT NOT NULL,
  [user_id] BIGINT NOT NULL,
  [room_id] BIGINT NOT NULL,
  [rating_overall] TINYINT NOT NULL,
  [rating_clean] TINYINT,
  [rating_service] TINYINT,
  [rating_location] TINYINT,
  [rating_value] TINYINT,
  [comment] NVARCHAR(MAX),
  [is_approved] BIT NOT NULL DEFAULT (0),
  [admin_reply] NVARCHAR(MAX),
  [created_at] DATETIME2 NOT NULL DEFAULT (SYSDATETIME()),
  CONSTRAINT [CK_Reviews_Rating] CHECK (rating_overall BETWEEN 1 AND 5),
  CONSTRAINT [CK_Reviews_Clean] CHECK (rating_clean    IS NULL OR rating_clean    BETWEEN 1 AND 5),
  CONSTRAINT [CK_Reviews_Service] CHECK (rating_service  IS NULL OR rating_service  BETWEEN 1 AND 5),
  CONSTRAINT [CK_Reviews_Location] CHECK (rating_location IS NULL OR rating_location BETWEEN 1 AND 5),
  CONSTRAINT [CK_Reviews_Value] CHECK (rating_value    IS NULL OR rating_value    BETWEEN 1 AND 5),
  PRIMARY KEY ([review_id])
)
GO

CREATE UNIQUE INDEX [UQ_Users_Email] ON [Users] ("email")
GO

CREATE UNIQUE INDEX [UQ_Roles_Name] ON [Roles] ("role_name")
GO

CREATE UNIQUE INDEX [UQ_RoomTypes_Name] ON [RoomTypes] ("type_name")
GO

CREATE UNIQUE INDEX [UQ_Rooms_Number] ON [Rooms] ("room_number")
GO

CREATE UNIQUE INDEX [UQ_Amenities_Name] ON [Amenities] ("amenity_name")
GO

CREATE UNIQUE INDEX [UQ_Bookings_Code] ON [Bookings] ("booking_code")
GO

CREATE INDEX [IX_Bookings_Room_Status_Dates] ON [Bookings] ("room_id", "status", "check_in_date", "check_out_date")
GO

CREATE INDEX [IX_Bookings_User] ON [Bookings] ("user_id", "status")
GO

CREATE INDEX [IX_Bookings_Expires] ON [Bookings] ("expires_at", "status")
GO

CREATE UNIQUE INDEX [UQ_Payments_TxnId] ON [Payments] ("transaction_id")
GO

CREATE UNIQUE INDEX [UQ_Invoices_Number] ON [Invoices] ("invoice_number")
GO

CREATE UNIQUE INDEX [UQ_Invoices_Booking] ON [Invoices] ("booking_id")
GO

CREATE UNIQUE INDEX [UQ_Reviews_Booking] ON [Reviews] ("booking_id")
GO

ALTER TABLE [UserRoles] ADD CONSTRAINT [FK_UserRoles_User] FOREIGN KEY ([user_id]) REFERENCES [Users] ([user_id]) ON DELETE CASCADE
GO

ALTER TABLE [UserRoles] ADD CONSTRAINT [FK_UserRoles_Role] FOREIGN KEY ([role_id]) REFERENCES [Roles] ([role_id]) ON DELETE CASCADE
GO

ALTER TABLE [Rooms] ADD CONSTRAINT [FK_Rooms_Type] FOREIGN KEY ([type_id]) REFERENCES [RoomTypes] ([type_id])
GO

ALTER TABLE [RoomAmenityMap] ADD CONSTRAINT [FK_RAM_Room] FOREIGN KEY ([room_id]) REFERENCES [Rooms] ([room_id]) ON DELETE CASCADE
GO

ALTER TABLE [RoomAmenityMap] ADD CONSTRAINT [FK_RAM_Amenity] FOREIGN KEY ([amenity_id]) REFERENCES [Amenities] ([amenity_id]) ON DELETE CASCADE
GO

ALTER TABLE [Bookings] ADD CONSTRAINT [FK_Bookings_User] FOREIGN KEY ([user_id]) REFERENCES [Users] ([user_id])
GO

ALTER TABLE [Bookings] ADD CONSTRAINT [FK_Bookings_Room] FOREIGN KEY ([room_id]) REFERENCES [Rooms] ([room_id])
GO

ALTER TABLE [BookingServices] ADD CONSTRAINT [FK_BS_Booking] FOREIGN KEY ([booking_id]) REFERENCES [Bookings] ([booking_id]) ON DELETE CASCADE
GO

ALTER TABLE [BookingServices] ADD CONSTRAINT [FK_BS_Service] FOREIGN KEY ([service_id]) REFERENCES [ExtraServices] ([service_id])
GO

ALTER TABLE [Payments] ADD CONSTRAINT [FK_Payments_Booking] FOREIGN KEY ([booking_id]) REFERENCES [Bookings] ([booking_id])
GO

ALTER TABLE [Invoices] ADD CONSTRAINT [FK_Invoices_Booking] FOREIGN KEY ([booking_id]) REFERENCES [Bookings] ([booking_id])
GO

ALTER TABLE [Invoices] ADD CONSTRAINT [FK_Invoices_Payment] FOREIGN KEY ([payment_id]) REFERENCES [Payments] ([payment_id])
GO

ALTER TABLE [InvoiceItems] ADD CONSTRAINT [FK_InvoiceItems_Invoice] FOREIGN KEY ([invoice_id]) REFERENCES [Invoices] ([invoice_id]) ON DELETE CASCADE
GO

ALTER TABLE [Reviews] ADD CONSTRAINT [FK_Reviews_Booking] FOREIGN KEY ([booking_id]) REFERENCES [Bookings] ([booking_id])
GO

ALTER TABLE [Reviews] ADD CONSTRAINT [FK_Reviews_User] FOREIGN KEY ([user_id]) REFERENCES [Users] ([user_id])
GO

ALTER TABLE [Reviews] ADD CONSTRAINT [FK_Reviews_Room] FOREIGN KEY ([room_id]) REFERENCES [Rooms] ([room_id])
GO

-- Disable constraint checks for tables with data
ALTER TABLE [Roles] NOCHECK CONSTRAINT ALL;
GO
ALTER TABLE [Users] NOCHECK CONSTRAINT ALL;
GO
ALTER TABLE [RoomTypes] NOCHECK CONSTRAINT ALL;
GO
ALTER TABLE [Amenities] NOCHECK CONSTRAINT ALL;
GO
ALTER TABLE [Rooms] NOCHECK CONSTRAINT ALL;
GO
ALTER TABLE [RoomAmenityMap] NOCHECK CONSTRAINT ALL;
GO
ALTER TABLE [ExtraServices] NOCHECK CONSTRAINT ALL;
GO
ALTER TABLE [Bookings] NOCHECK CONSTRAINT ALL;
GO
ALTER TABLE [BookingServices] NOCHECK CONSTRAINT ALL;
GO
ALTER TABLE [Payments] NOCHECK CONSTRAINT ALL;
GO
ALTER TABLE [Invoices] NOCHECK CONSTRAINT ALL;
GO
ALTER TABLE [InvoiceItems] NOCHECK CONSTRAINT ALL;
GO
ALTER TABLE [Reviews] NOCHECK CONSTRAINT ALL;
GO

INSERT INTO [Roles] ([role_name], [description])
VALUES
  ('ADMIN', N'Quản trị viên hệ thống, toàn quyền'),
  ('STAFF', N'Nhân viên lễ tân, quản lý booking'),
  ('CUSTOMER', N'Khách hàng đặt phòng thông thường');
GO
INSERT INTO [Users] ([full_name], [email], [phone], [password_hash], [is_active])
VALUES
  (N'Nguyễn Văn Admin', 'admin@hbms.vn', '0901000001', '$2a$12$K7GoZ/D5Q4J3R.xB7pHrYuvbvAfPIGBiE7Nwl3TygTsKJn4OZ4Wfe', 1),
  (N'Trần Thị Staff', 'staff@hbms.vn', '0901000002', '$2a$12$K7GoZ/D5Q4J3R.xB7pHrYuvbvAfPIGBiE7Nwl3TygTsKJn4OZ4Wfe', 1),
  (N'Lê Văn Khách', 'customer1@gmail.com', '0901000003', '$2a$12$K7GoZ/D5Q4J3R.xB7pHrYuvbvAfPIGBiE7Nwl3TygTsKJn4OZ4Wfe', 1),
  (N'Phạm Thị Hoa', 'customer2@gmail.com', '0901000004', '$2a$12$K7GoZ/D5Q4J3R.xB7pHrYuvbvAfPIGBiE7Nwl3TygTsKJn4OZ4Wfe', 1),
  (N'Hoàng Minh Tuấn', 'customer3@gmail.com', '0901000005', '$2a$12$K7GoZ/D5Q4J3R.xB7pHrYuvbvAfPIGBiE7Nwl3TygTsKJn4OZ4Wfe', 1);
GO
INSERT INTO [RoomTypes] ([type_name], [description], [base_price], [max_occupancy])
VALUES
  (N'Standard', N'Phòng tiêu chuẩn, đầy đủ tiện nghi cơ bản', 500000, 2),
  (N'Deluxe', N'Phòng cao cấp, view đẹp, nội thất sang trọng', 900000, 2),
  (N'VIP Suite', N'Suite hạng VIP, phòng khách riêng, bồn tắm jacuzzi', 2500000, 4),
  (N'Family', N'Phòng gia đình rộng rãi, thích hợp 3-4 người', 1200000, 4),
  (N'Penthouse', N'Tầng thượng, view toàn thành phố, dịch vụ butler', 5000000, 2);
GO
INSERT INTO [Amenities] ([amenity_name], [icon_class], [description])
VALUES
  (N'Hồ bơi', 'fa-swimming-pool', N'Hồ bơi ngoài trời/trong nhà'),
  (N'Gym & Fitness', 'fa-dumbbell', N'Phòng tập gym 24/7'),
  (N'Spa & Massage', 'fa-spa', N'Dịch vụ spa và massage thư giãn'),
  (N'Nhà hàng', 'fa-utensils', N'Nhà hàng phục vụ đa dạng món ăn'),
  (N'WiFi miễn phí', 'fa-wifi', N'Kết nối WiFi tốc độ cao toàn khu vực'),
  (N'Bãi đỗ xe', 'fa-parking', N'Bãi đỗ xe có bảo vệ 24/7'),
  (N'Khu vui chơi', 'fa-child', N'Khu vui chơi trẻ em'),
  (N'Phòng họp', 'fa-chalkboard', N'Phòng hội nghị/hội thảo'),
  (N'Bar & Lounge', 'fa-cocktail', N'Quầy bar và khu lounge'),
  (N'Đưa đón sân bay', 'fa-shuttle-van', N'Dịch vụ đưa đón sân bay');
GO
INSERT INTO [Rooms] ([type_id], [room_number], [floor], [bed_type], [province], [district], [address], [price_per_night], [thumbnail_url], [description], [status])
VALUES
  (1, '101', 1, 'DOUBLE', N'TP. Hồ Chí Minh', N'Quận 1', N'15 Nguyễn Huệ, Phường Bến Nghé', 550000, 'https://cdn.hbms.vn/rooms/101-thumb.jpg', N'Phòng standard thoáng mát, nhìn ra phố đi bộ Nguyễn Huệ sầm uất.', 'AVAILABLE'),
  (2, '205', 2, 'KING', N'TP. Hồ Chí Minh', N'Quận 1', N'15 Nguyễn Huệ, Phường Bến Nghé', 950000, 'https://cdn.hbms.vn/rooms/205-thumb.jpg', N'Phòng deluxe view sông Sài Gòn, giường King size, bồn tắm đứng.', 'AVAILABLE'),
  (3, '301', 3, 'KING', N'Đà Nẵng', N'Quận Sơn Trà', N'168 Võ Nguyên Giáp, Phước Mỹ', 2600000, 'https://cdn.hbms.vn/rooms/301-thumb.jpg', N'Suite VIP hướng biển Mỹ Khê, phòng khách riêng và bồn tắm jacuzzi.', 'AVAILABLE'),
  (4, '402', 4, 'TRIPLE', N'Hà Nội', N'Quận Hoàn Kiếm', N'9 Đinh Tiên Hoàng, Phường Hàng Trống', 1300000, 'https://cdn.hbms.vn/rooms/402-thumb.jpg', N'Phòng gia đình view hồ Hoàn Kiếm, 2 phòng ngủ, bếp nhỏ tiện lợi.', 'AVAILABLE'),
  (5, 'PH01', 10, 'KING', N'Kiên Giang', N'Huyện Phú Quốc', N'18 Trần Hưng Đạo, Dương Đông', 5200000, 'https://cdn.hbms.vn/rooms/ph01-thumb.jpg', N'Penthouse tầng thượng view 360° biển đảo Phú Quốc, butler service.', 'AVAILABLE');
GO
INSERT INTO [RoomAmenityMap] ([room_id], [amenity_id])
VALUES
  (1, 5),
  (1, 6),
  (1, 4),
  (2, 5),
  (2, 1),
  (2, 4),
  (2, 9),
  (3, 1),
  (3, 2),
  (3, 3),
  (3, 4),
  (3, 5),
  (3, 6),
  (3, 9),
  (3, 10),
  (4, 5),
  (4, 7),
  (4, 6),
  (4, 4),
  (5, 1),
  (5, 2),
  (5, 3),
  (5, 4),
  (5, 5),
  (5, 6),
  (5, 8),
  (5, 9),
  (5, 10);
GO
INSERT INTO [ExtraServices] ([service_name], [description], [unit_price], [price_type], [is_active])
VALUES
  (N'Bữa sáng Buffet', N'Bữa sáng buffet quốc tế dành cho 1 người', 150000, 'PER_PERSON', 1),
  (N'Đưa đón sân bay', N'Xe đưa đón sân bay gần nhất (1 chiều)', 350000, 'PER_BOOKING', 1),
  (N'Thuê xe máy', N'Thuê xe máy khám phá thành phố (50cc)', 120000, 'PER_NIGHT', 1),
  (N'Dọn phòng buổi tối', N'Dịch vụ dọn phòng + trải giường buổi tối', 80000, 'PER_NIGHT', 1),
  (N'Thuê xe đạp', N'Thuê xe đạp tham quan (bao gồm mũ bảo hiểm)', 50000, 'PER_NIGHT', 1);
GO
INSERT INTO [Bookings] ([user_id], [room_id], [check_in_date], [check_out_date], [num_guests], [room_price_snapshot], [total_nights], [status], [expires_at], [booking_code])
VALUES
  (3, 2, '2025-08-01', '2025-08-04', 2, 950000, 3, 'CONFIRMED', NULL, 'HB20250801-0001'),
  (4, 3, '2025-08-10', '2025-08-12', 2, 2600000, 2, 'PENDING', DATEADD(MINUTE, 15, SYSDATETIME()), 'HB20250810-0002');
GO
INSERT INTO [BookingServices] ([booking_id], [service_id], [quantity], [unit_price_snap])
VALUES
  (1, 1, 2, 150000),
  (1, 2, 1, 350000);
GO
INSERT INTO [Payments] ([booking_id], [gateway], [transaction_id], [amount], [status], [paid_at])
VALUES
  (1, 'VNPAY', 'VNP20250801123456', 3150000, 'SUCCESS', '2025-08-01T09:30:00');
GO
INSERT INTO [Invoices] ([booking_id], [payment_id], [invoice_number], [subtotal], [tax_rate], [tax_amount], [discount_amount], [total_amount])
VALUES
  (1, 1, 'INV-20250801-00001', 3150000, 10, 315000, 0, 3465000);
GO
INSERT INTO [InvoiceItems] ([invoice_id], [item_type], [description], [quantity], [unit_price])
VALUES
  (1, 'ROOM', N'Phòng 205 (Deluxe) - 3 đêm', 3, 950000),
  (1, 'SERVICE', N'Bữa sáng Buffet x2 người', 2, 150000),
  (1, 'SERVICE', N'Đưa đón sân bay (1 chiều)', 1, 350000),
  (1, 'TAX', N'VAT 10%', 1, 315000);
GO
INSERT INTO [Reviews] ([booking_id], [user_id], [room_id], [rating_overall], [rating_clean], [rating_service], [rating_location], [rating_value], [comment], [is_approved])
VALUES
  (1, 3, 2, 5, 5, 4, 5, 4, N'Phòng rất đẹp, view sông Sài Gòn tuyệt vời! Nhân viên nhiệt tình và chuyên nghiệp. Sẽ quay lại!', 1);
GO

-- Re-enable constraint checks
ALTER TABLE [Roles] WITH CHECK CHECK CONSTRAINT ALL;
GO
ALTER TABLE [Users] WITH CHECK CHECK CONSTRAINT ALL;
GO
ALTER TABLE [RoomTypes] WITH CHECK CHECK CONSTRAINT ALL;
GO
ALTER TABLE [Amenities] WITH CHECK CHECK CONSTRAINT ALL;
GO
ALTER TABLE [Rooms] WITH CHECK CHECK CONSTRAINT ALL;
GO
ALTER TABLE [RoomAmenityMap] WITH CHECK CHECK CONSTRAINT ALL;
GO
ALTER TABLE [ExtraServices] WITH CHECK CHECK CONSTRAINT ALL;
GO
ALTER TABLE [Bookings] WITH CHECK CHECK CONSTRAINT ALL;
GO
ALTER TABLE [BookingServices] WITH CHECK CHECK CONSTRAINT ALL;
GO
ALTER TABLE [Payments] WITH CHECK CHECK CONSTRAINT ALL;
GO
ALTER TABLE [Invoices] WITH CHECK CHECK CONSTRAINT ALL;
GO
ALTER TABLE [InvoiceItems] WITH CHECK CHECK CONSTRAINT ALL;
GO
ALTER TABLE [Reviews] WITH CHECK CHECK CONSTRAINT ALL;
GO