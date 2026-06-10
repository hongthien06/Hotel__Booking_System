import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Container, Grid, Card, CardContent,
  Avatar, Rating, Button, Paper, Skeleton
} from '@mui/material'
import {
  KingBed, Security, SupportAgent, Star,
  Wifi, Pool, Restaurant, Spa, EventNote,
  AccessTime, EventBusy, CreditCard, Gavel,
  ChatBubbleOutline, VerifiedUser
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import heroBg from '../../assets/hotel_hero.png'
import { getApprovedReviews } from '../../shared/api/reviewApi'

const PC = '#9a1c48'
const PC_ALPHA = 'rgba(154,28,72,0.08)'

const features = [
  { icon: <KingBed sx={{ fontSize: 40 }} />, title: 'home.features.rooms.title', desc: 'home.features.rooms.desc' },
  { icon: <Security sx={{ fontSize: 40 }} />, title: 'home.features.security.title', desc: 'home.features.security.desc' },
  { icon: <SupportAgent sx={{ fontSize: 40 }} />, title: 'home.features.support.title', desc: 'home.features.support.desc' },
  { icon: <Star sx={{ fontSize: 40 }} />, title: 'home.features.experience.title', desc: 'home.features.experience.desc' },
]

const amenities = [
  { icon: <Wifi sx={{ fontSize: 32 }} />, label: 'home.amenities.wifi' },
  { icon: <Pool sx={{ fontSize: 32 }} />, label: 'home.amenities.pool' },
  { icon: <Restaurant sx={{ fontSize: 32 }} />, label: 'home.amenities.restaurant' },
  { icon: <Spa sx={{ fontSize: 32 }} />, label: 'home.amenities.spa' },
]

const policyCards = [
  { icon: <AccessTime sx={{ fontSize: 36 }} />, title: 'home.policy.cards.checkin.title', desc: 'home.policy.cards.checkin.desc' },
  { icon: <EventBusy sx={{ fontSize: 36 }} />, title: 'home.policy.cards.cancel.title', desc: 'home.policy.cards.cancel.desc' },
  { icon: <CreditCard sx={{ fontSize: 36 }} />, title: 'home.policy.cards.payment.title', desc: 'home.policy.cards.payment.desc' },
  { icon: <Gavel sx={{ fontSize: 36 }} />, title: 'home.policy.cards.rules.title', desc: 'home.policy.cards.rules.desc' },
  { icon: <ChatBubbleOutline sx={{ fontSize: 36 }} />, title: 'home.policy.cards.request.title', desc: 'home.policy.cards.request.desc' },
  { icon: <VerifiedUser sx={{ fontSize: 36 }} />, title: 'home.policy.cards.safety.title', desc: 'home.policy.cards.safety.desc' },
]



const SectionHeader = ({ overline, title, subtitle }) => (
  <Box sx={{ textAlign: 'center', mb: 7 }}>
    <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 3, color: PC }}>
      {overline}
    </Typography>
    <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 560, mx: 'auto' }}>
        {subtitle}
      </Typography>
    )}
  </Box>
)

