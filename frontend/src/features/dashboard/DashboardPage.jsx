import React, { useEffect, useState, useCallback } from 'react';
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
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem as MuiMenuItem,
  FormControl,
  Fade
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
  Visibility,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart,
  DonutLarge,
  Today,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area,
  LineChart, Line, LabelList
} from 'recharts';
import { useAuth } from '../../shared/hooks/useAuth';
import { getDashboardStats, getDashboardCharts } from '../../shared/api/dashboardApi';
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

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const STATUS_COLORS = {
  PENDING: '#fb923c',
  CONFIRMED: '#34d399',
  CHECKED_IN: '#818cf8',
  CHECKED_OUT: '#c084fc',
  CANCELLED: '#f87171',
  REFUNDED: '#22d3ee'
};

const StatCard = ({ title, value, icon, color, loading, trend }) => (
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
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', mb: 1, fontSize: '0.7rem' }}>
            {title}
          </Typography>
          {loading ? (
            <Skeleton width={100} height={40} />
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
              {value}
            </Typography>
          )}
          {trend !== undefined && !loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              {trend >= 0 ? (
                <ArrowUpward sx={{ fontSize: 14, color: '#10b981' }} />
              ) : (
                <ArrowDownward sx={{ fontSize: 14, color: '#ef4444' }} />
              )}
              <Typography variant="caption" sx={{ fontWeight: 700, color: trend >= 0 ? '#10b981' : '#ef4444' }}>
                {Math.abs(trend)}%
              </Typography>
            </Box>
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
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [activeChart, setActiveChart] = useState('revenue');
  const [chartDays, setChartDays] = useState(30);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async () => {
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
  }, [t]);

  const fetchCharts = useCallback(async () => {
    setChartLoading(true);
    try {
      const data = await getDashboardCharts(chartDays);
      setChartData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching chart data:', err);
    } finally {
      setChartLoading(false);
    }
  }, [chartDays]);

  const handleCheckIn = async (id) => {
    try {
      await checkInApi(id);
      toast.success(t('dashboard.checkin_success') || 'Check-in successful!');
      fetchStats();
    } catch (err) {
      console.error('Check-in error:', err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      toast.error(serverMsg || t('dashboard.checkin_error') || 'Failed to check-in.');
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await checkOutApi(id);
      toast.success(t('dashboard.checkout_success') || 'Check-out successful!');
      fetchStats();
    } catch (err) {
      console.error('Check-out error:', err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      toast.error(serverMsg || t('dashboard.checkout_error') || 'Failed to check-out.');
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
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      toast.error(serverMsg || t('dashboard.cancel_error') || 'Failed to cancel booking.');
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
    fetchCharts();
  }, []);

  useEffect(() => {
    fetchCharts();
  }, [chartDays]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
      fetchCharts();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchCharts]);

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

  const renderChart = () => {
    if (chartLoading) {
      return <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 3 }} />;
    }
    if (!chartData) return null;

    switch (activeChart) {
      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData.revenueByDay || []} margin={{ top: 20, right: 10, left: 10, bottom: 15 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" interval={0} tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }} height={55} />
              <YAxis
                domain={[0, 100000000]}
                ticks={[0, 20000000, 40000000, 60000000, 80000000, 100000000]}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                tick={{ fontSize: 12 }}
              />
              <RechartsTooltip
                formatter={(value) => [formatCurrency(value), t('dashboard.chart_revenue')]}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)">
                <LabelList dataKey="revenue" position="top" formatter={(v) => formatCurrency(v)} style={{ fontSize: 10, fontWeight: 700, fill: '#555' }} />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'status':
        const allStatuses = ['CONFIRMED', 'CHECKED_OUT', 'CANCELLED'];
        const pieData = allStatuses.map(status => {
          const existing = (chartData.bookingsByStatus || []).find(item => item.status === status);
          return {
            status,
            count: existing ? existing.count : 0
          };
        });

        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={130}
                stroke="none"
                dataKey="count"
                nameKey="status"
                labelLine={false}
                label={({ status, count, percent }) => {
                  if (count === 0) return null;
                  const labelStatus = t(`dashboard.status_labels.${status}`) || status;
                  const percentStr = percent ? ` (${(percent * 100).toFixed(0)}%)` : '';
                  return `${labelStatus}: ${count}${percentStr}`;
                }}
              >
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={STATUS_COLORS[entry.status] || CHART_COLORS[idx % CHART_COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value, name) => [value, t(`dashboard.status_labels.${name}`) || name]}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Legend formatter={(value) => t(`dashboard.status_labels.${value}`) || value} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'occupancy':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData.roomOccupancy || []} margin={{ top: 20, right: 10, left: 10, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" interval={0} tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }} height={55} />
              <YAxis tick={{ fontSize: 12 }} />
              <RechartsTooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="occupied" stackId="1" fill="#ef4444" name={t('dashboard.chart_occupied')}>
                <LabelList dataKey="occupied" position="top" formatter={(v) => v > 0 ? v : ''} style={{ fontSize: 10, fontWeight: 700, fill: '#555' }} />
              </Bar>
              <Bar dataKey="available" stackId="1" fill="#10b981" radius={[8, 8, 0, 0]} name={t('dashboard.chart_available')}>
                <LabelList dataKey="available" position="top" formatter={(v) => v > 0 ? v : ''} style={{ fontSize: 10, fontWeight: 700, fill: '#555' }} />
              </Bar>
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        );



      default:
        return null;
    }
  };

  const chartTabs = [
    { value: 'revenue', icon: <ShowChart fontSize="small" />, label: t('dashboard.chart_revenue_by_day') },
    { value: 'status', icon: <PieChartIcon fontSize="small" />, label: t('dashboard.chart_bookings_by_status') },
    { value: 'occupancy', icon: <BarChartIcon fontSize="small" />, label: t('dashboard.chart_room_occupancy') },
  ];

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {t('dashboard.last_updated')}: {lastUpdated.toLocaleTimeString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
            </Typography>
          )}
          <Tooltip title={t('dashboard.refresh')}>
            <IconButton onClick={() => { fetchStats(); fetchCharts(); }} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Stat Cards ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title={t('dashboard.total_rooms')} value={stats?.totalRooms || 0} icon={<KingBed fontSize="large" />} color="#3f51b5" loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title={t('dashboard.available')} value={stats?.availableRooms || 0} icon={<TrendingUp fontSize="large" />} color="#4caf50" loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title={t('dashboard.occupied')} value={stats?.occupiedRooms || 0} icon={<MeetingRoom fontSize="large" />} color="#f44336" loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title={t('dashboard.total_revenue')} value={formatCurrency(stats?.totalRevenue || 0)} icon={<AccountBalanceWallet fontSize="large" />} color="#e91e63" loading={loading} />
        </Grid>
      </Grid>

      {/* ── Today Stats ── */}
      {chartData && (
        <Fade in>
          <Grid container spacing={2} sx={{ mb: 5 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper sx={{ p: 2.5, borderRadius: 3, textAlign: 'center', borderLeft: '4px solid #6366f1' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('dashboard.today_revenue')}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#6366f1', mt: 0.5 }}>
                  {formatCurrency(chartData.todayRevenue || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper sx={{ p: 2.5, borderRadius: 3, textAlign: 'center', borderLeft: '4px solid #f59e0b' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('dashboard.today_bookings')}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#f59e0b', mt: 0.5 }}>
                  {chartData.todayBookings || 0}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper sx={{ p: 2.5, borderRadius: 3, textAlign: 'center', borderLeft: '4px solid #10b981' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('dashboard.today_checkins')}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#10b981', mt: 0.5 }}>
                  {chartData.todayCheckIns || 0}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper sx={{ p: 2.5, borderRadius: 3, textAlign: 'center', borderLeft: '4px solid #ef4444' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('dashboard.occupancy_rate')}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#ef4444', mt: 0.5 }}>
                  {chartData.occupancyRate || 0}%
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Fade>
      )}

      {/* ── Charts Section ── */}
      <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.05)', mb: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
            {chartTabs.find(tab => tab.value === activeChart)?.label}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small">
              <Select
                value={chartDays}
                onChange={(e) => setChartDays(e.target.value)}
                sx={{ borderRadius: 2, fontWeight: 600, minWidth: 120 }}
              >
                <MuiMenuItem value={7}>{t('dashboard.chart_7_days')}</MuiMenuItem>
                <MuiMenuItem value={30}>{t('dashboard.chart_30_days')}</MuiMenuItem>
              </Select>
            </FormControl>
            <ToggleButtonGroup
              value={activeChart}
              exclusive
              onChange={(e, v) => v && setActiveChart(v)}
              size="small"
              sx={{ '& .MuiToggleButton-root': { borderRadius: 2, px: 1.5, textTransform: 'none', fontWeight: 600 } }}
            >
              {chartTabs.map(tab => (
                <ToggleButton key={tab.value} value={tab.value}>
                  <Tooltip title={tab.label}>{tab.icon}</Tooltip>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </Box>
        <Box sx={{ minHeight: 350 }}>
          {renderChart()}
        </Box>
      </Paper>

      {/* ── Recent Bookings Table ── */}
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
                  {[...Array(7)].map((_, j) => (
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
                      label={t(`dashboard.status_labels.${booking.status}`) || booking.status}
                      color={getStatusColor(booking.status)}
                      size="small"
                      sx={{ fontWeight: 600, borderRadius: 1.5 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      {booking.status === 'CONFIRMED' && (
                        <Tooltip title={t('dashboard.check_in') || 'Check-in'}>
                          <IconButton color="success" size="small" onClick={() => handleCheckIn(booking.id)}
                            sx={{ bgcolor: 'success.lighter', '&:hover': { bgcolor: 'success.light' } }}>
                            <Login fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {booking.status === 'CHECKED_IN' && (
                        <Tooltip title={t('dashboard.check_out') || 'Check-out'}>
                          <IconButton color="warning" size="small" onClick={() => handleCheckOut(booking.id)}
                            sx={{ bgcolor: 'warning.lighter', '&:hover': { bgcolor: 'warning.light' } }}>
                            <Logout fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                        <Tooltip title={t('dashboard.cancel') || 'Cancel Booking'}>
                          <IconButton color="error" size="small" onClick={() => handleCancel(booking.id)}
                            sx={{ bgcolor: 'error.lighter', '&:hover': { bgcolor: 'error.light' } }}>
                            <Block fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title={t('common.details')}>
                        <IconButton color="primary" size="small" onClick={() => handleOpenDetails(booking)}
                          sx={{ bgcolor: 'primary.lighter', '&:hover': { bgcolor: 'primary.light' } }}>
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
                <ListItemText primary={t('dashboard.customer')} secondary={selectedBooking.customerName} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItem>
              <ListItem>
                <ListItemIcon><Room color="primary" /></ListItemIcon>
                <ListItemText primary={t('dashboard.room_number')} secondary={selectedBooking.roomNumber} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItem>
              <ListItem>
                <ListItemIcon><CalendarToday color="primary" /></ListItemIcon>
                <ListItemText primary={t('dashboard.date')} secondary={new Date(selectedBooking.bookingDate).toLocaleString()} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItem>
              <ListItem>
                <ListItemIcon><AttachMoney color="primary" /></ListItemIcon>
                <ListItemText primary={t('dashboard.amount')} secondary={formatCurrency(selectedBooking.amount)} primaryTypographyProps={{ fontWeight: 600, color: 'primary.main' }} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: `${getStatusColor(selectedBooking.status)}.main` }} />
                </ListItemIcon>
                <ListItemText
                  primary={t('dashboard.status')}
                  secondary={
                    <Chip label={t(`dashboard.status_labels.${selectedBooking.status}`) || selectedBooking.status} color={getStatusColor(selectedBooking.status)} size="small" sx={{ fontWeight: 600, mt: 0.5 }} />
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
