import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip,
  Skeleton,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  KingBed, 
  EventNote, 
  People, 
  AccountBalanceWallet, 
  Refresh,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import { useAuth } from '../../shared/hooks/useAuth';
import { getDashboardStats } from '../../shared/api/dashboardApi';

const StatCard = ({ title, value, icon, color, loading }) => (
  <Card sx={{ 
    height: '100%', 
    borderRadius: 4, 
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    background: `linear-gradient(135deg, #fff 0%, ${color}10 100%)`,
    transition: 'transform 0.3s ease',
    '&:hover': { transform: 'translateY(-5px)' }
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
            {title}
          </Typography>
          {loading ? (
            <Skeleton width={100} height={40} />
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
              {value}
            </Typography>
          )}
        </Box>
        <Box sx={{ 
          p: 1.5, 
          borderRadius: 3, 
          bgcolor: `${color}20`, 
          color: color,
          display: 'flex'
        }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Không thể tải dữ liệu thống kê.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'CANCELLED': return 'error';
      case 'CHECKED_IN': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#9a1c48', mb: 0.5 }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Chào mừng trở lại, <strong>{user?.fullName}</strong>. Đây là tình hình kinh doanh hôm nay.
          </Typography>
        </Box>
        <Tooltip title="Làm mới">
          <IconButton onClick={fetchStats} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Tổng số phòng" 
            value={stats?.totalRooms || 0} 
            icon={<KingBed fontSize="large" />} 
            color="#3f51b5"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Đang trống" 
            value={stats?.availableRooms || 0} 
            icon={<TrendingUp fontSize="large" />} 
            color="#4caf50"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Lượt đặt phòng" 
            value={stats?.totalBookings || 0} 
            icon={<EventNote fontSize="large" />} 
            color="#ff9800"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Tổng doanh thu" 
            value={formatCurrency(stats?.totalRevenue || 0)} 
            icon={<AccountBalanceWallet fontSize="large" />} 
            color="#e91e63"
            loading={loading}
          />
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: '#9a1c48' }}>
        Đơn đặt phòng gần đây
      </Typography>
      
      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Mã đơn</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Khách hàng</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Số phòng</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ngày đặt</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tổng tiền</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(6)].map((_, j) => (
                    <TableCell key={j}><Skeleton /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : stats?.recentBookings?.length > 0 ? (
              stats.recentBookings.map((booking) => (
                <TableRow key={booking.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>#BK-{booking.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{booking.customerName}</TableCell>
                  <TableCell>{booking.roomNumber}</TableCell>
                  <TableCell>{new Date(booking.bookingDate).toLocaleString('vi-VN')}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'secondary.main' }}>
                    {formatCurrency(booking.amount)}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={booking.status} 
                      color={getStatusColor(booking.status)} 
                      size="small" 
                      sx={{ fontWeight: 600, borderRadius: 1.5 }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  Chưa có dữ liệu đặt phòng nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DashboardPage;