const HomePage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [apiReviews, setApiReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getApprovedReviews(0, 4)
        setApiReviews(data.content || [])
      } catch (err) {
        console.error('Error fetching reviews:', err)
      } finally {
        setReviewsLoading(false)
      }
    }
    fetchReviews()
  }, [])

  const hasApiReviews = apiReviews.length > 0

  return (
    <Box>

      {/* ── Hero ─────────────────────────────────────────── */}
      <Box sx={{
        minHeight: { xs: '80vh', md: '70vh' },
        py: { xs: 8, md: 0 },
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        backgroundImage: `linear-gradient(135deg,rgba(0,0,0,0.52) 0%,rgba(0,0,0,0.28) 100%),url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <Container maxWidth="md" sx={{ textAlign: 'center', zIndex: 1 }}>
          <Typography variant="overline" sx={{ letterSpacing: 4, fontSize: { xs: '0.7rem', sm: '0.9rem' }, opacity: 0.9, mb: 2, display: 'block' }}>
            {t('home.hero.welcome')}
          </Typography>
          <Typography variant="h2" sx={{
            fontWeight: 900, mb: 2,
            textShadow: '2px 4px 20px rgba(0,0,0,0.4)',
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' }
          }}>
            {t('home.hero.title')}
          </Typography>
          <Typography variant="h6" sx={{
            mb: 4, fontWeight: 300, opacity: 0.9, maxWidth: 600, mx: 'auto',
            fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }, px: 2
          }}>
            {t('home.hero.subtitle')}
          </Typography>
          <Button
            variant="heroBookNow" size="large" startIcon={<EventNote />}
            onClick={() => navigate('/bookings')}
            sx={{
              py: { xs: 1.5, md: 1.8 }, px: { xs: 4, md: 5 }, borderRadius: 3,
              fontWeight: 800, fontSize: { xs: '0.9rem', md: '1.1rem' }
            }}
          >
            {t('home.hero.cta')}
          </Button>
        </Container>
      </Box>

      {/* ── Stats Bar ────────────────────────────────────── */}
      <Paper elevation={8} sx={{
        mx: 'auto', maxWidth: 1200, width: '90%',
        mt: { xs: -4, md: -6 }, borderRadius: 4,
        position: 'relative', zIndex: 2, overflow: 'hidden',
        background: `linear-gradient(135deg,${PC} 0%,#c02860 100%)`,
        boxShadow: '0 10px 40px rgba(154,28,72,0.3)',
        display: 'flex', flexWrap: 'wrap'
      }}>
        {[
          { number: '200+', labelKey: 'home.stats.rooms' },
          { number: '50K+', labelKey: 'home.stats.customers' },
          { number: '4.7★', labelKey: 'home.stats.rating' },
          { number: '24/7', labelKey: 'home.stats.support' },
        ].map((stat, i) => (
          <Box key={i} sx={{
            flex: { xs: '0 0 50%', md: 1 }, textAlign: 'center',
            py: { xs: 2.5, md: 5 },
            borderRight: {
              xs: i % 2 === 0 ? '1px solid rgba(255,255,255,0.15)' : 'none',
              md: i < 3 ? '1px solid rgba(255,255,255,0.15)' : 'none'
            },
            borderBottom: { xs: i < 2 ? '1px solid rgba(255,255,255,0.15)' : 'none', md: 'none' },
            display: 'flex', flexDirection: 'column', justifyContent: 'center'
          }}>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#fff', mb: 0.5, fontSize: { xs: '1.2rem', sm: '1.8rem', md: '2.5rem' } }}>
              {stat.number}
            </Typography>
            <Typography sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: 1, textTransform: 'uppercase', fontSize: { xs: '0.6rem', sm: '0.75rem', md: '0.9rem' } }}>
              {t(stat.labelKey)}
            </Typography>
          </Box>
        ))}
      </Paper>

      {/* ── Features ─────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <SectionHeader
          overline={t('home.features.overline')}
          title={t('home.features.title')}
        />
        <Grid container spacing={4}>
          {features.map((f, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Card sx={{
                p: 3, textAlign: 'center', borderRadius: 4, height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 30px rgba(0,0,0,0.1)' }
              }}>
                <Box sx={{
                  width: 80, height: 80, borderRadius: 3, mx: 'auto', mb: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: PC, color: '#fff'
                }}>
                  {f.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>{t(f.title)}</Typography>
                <Typography variant="body2" color="text.secondary">{t(f.desc)}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ── Amenities ────────────────────────────────────── */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <SectionHeader
            overline={t('home.amenities.overline')}
            title={t('home.amenities.title')}
          />
          <Grid container spacing={3} justifyContent="center">
            {amenities.map((a, i) => (
              <Grid size={{ xs: 6, sm: 3 }} key={i}>
                <Paper elevation={0} sx={{
                  p: 3, textAlign: 'center', borderRadius: 3,
                  border: '2px solid', borderColor: 'divider',
                  transition: 'all 0.3s',
                  '&:hover': { borderColor: PC, bgcolor: PC_ALPHA, transform: 'translateY(-4px)' }
                }}>
                  <Box sx={{ mb: 1, color: PC }}>{a.icon}</Box>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{t(a.label)}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Policy ───────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <SectionHeader
          overline={t('home.policy.overline')}
          title={t('home.policy.title')}
          subtitle={t('home.policy.subtitle')}
        />
        <Grid container spacing={3}>
          {policyCards.map((item, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Card sx={{
                p: 3, borderRadius: 4, height: '100%',
                border: '1.5px solid', borderColor: 'divider',
                boxShadow: 'none',
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: PC,
                  boxShadow: `0 8px 28px rgba(154,28,72,0.12)`,
                  transform: 'translateY(-5px)'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: '3px',
                  bgcolor: PC,
                  opacity: 0,
                  transition: 'opacity 0.3s'
                },
                '&:hover::before': { opacity: 1 }
              }}>
                <Box sx={{
                  width: 60, height: 60, borderRadius: 2.5, mb: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: PC_ALPHA, color: PC
                }}>
                  {item.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: '1rem' }}>
                  {t(item.title)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                  {t(item.desc)}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ── Reviews ──────────────────────────────────────── */}
      <Box sx={{ bgcolor: 'background.paper', py: 10 }}>
        <Container maxWidth="lg">
          <SectionHeader
            overline={t('home.reviews.overline')}
            title={t('home.reviews.title')}
          />
          <Grid container spacing={4}>
            {reviewsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4 }} />
                </Grid>
              ))
            ) : apiReviews.length > 0 ? (
              apiReviews.map((r) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={r.reviewId || r.id}>
                  <Card sx={{
                    p: 3, borderRadius: 4, height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }
                  }}>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: PC, fontWeight: 700 }}>
                          {r.customerName?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{r.customerName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Rating value={r.ratingOverall} readOnly size="small" sx={{ mb: 1.5 }} />
                      {r.comment && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', lineHeight: 1.7 }}>
                          "{r.comment}"
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid size={{ xs: 12 }}>
                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4, fontStyle: 'italic' }}>
                  Hiện tại chưa có đánh giá nào. Hãy trải nghiệm và để lại đánh giá của bạn nhé!
                </Typography>
              </Grid>
            )}
          </Grid>
          {/* See all reviews button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Button
              variant="seeAll"
              onClick={() => navigate('/reviews')}
              sx={{ px: 5, py: 1.5, borderRadius: 3 }}
            >
              {t('common.see_all')} →
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── CTA ──────────────────────────────────────────── */}
      <Box sx={{
        background: `linear-gradient(135deg,${PC} 0%,#c02860 100%)`,
        py: 10, textAlign: 'center', color: 'white'
      }}>
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
            {t('home.cta.title')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            {t('home.cta.subtitle')}
          </Typography>
          <Button
            variant="bookNow" size="large"
            onClick={() => navigate('/bookings')}
            sx={{ px: 6, py: 2, borderRadius: 3 }}
          >
            {t('home.hero.cta')}
          </Button>
        </Container>
      </Box>

      {/* ── Footer ───────────────────────────────────────── */}
      <Box sx={{ bgcolor: 'background.paper', py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t('home.footer.text')}
        </Typography>
      </Box>

    </Box>
  )
}


export default HomePage
