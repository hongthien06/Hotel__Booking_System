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
  TrendingDown,
  MeetingRoom,
  Handyman,
  Block
} from '@mui/icons-material';
import { useAuth } from '../../shared/hooks/useAuth';
import { getDashboardStats } from '../../shared/api/dashboardApi';
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();
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
      setError(t('dashboard.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { 
      style: 'currency', 
      currency: i18n.language === 'vi' ? 'VND' : 'USD' 
    }).format(i18n.language === 'vi' ? amount : amount / 25000); // Tạm tính tỷ giá
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
            {t('dashboard.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('dashboard.welcome')}, <strong>{user?.fullName}</strong>. {t('dashboard.subtitle')}
          </Typography>
        </Box>
        <Tooltip title={t('dashboard.refresh')}>
          <IconButton onClick={fetchStats} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title={t('dashboard.total_rooms')} 
            value={stats?.totalRooms || 0} 
            icon={<KingBed fontSize="large" />} 
            color="#3f51b5"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title={t('dashboard.available')} 
            value={stats?.availableRooms || 0} 
            icon={<TrendingUp fontSize="large" />} 
            color="#4caf50"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title={t('dashboard.occupied')} 
            value={stats?.occupiedRooms || 0} 
            icon={<MeetingRoom fontSize="large" />} 
            color="#f44336"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title={t('dashboard.maintenance')} 
            value={stats?.maintenanceRooms || 0} 
            icon={<Handyman fontSize="large" />} 
            color="#9e9e9e"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title={t('dashboard.inactive')} 
            value={stats?.inactiveRooms || 0} 
            icon={<Block fontSize="large" />} 
            color="#000000"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title={t('dashboard.total_bookings')} 
            value={stats?.totalBookings || 0} 
            icon={<EventNote fontSize="large" />} 
            color="#ff9800"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title={t('dashboard.total_revenue')} 
            value={formatCurrency(stats?.totalRevenue || 0)} 
            icon={<AccountBalanceWallet fontSize="large" />} 
            color="#e91e63"
            loading={loading}
          />
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: '#9a1c48' }}>
        {t('dashboard.recent_bookings')}
      </Typography>
      
      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.booking_id')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.customer')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.room_number')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.date')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.amount')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.status')}</TableCell>
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
                  <TableCell>{new Date(booking.bookingDate).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}</TableCell>
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
                  {t('dashboard.no_data')}
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
