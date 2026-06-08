import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Container, Grid, Card, CardContent,
  Avatar, Rating, Chip, Skeleton, Pagination, Paper, Divider,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, CircularProgress
} from '@mui/material'
import { Star, FormatQuote, ThumbUp } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import { getApprovedReviews, getReviewStats, checkReviewExists } from '../../shared/api/reviewApi'
import { getMyBookingsApi } from '../../shared/api/bookingApi'
import { useAuth } from '../../shared/hooks/useAuth'
import ReviewFormDialog from './ReviewFormDialog'
import { toast } from 'react-toastify'

const PC = '#9a1c48'

const BookingSelectDialog = ({ open, onClose, onSelect }) => {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [selectedBookingId, setSelectedBookingId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setLoading(true)
      getMyBookingsApi()
        .then(async (data) => {
          const list = Array.isArray(data) ? data : []
          const checkedInList = list.filter(b => b.status === 'CHECKED_IN' || b.status === 'CHECKED_OUT')
          const unreviewed = []
          await Promise.all(
            checkedInList.map(async (b) => {
              try {
                const res = await checkReviewExists(b.bookingId)
                if (!res.reviewed) {
                  unreviewed.push(b)
                }
              } catch {
                unreviewed.push(b)
              }
            })
          )
          setBookings(unreviewed)
          if (unreviewed.length > 0) {
            setSelectedBookingId(unreviewed[0].bookingId)
          }
        })
        .catch(err => console.error('Failed to load bookings:', err))
        .finally(() => setLoading(false))
    }
  }, [open])

  const handleConfirm = () => {
    const selected = bookings.find(b => b.bookingId === selectedBookingId)
    if (selected) {
      onSelect(selected)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>Chọn đơn đặt phòng để đánh giá</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : bookings.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Bạn không có đơn đặt phòng nào chưa được đánh giá.{' '}
              <Box
                component={Link}
                to="/bookings"
                onClick={onClose}
                sx={{
                  color: '#9a1c48',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 700,
                  '&:hover': { color: '#7d1639' }
                }}
              >
                Đặt phòng ngay
              </Box>
            </Typography>
          </Box>
        ) : (
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="select-booking-label">Đơn đặt phòng của bạn</InputLabel>
            <Select
              labelId="select-booking-label"
              value={selectedBookingId}
              label="Đơn đặt phòng của bạn"
              onChange={(e) => setSelectedBookingId(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              {bookings.map(b => {
                const roomNum = b.room?.roomNumber || (b.bookingRooms && b.bookingRooms.length > 0 ? b.bookingRooms.map(br => br.room?.roomNumber).join(', ') : 'N/A')
                const hotelName = b.room?.hotel?.name || (b.bookingRooms && b.bookingRooms.length > 0 ? b.bookingRooms[0].room?.hotel?.name : 'Khách sạn')
                return (
                  <MenuItem key={b.bookingId} value={b.bookingId}>
                    Đơn #{b.bookingCode} - Phòng {roomNum} ({hotelName})
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={bookings.length === 0 || !selectedBookingId || loading}
          sx={{ bgcolor: '#9a1c48', '&:hover': { bgcolor: '#7d1639' }, borderRadius: 2 }}
        >
          Tiếp tục
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const ReviewsPage = () => {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [bookingSelectOpen, setBookingSelectOpen] = useState(false)
  const [reviewFormOpen, setReviewFormOpen] = useState(false)
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null)

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để viết đánh giá!')
      return
    }
    setBookingSelectOpen(true)
  }

  const handleBookingSelect = (booking) => {
    setSelectedBookingForReview(booking)
    setBookingSelectOpen(false)
    setReviewFormOpen(true)
  }

  const fetchReviews = async (p = 0) => {
    setLoading(true)
    try {
      const data = await getApprovedReviews(p, 8)
      setReviews(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch (err) {
      console.error('Error fetching reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await getReviewStats()
      setStats(data)
    } catch (err) {
      console.error('Error fetching review stats:', err)
    }
  }

  useEffect(() => {
    fetchReviews(page)
  }, [page])

  useEffect(() => {
    fetchStats()
  }, [])

  const renderStarDistribution = () => {
    if (!stats?.distribution) return null
    const dist = stats.distribution
    const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1
    return [5, 4, 3, 2, 1].map(star => {
      const count = dist[star] || 0
      const pct = (count / total) * 100
      return (
        <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 20 }}>{star}</Typography>
          <Star sx={{ fontSize: 16, color: '#f59e0b' }} />
          <Box sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: '#f3f4f6', overflow: 'hidden' }}>
            <Box sx={{ width: `${pct}%`, height: '100%', borderRadius: 4, bgcolor: '#f59e0b', transition: 'width 0.5s' }} />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 30, textAlign: 'right' }}>{count}</Typography>
        </Box>
      )
    })
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* Header */}
      <Box sx={{
        background: `linear-gradient(135deg, ${PC} 0%, #c02860 100%)`,
        py: 8, textAlign: 'center', color: 'white'
      }}>
        <Container maxWidth="md">
          <Typography variant="overline" sx={{ letterSpacing: 4, opacity: 0.9 }}>
            {t('reviews.overline')}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, mt: 1, mb: 2 }}>
            {t('reviews.title')}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 600, mx: 'auto', mb: 3 }}>
            {t('reviews.subtitle')}
          </Typography>
          <Button
            variant="contained"
            onClick={handleWriteReviewClick}
            sx={{
              fontWeight: 700,
              borderRadius: 3,
              px: 4,
              py: 1.2,
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
              textTransform: 'none'
            }}
          >
            {t('reviews.write_review')}
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Stats Summary */}
        {stats && (
          <Paper sx={{ p: 4, borderRadius: 4, mb: 5, boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" sx={{ fontWeight: 900, color: PC }}>
                    {stats.averageRating?.toFixed(1) || '0.0'}
                  </Typography>
                  <Rating value={stats.averageRating || 0} precision={0.1} readOnly sx={{ mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {t('reviews.based_on', { count: stats.totalReviews || 0 })}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                {renderStarDistribution()}
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{t('reviews.cleanliness')}</Typography>
                    <Rating value={stats.avgClean || 0} precision={0.1} readOnly size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{t('reviews.service')}</Typography>
                    <Rating value={stats.avgService || 0} precision={0.1} readOnly size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{t('reviews.location')}</Typography>
                    <Rating value={stats.avgLocation || 0} precision={0.1} readOnly size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{t('reviews.value')}</Typography>
                    <Rating value={stats.avgValue || 0} precision={0.1} readOnly size="small" />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Reviews List */}
        <Grid container spacing={3}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6 }} key={i}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
              </Grid>
            ))
          ) : reviews.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <FormatQuote sx={{ fontSize: 64, color: '#ddd', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  {t('reviews.no_reviews')}
                </Typography>
              </Box>
            </Grid>
          ) : (
            reviews.map((review) => (
              <Grid size={{ xs: 12, sm: 6 }} key={review.reviewId}>
                <Card sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }
                }}>
                  <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: PC, fontWeight: 700, width: 48, height: 48 }}>
                        {review.customerName?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          {review.customerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {review.roomNumber && `${t('reviews.room')} ${review.roomNumber} · `}
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Rating value={review.ratingOverall} readOnly size="small" />
                    </Box>

                    {review.comment && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', lineHeight: 1.8, mb: 2 }}>
                        "{review.comment}"
                      </Typography>
                    )}

                    {/* Sub-ratings & Admin reply aligned to the bottom */}
                    <Box sx={{ mt: 'auto' }}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: review.adminReply ? 2 : 0 }}>
                        {review.ratingClean && <Chip size="small" label={`🧹 ${review.ratingClean}/5`} variant="outlined" />}
                        {review.ratingService && <Chip size="small" label={`🤝 ${review.ratingService}/5`} variant="outlined" />}
                        {review.ratingLocation && <Chip size="small" label={`📍 ${review.ratingLocation}/5`} variant="outlined" />}
                        {review.ratingValue && <Chip size="small" label={`💰 ${review.ratingValue}/5`} variant="outlined" />}
                      </Box>

                      {review.adminReply && (
                        <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 2, p: 2, borderLeft: `3px solid ${PC}` }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: PC, display: 'block', mb: 0.5 }}>
                            {t('reviews.hotel_reply')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {review.adminReply}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Pagination
              count={totalPages}
              page={page + 1}
              onChange={(e, v) => setPage(v - 1)}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Container>

      {/* Booking Selection Dialog */}
      <BookingSelectDialog
        open={bookingSelectOpen}
        onClose={() => setBookingSelectOpen(false)}
        onSelect={handleBookingSelect}
      />

      {/* Review Input Dialog */}
      {selectedBookingForReview && (
        <ReviewFormDialog
          open={reviewFormOpen}
          onClose={() => {
            setReviewFormOpen(false)
            setSelectedBookingForReview(null)
          }}
          booking={selectedBookingForReview}
          onReviewSubmitted={() => {
            fetchReviews(0)
            fetchStats()
          }}
        />
      )}
    </Box>
  )
}

export default ReviewsPage
