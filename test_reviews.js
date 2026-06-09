const axios = require('axios');
const { execSync } = require('child_process');

const BASE_URL = 'http://localhost:8080/api/v1';

async function runTests() {
  console.log("=== STARTING REVIEW API TESTS ===");

  const adminEmail = `admin_${Date.now()}@test.com`;
  const custEmail = `cust_${Date.now()}@test.com`;
  const password = 'Password123!';

  try {
    // 1. Register users
    console.log("1. Registering users...");
    await axios.post(`${BASE_URL}/auth/register`, {
      fullName: 'Test Admin', email: adminEmail, password, phone: '0901234567'
    });
    await axios.post(`${BASE_URL}/auth/register`, {
      fullName: 'Test Customer', email: custEmail, password, phone: '0901234568'
    });
    
    // 2. Login to get tokens
    console.log("2. Logging in...");
    const custLogin = await axios.post(`${BASE_URL}/auth/login`, { email: custEmail, password });
    const custToken = custLogin.data.token;

    // 3. Promote admin and give customer a checked out booking
    console.log("3. Seeding DB for test users...");
    const sql = `
      USE HotelBookingDB;
      SET NOCOUNT ON;
      DECLARE @AdminId BIGINT = (SELECT user_id FROM Users WHERE email = '${adminEmail}');
      INSERT INTO UserRoles (user_id, role_id) VALUES (@AdminId, 1);
      
      DECLARE @CustId BIGINT = (SELECT user_id FROM Users WHERE email = '${custEmail}');
      INSERT INTO Bookings (user_id, room_id, check_in_date, check_out_date, num_adults, num_children, room_price_snapshot, total_nights, status, booking_code, created_at, updated_at)
      VALUES (@CustId, 1, '2025-05-01', '2025-05-05', 2, 0, 1000000, 4, 'CHECKED_OUT', 'TA-${Date.now().toString().slice(-8)}', GETDATE(), GETDATE());
      SELECT SCOPE_IDENTITY() as bookingId;
    `;
    const sqlStr = sql.replace(/\n/g, ' ');
    const sqlCmd = `sqlcmd -S localhost,1433 -d HotelBookingDB -U sa -P "Hbms@2026!" -N -C -Q "${sqlStr}"`;
    const sqlOutput = execSync(sqlCmd, { encoding: 'utf-8' });
    console.log("SQL Output:", sqlOutput);
    const match = sqlOutput.match(/---\r?\n\s*(\d+)/);
    const bookingId = match ? parseInt(match[1]) : 0;
    
    const adminLogin2 = await axios.post(`${BASE_URL}/auth/login`, { email: adminEmail, password });
    const adminToken2 = adminLogin2.data.token;

    // 4. Test Customer Review Creation
    console.log(`4. Testing Review Creation for Booking ID: ${bookingId}`);
    const reviewData = {
      bookingId: bookingId,
      ratingOverall: 5,
      ratingClean: 5,
      ratingService: 4,
      ratingLocation: 5,
      ratingValue: 5,
      comment: 'Automated test review comment'
    };
    
    const createReviewRes = await axios.post(`${BASE_URL}/reviews`, reviewData, {
      headers: { Authorization: `Bearer ${custToken}` }
    });
    console.log('   Create Review:', createReviewRes.status === 200 ? 'SUCCESS' : 'FAILED');
    const reviewId = createReviewRes.data.reviewId;

    // 5. Test Customer My Reviews
    console.log("5. Testing Get My Reviews...");
    const myReviewsRes = await axios.get(`${BASE_URL}/reviews/my`, {
      headers: { Authorization: `Bearer ${custToken}` }
    });
    console.log('   My Reviews count:', myReviewsRes.data.content.length);

    // 6. Test Admin Get All Reviews
    console.log("6. Testing Admin Get All Reviews...");
    const allReviewsRes = await axios.get(`${BASE_URL}/reviews`, {
      headers: { Authorization: `Bearer ${adminToken2}` }
    });
    console.log('   All Reviews count:', allReviewsRes.data.totalElements);

    // 7. Test Admin Approve Review
    console.log(`7. Testing Admin Approve Review ID: ${reviewId}`);
    const approveRes = await axios.put(`${BASE_URL}/reviews/${reviewId}/approve`, {}, {
      headers: { Authorization: `Bearer ${adminToken2}` }
    });
    console.log('   Approve Review:', approveRes.data.isApproved ? 'SUCCESS (isApproved = true)' : 'FAILED');

    // 8. Test Admin Reply Review
    console.log("8. Testing Admin Reply...");
    const replyRes = await axios.put(`${BASE_URL}/reviews/${reviewId}/reply`, { adminReply: 'Thank you!' }, {
      headers: { Authorization: `Bearer ${adminToken2}` }
    });
    console.log('   Admin Reply:', replyRes.data.adminReply === 'Thank you!' ? 'SUCCESS' : 'FAILED');

    // 9. Test Public Approved Reviews
    console.log("9. Testing Public Approved Reviews...");
    const publicRes = await axios.get(`${BASE_URL}/reviews/approved`);
    const found = publicRes.data.content.some(r => r.reviewId === reviewId);
    console.log('   Public Review visible:', found ? 'SUCCESS' : 'FAILED');

    // 10. Test Admin Delete Review
    console.log(`10. Testing Admin Delete Review ID: ${reviewId}`);
    const delRes = await axios.delete(`${BASE_URL}/reviews/${reviewId}`, {
      headers: { Authorization: `Bearer ${adminToken2}` }
    });
    console.log('   Delete Review:', delRes.status === 200 ? 'SUCCESS' : 'FAILED');

    console.log("=== ALL TESTS COMPLETED SUCCESSFULLY ===");
  } catch (error) {
    console.error("TEST FAILED!");
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

runTests();
