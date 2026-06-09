import React, { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Rating, TextField, Button,
  CircularProgress, IconButton, Divider
} from '@mui/material'
import { Close, Star, RateReview } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { createReview } from '../../shared/api/reviewApi'
import { toast } from 'react-toastify'

const ReviewFormDialog = ({ open, onClose, booking, room, onReviewSubmitted }) => {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    ratingOverall: 5,
    ratingClean: 5,
    ratingService: 5,
    ratingLocation: 5,
    ratingValue: 5,
    comment: ''
  })
  const [loading, setLoading] = useState(false)
  
  const roomLabel = room
    ? room.roomNumber
    : (Array.isArray(booking?.rooms) && booking.rooms.length > 0
      ? booking.rooms.map(r => `#${r.roomNumber}`).join(', ')
      : booking?.roomNumber)

  const subtitleLabel = room
    ? (room.roomType?.typeName || room.typeName || '')
    : (booking?.bookingCode || '')

  const handleSubmit = async () => {
    if (!form.ratingOverall) {
      toast.error(t('reviews.rating_required'))
      return
    }
    setLoading(true)
    try {
      const payload = {
        ratingOverall: Math.round(form.ratingOverall),
        ratingClean: Math.round(form.ratingClean),
        ratingService: Math.round(form.ratingService),
        ratingLocation: Math.round(form.ratingLocation),
        ratingValue: Math.round(form.ratingValue),
        comment: form.comment
      }
      if (booking) {
        payload.bookingId = booking.bookingId
      } else if (room) {
        payload.roomId = room.roomId || room.id
      }
      await createReview(payload)
      toast.success(t('reviews.submit_success'))
      onReviewSubmitted?.()
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || t('reviews.submit_error')
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const ratingCategories = [
    { key: 'ratingOverall', label: t('reviews.rating_overall'), icon: '⭐' },
    { key: 'ratingClean', label: t('reviews.cleanliness'), icon: '🧹' },
    { key: 'ratingService', label: t('reviews.service'), icon: '🤝' },
    { key: 'ratingLocation', label: t('reviews.location'), icon: '📍' },
    { key: 'ratingValue', label: t('reviews.value'), icon: '💰' },
  ]

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
    >
      <Box sx={{
        background: 'linear-gradient(135deg, #9a1c48 0%, #c02860 100%)',
        p: 3, color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <RateReview />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {t('reviews.write_review')}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {t('reviews.room')} {roomLabel} {subtitleLabel && `· ${subtitleLabel}`}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* Rating categories */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3 }}>
          {ratingCategories.map(cat => (
            <Box key={cat.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body1" sx={{ fontWeight: cat.key === 'ratingOverall' ? 800 : 600 }}>
                {cat.icon} {cat.label}
              </Typography>
              <Rating
                value={form[cat.key]}
                onChange={(e, v) => setForm(prev => ({ ...prev, [cat.key]: v }))}
                size={cat.key === 'ratingOverall' ? 'large' : 'medium'}
              />
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Comment */}
        <TextField
          multiline
          rows={4}
          fullWidth
          value={form.comment}
          onChange={(e) => setForm(prev => ({ ...prev, comment: e.target.value }))}
          label={t('reviews.comment_placeholder')}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              '&:focus-within': { boxShadow: '0 0 0 2px rgba(154, 28, 72, 0.2)' }
            }
          }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="submitReviewButton"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            borderRadius: 2, px: 4
          }}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : t('reviews.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ReviewFormDialog
