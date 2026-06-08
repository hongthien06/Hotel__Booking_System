import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Tooltip, Rating, Skeleton,
  Pagination, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, ToggleButton, ToggleButtonGroup, Alert
} from '@mui/material'
import {
  CheckCircle, Delete, Reply, Visibility,
  FilterList, ThumbUp, ThumbDown
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { getAllReviews, approveReview, replyReview, deleteReview } from '../../shared/api/reviewApi'
import { toast } from 'react-toastify'

const ReviewManagementPage = () => {
  const { t } = useTranslation()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filter, setFilter] = useState('all')
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [replyText, setReplyText] = useState('')

  const fetchReviews = async (p = 0) => {
    setLoading(true)
    try {
      const data = await getAllReviews(p, 10)
      setReviews(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch (err) {
      console.error('Error:', err)
      toast.error(t('reviews.fetch_error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews(page)
  }, [page])

  const handleApprove = async (id) => {
    try {
      await approveReview(id)
      toast.success(t('reviews.approve_success'))
      fetchReviews(page)
    } catch (err) {
      toast.error(t('reviews.approve_error'))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('reviews.delete_confirm'))) return
    try {
      await deleteReview(id)
      toast.success(t('reviews.delete_success'))
      fetchReviews(page)
    } catch (err) {
      toast.error(t('reviews.delete_error'))
    }
  }

  const openReplyDialog = (review) => {
    setSelectedReview(review)
    setReplyText(review.adminReply || '')
    setReplyDialogOpen(true)
  }

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return
    try {
      await replyReview(selectedReview.reviewId, replyText)
      toast.success(t('reviews.reply_success'))
      setReplyDialogOpen(false)
      fetchReviews(page)
    } catch (err) {
      toast.error(t('reviews.reply_error'))
    }
  }

  const filteredReviews = reviews.filter(r => {
    if (filter === 'approved') return r.isApproved
    if (filter === 'pending') return !r.isApproved
    return true
  })

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.contrastText' }}>
            {t('reviews.management_title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('reviews.management_subtitle')}
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(e, v) => v && setFilter(v)}
          size="small"
          sx={{ '& .MuiToggleButton-root': { borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2 } }}
        >
          <ToggleButton value="all">{t('common.all')}</ToggleButton>
          <ToggleButton value="approved">
            <ThumbUp sx={{ fontSize: 16, mr: 0.5 }} /> {t('reviews.approved')}
          </ToggleButton>
          <ToggleButton value="pending">
            <ThumbDown sx={{ fontSize: 16, mr: 0.5 }} /> {t('reviews.pending')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>{t('reviews.customer')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('reviews.room')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('reviews.rating')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('reviews.comment_label')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('reviews.status')}</TableCell>
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
            ) : filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">{t('reviews.no_reviews')}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => (
                <TableRow key={review.reviewId} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{review.customerName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>{review.roomNumber || '-'}</TableCell>
                  <TableCell>
                    <Rating value={review.ratingOverall} readOnly size="small" />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 250 }}>
                    <Typography variant="body2" noWrap>{review.comment || '-'}</Typography>
                    {review.adminReply && (
                      <Typography variant="caption" sx={{ color: '#9a1c48', fontWeight: 600 }}>
                        ↳ {t('reviews.replied')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={review.isApproved ? t('reviews.approved') : t('reviews.pending')}
                      color={review.isApproved ? 'success' : 'warning'}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      {!review.isApproved && (
                        <Tooltip title={t('reviews.approve')}>
                          <IconButton size="small" color="success" onClick={() => handleApprove(review.reviewId)}>
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title={t('reviews.reply')}>
                        <IconButton size="small" color="primary" onClick={() => openReplyDialog(review)}>
                          <Reply fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common.delete')}>
                        <IconButton size="small" color="error" onClick={() => handleDelete(review.reviewId)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={page + 1} onChange={(e, v) => setPage(v - 1)} color="primary" />
        </Box>
      )}

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {t('reviews.reply_to', { name: selectedReview?.customerName })}
        </DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
              <Rating value={selectedReview.ratingOverall} readOnly size="small" />
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                "{selectedReview.comment}"
              </Typography>
            </Box>
          )}
          <TextField
            multiline
            rows={3}
            fullWidth
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            label={t('reviews.reply_placeholder')}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReplyDialogOpen(false)} sx={{ borderRadius: 2 }}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleReplySubmit} sx={{ borderRadius: 2, fontWeight: 700 }}>
            {t('reviews.send_reply')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ReviewManagementPage
