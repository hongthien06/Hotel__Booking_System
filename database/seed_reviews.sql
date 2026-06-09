USE HotelBookingDB;
GO

-- ==========================================
-- SCRIPT THÊM DỮ LIỆU MẪU CHO MODULE REVIEW
-- ==========================================

-- 1. Thêm các Booking mẫu ở trạng thái CHECKED_OUT
-- Người dùng ID: 1, 2, 3
-- Phòng: ngẫu nhiên (chọn từ Rooms)

DECLARE @UserId1 BIGINT = 1;
DECLARE @UserId2 BIGINT = 2;
DECLARE @UserId3 BIGINT = 3;

DECLARE @RoomId1 BIGINT = 1;
DECLARE @RoomId2 BIGINT = 2;
DECLARE @RoomId3 BIGINT = 3;
DECLARE @RoomId4 BIGINT = 4;
DECLARE @RoomId5 BIGINT = 5;

-- Xóa các review cũ để tránh lỗi unique booking_id (nếu có)
DELETE FROM Reviews;
-- Cũng xóa các booking giả này nếu đã chạy trước đó (dựa vào booking_code)
DELETE FROM Bookings WHERE booking_code LIKE 'TEST-REV-%';

-- Thêm Booking 1
INSERT INTO Bookings (user_id, room_id, check_in_date, check_out_date, num_adults, num_children, room_price_snapshot, total_nights, status, booking_code, created_at, updated_at)
VALUES (@UserId1, @RoomId1, '2025-05-01', '2025-05-05', 2, 0, 1250000, 4, 'CHECKED_OUT', 'TEST-REV-001', DATEADD(day, -30, GETDATE()), DATEADD(day, -26, GETDATE()));
DECLARE @BookingId1 BIGINT = SCOPE_IDENTITY();

-- Thêm Booking 2
INSERT INTO Bookings (user_id, room_id, check_in_date, check_out_date, num_adults, num_children, room_price_snapshot, total_nights, status, booking_code, created_at, updated_at)
VALUES (@UserId2, @RoomId2, '2025-05-10', '2025-05-12', 2, 0, 1250000, 2, 'CHECKED_OUT', 'TEST-REV-002', DATEADD(day, -25, GETDATE()), DATEADD(day, -23, GETDATE()));
DECLARE @BookingId2 BIGINT = SCOPE_IDENTITY();

-- Thêm Booking 3
INSERT INTO Bookings (user_id, room_id, check_in_date, check_out_date, num_adults, num_children, room_price_snapshot, total_nights, status, booking_code, created_at, updated_at)
VALUES (@UserId3, @RoomId3, '2025-05-15', '2025-05-20', 2, 1, 1400000, 5, 'CHECKED_OUT', 'TEST-REV-003', DATEADD(day, -20, GETDATE()), DATEADD(day, -15, GETDATE()));
DECLARE @BookingId3 BIGINT = SCOPE_IDENTITY();

-- Thêm Booking 4 (chưa review để test chức năng Customer tạo review)
INSERT INTO Bookings (user_id, room_id, check_in_date, check_out_date, num_adults, num_children, room_price_snapshot, total_nights, status, booking_code, created_at, updated_at)
VALUES (@UserId1, @RoomId4, '2025-06-01', '2025-06-03', 2, 0, 1400000, 2, 'CHECKED_OUT', 'TEST-REV-004', DATEADD(day, -10, GETDATE()), DATEADD(day, -7, GETDATE()));

-- Thêm Booking 5
INSERT INTO Bookings (user_id, room_id, check_in_date, check_out_date, num_adults, num_children, room_price_snapshot, total_nights, status, booking_code, created_at, updated_at)
VALUES (@UserId2, @RoomId5, '2025-06-05', '2025-06-06', 2, 0, 2900000, 1, 'CHECKED_OUT', 'TEST-REV-005', DATEADD(day, -5, GETDATE()), DATEADD(day, -4, GETDATE()));
DECLARE @BookingId5 BIGINT = SCOPE_IDENTITY();

-- 2. Thêm các Review
-- Review 1: 5 sao, đã duyệt, có admin reply
INSERT INTO Reviews (booking_id, user_id, room_id, rating_overall, rating_clean, rating_service, rating_location, rating_value, comment, is_approved, admin_reply, created_at)
VALUES (@BookingId1, @UserId1, @RoomId1, 5, 5, 5, 5, 4, N'Khách sạn rất đẹp, phòng sạch sẽ và nhân viên nhiệt tình.', 1, N'Cảm ơn quý khách đã tin tưởng và lựa chọn khách sạn chúng tôi. Mong được đón tiếp quý khách lần sau!', DATEADD(day, -25, GETDATE()));

-- Review 2: 4 sao, đã duyệt, không có admin reply
INSERT INTO Reviews (booking_id, user_id, room_id, rating_overall, rating_clean, rating_service, rating_location, rating_value, comment, is_approved, admin_reply, created_at)
VALUES (@BookingId2, @UserId2, @RoomId2, 4, 4, 4, 5, 4, N'Vị trí thuận lợi nhưng phòng cách âm chưa tốt lắm.', 1, NULL, DATEADD(day, -22, GETDATE()));

-- Review 3: 3 sao, đã duyệt, có admin reply
INSERT INTO Reviews (booking_id, user_id, room_id, rating_overall, rating_clean, rating_service, rating_location, rating_value, comment, is_approved, admin_reply, created_at)
VALUES (@BookingId3, @UserId3, @RoomId3, 3, 3, 4, 4, 3, N'Bữa sáng chưa đa dạng, vệ sinh ổn.', 1, N'Chúng tôi ghi nhận góp ý của quý khách và sẽ cải thiện chất lượng bữa sáng. Xin lỗi vì trải nghiệm chưa trọn vẹn này.', DATEADD(day, -14, GETDATE()));

-- Review 4: 5 sao, CHƯA DUYỆT (pending)
INSERT INTO Reviews (booking_id, user_id, room_id, rating_overall, rating_clean, rating_service, rating_location, rating_value, comment, is_approved, admin_reply, created_at)
VALUES (@BookingId5, @UserId2, @RoomId5, 5, 5, 5, 5, 5, N'Quá tuyệt vời, dịch vụ đỉnh cao!', 0, NULL, DATEADD(day, -1, GETDATE()));

PRINT 'Thêm dữ liệu mẫu Review thành công!';
GO
