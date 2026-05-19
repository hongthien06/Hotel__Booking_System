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
  Block,
  Close,
  CalendarToday,
  Person,
  Room,
  AttachMoney,
  Login,
  Logout,
  Visibility
} from '@mui/icons-material';
import { useAuth } from '../../shared/hooks/useAuth';
import { getDashboardStats } from '../../shared/api/dashboardApi';
import { checkInApi, checkOutApi, cancelBookingByAdminApi } from '../../shared/api/bookingApi';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../shared/utils/formatters';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';

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
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

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

  const handleCheckIn = async (id) => {
    try {
      await checkInApi(id);
      toast.success(t('dashboard.checkin_success') || 'Check-in successful!');
      fetchStats();
    } catch (err) {
      console.error('Check-in error:', err);
      toast.error(t('dashboard.checkin_error') || 'Failed to check-in.');
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await checkOutApi(id);
      toast.success(t('dashboard.checkout_success') || 'Check-out successful!');
      fetchStats();
    } catch (err) {
      console.error('Check-out error:', err);
      toast.error(t('dashboard.checkout_error') || 'Failed to check-out.');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm(t('dashboard.confirm_cancel') || 'Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBookingByAdminApi(id);
      toast.success(t('dashboard.cancel_success') || 'Booking cancelled successfully!');
      fetchStats();
    } catch (err) {
      console.error('Cancel error:', err);
      toast.error(t('dashboard.cancel_error') || 'Failed to cancel booking.');
    }
  };

  const handleOpenDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedBooking(null);
  };

  useEffect(() => {
    fetchStats();
  }, []);



  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'CANCELLED': return 'error';
      case 'CHECKED_IN': return 'info';
      case 'CHECKED_OUT': return 'secondary';
      case 'REFUNDED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.contrastText', mb: 0.5 }}>
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
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('dashboard.total_rooms')}
            value={stats?.totalRooms || 0}
            icon={<KingBed fontSize="large" />}
            color="#3f51b5"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('dashboard.available')}
            value={stats?.availableRooms || 0}
            icon={<TrendingUp fontSize="large" />}
            color="#4caf50"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('dashboard.occupied')}
            value={stats?.occupiedRooms || 0}
            icon={<MeetingRoom fontSize="large" />}
            color="#f44336"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('dashboard.maintenance')}
            value={stats?.maintenanceRooms || 0}
            icon={<Handyman fontSize="large" />}
            color="#9e9e9e"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('dashboard.inactive')}
            value={stats?.inactiveRooms || 0}
            icon={<Block fontSize="large" />}
            color="#000000"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('dashboard.total_bookings')}
            value={stats?.totalBookings || 0}
            icon={<EventNote fontSize="large" />}
            color="#ff9800"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('dashboard.total_revenue')}
            value={formatCurrency(stats?.totalRevenue || 0)}
            icon={<AccountBalanceWallet fontSize="large" />}
            color="#e91e63"
            loading={loading}
          />
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: 'primary.contrastText' }}>
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
              <TableCell sx={{ fontWeight: 700 }} align="center">{t('common.actions')}</TableCell>
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
                  <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }}>
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
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      {booking.status === 'CONFIRMED' && (
                        <Tooltip title={t('dashboard.check_in') || 'Check-in'}>
                          <IconButton
                            color="success"
                            size="small"
                            onClick={() => handleCheckIn(booking.id)}
                            sx={{ bgcolor: 'success.lighter', '&:hover': { bgcolor: 'success.light' } }}
                          >
                            <Login fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {booking.status === 'CHECKED_IN' && (
                        <Tooltip title={t('dashboard.check_out') || 'Check-out'}>
                          <IconButton
                            color="warning"
                            size="small"
                            onClick={() => handleCheckOut(booking.id)}
                            sx={{ bgcolor: 'warning.lighter', '&:hover': { bgcolor: 'warning.light' } }}
                          >
                            <Logout fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                        <Tooltip title={t('dashboard.cancel') || 'Cancel Booking'}>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleCancel(booking.id)}
                            sx={{ bgcolor: 'error.lighter', '&:hover': { bgcolor: 'error.light' } }}
                          >
                            <Block fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title={t('common.details')}>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenDetails(booking)}
                          sx={{ bgcolor: 'primary.lighter', '&:hover': { bgcolor: 'primary.light' } }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  {t('dashboard.no_data')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Booking Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {t('common.booking_details')} #{selectedBooking?.id}
          <IconButton onClick={handleCloseDetails} size="small"><Close /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0 }}>
          {selectedBooking && (
            <List sx={{ py: 1 }}>
              <ListItem>
                <ListItemIcon><Person color="primary" /></ListItemIcon>
                <ListItemText
                  primary={t('dashboard.customer')}
                  secondary={selectedBooking.customerName}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Room color="primary" /></ListItemIcon>
                <ListItemText
                  primary={t('dashboard.room_number')}
                  secondary={selectedBooking.roomNumber}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CalendarToday color="primary" /></ListItemIcon>
                <ListItemText
                  primary={t('dashboard.date')}
                  secondary={new Date(selectedBooking.bookingDate).toLocaleString()}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><AttachMoney color="primary" /></ListItemIcon>
                <ListItemText
                  primary={t('dashboard.amount')}
                  secondary={formatCurrency(selectedBooking.amount)}
                  primaryTypographyProps={{ fontWeight: 600, color: 'primary.main' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: `${getStatusColor(selectedBooking.status)}.main` }} />
                </ListItemIcon>
                <ListItemText
                  primary={t('dashboard.status')}
                  secondary={
                    <Chip
                      label={selectedBooking.status}
                      color={getStatusColor(selectedBooking.status)}
                      size="small"
                      sx={{ fontWeight: 600, mt: 0.5 }}
                    />
                  }
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItem>
            </List>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Box>
            {(selectedBooking?.status === 'PENDING' || selectedBooking?.status === 'CONFIRMED') && (
              <Button
                onClick={() => { handleCancel(selectedBooking.id); handleCloseDetails(); }}
                color="error"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                {t('dashboard.cancel') || 'Cancel Booking'}
              </Button>
            )}
          </Box>
          <Button onClick={handleCloseDetails} variant="contained" sx={{ borderRadius: 2 }}>
            {t('common.close') || 'Close'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardPage;
