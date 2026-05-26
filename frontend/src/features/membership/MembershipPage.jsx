import {
  Box, Typography, Paper, Chip, LinearProgress, Divider, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, CircularProgress, Tooltip, Stack, Card, CardContent
} from '@mui/material'
import {
  EmojiEvents, TrendingUp, Groups, LocalOffer, CheckCircle,
  Warning, Star, Diamond, WorkspacePremium, Verified
} from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getMembershipTiersApi, getMyMembershipApi, getHolidaysApi, getGroupDiscountRulesApi } from '~/shared/api/membershipApi'

// ── Tier visual config ──────────────────────────────────────────────────────
const TIER_VISUAL = {
  FIRST_TIME: {
    gradient: 'linear-gradient(135deg, #f9a8d4 0%, #ec4899 100%)',
    bg: '#fdf2f8',
    border: '#f9a8d4',
    icon: <Star sx={{ fontSize: 28 }} />,
    textColor: '#be185d'
  },
  SILVER: {
    gradient: 'linear-gradient(135deg, #cbd5e1 0%, #64748b 100%)',
    bg: '#f8fafc',
    border: '#cbd5e1',
    icon: <Verified sx={{ fontSize: 28 }} />,
    textColor: '#475569'
  },
  GOLD: {
    gradient: 'linear-gradient(135deg, #fde68a 0%, #f59e0b 100%)',
    bg: '#fffbeb',
    border: '#fde68a',
    icon: <EmojiEvents sx={{ fontSize: 28 }} />,
    textColor: '#b45309'
  },
  DIAMOND: {
    gradient: 'linear-gradient(135deg, #a5f3fc 0%, #06b6d4 100%)',
    bg: '#ecfeff',
    border: '#a5f3fc',
    icon: <Diamond sx={{ fontSize: 28 }} />,
    textColor: '#0e7490'
  },
  VIP: {
    gradient: 'linear-gradient(135deg, #ddd6fe 0%, #7c3aed 100%)',
    bg: '#faf5ff',
    border: '#ddd6fe',
    icon: <WorkspacePremium sx={{ fontSize: 28 }} />,
    textColor: '#6d28d9'
  }
}

const defaultVisual = TIER_VISUAL.SILVER

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n || 0)
const fmtVND = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0)

// ── Current Tier Hero Card ───────────────────────────────────────────────────
const CurrentTierCard = ({ membership, tiers, t, lang }) => {
  if (!membership) return null
  const tier = membership.tier || tiers.find(item => item.tierCode === 'FIRST_TIME') || tiers[0] || {}
  const v = TIER_VISUAL[tier.tierCode] || defaultVisual
  const isVIP = tier.tierCode === 'VIP'
  const nextTier = membership.nextTier
  const spentToNext = Number(membership.spentToNextTier || 0)
  const bookingsToNext = Number(membership.bookingsToNextTier || 0)
  const spentProgress = nextTier
    ? Math.min(100, Math.max(5, 100 - (spentToNext / (Number(nextTier.minTotalSpent) || 1)) * 100))
    : 100
  const bookingProgress = nextTier && bookingsToNext > 0
    ? Math.min(100, Math.max(5, (membership.bookingCount / (membership.bookingCount + bookingsToNext)) * 100))
    : 100

  const tierName = lang === 'en' ? (tier.displayNameEn || tier.tierCode) : (tier.displayNameVi || tier.tierCode)
  const nextTierName = nextTier ? (lang === 'en' ? nextTier.displayNameEn : nextTier.displayNameVi) : null

  return (
    <Paper elevation={0} sx={{
      borderRadius: 5,
      overflow: 'hidden',
      border: `2px solid ${v.border}`,
      mb: 4
    }}>
      {/* Header gradient */}
      <Box sx={{
        background: v.gradient,
        px: 4, py: 3,
        display: 'flex', alignItems: 'center', gap: 2
      }}>
        <Box sx={{
          width: 60, height: 60, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
        }}>
          {v.icon}
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            {t('membership.current_tier')}
          </Typography>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 900, lineHeight: 1.1 }}>
            {tierName}
          </Typography>
          <Chip
            label={`-${tier.discountPct || 0}% ${t('membership.discount')}`}
            size="small"
            sx={{ mt: 0.5, bgcolor: 'rgba(255,255,255,0.9)', color: v.textColor, fontWeight: 700, fontSize: 12 }}
          />
        </Box>
        {isVIP && (
          <Box sx={{ ml: 'auto' }}>
            <Chip
              icon={<Star sx={{ color: '#b45309 !important' }} />}
              label={t('membership.vip_badge')}
              sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 800, fontSize: 13 }}
            />
          </Box>
        )}
      </Box>

      {/* Stats row */}
      <Box sx={{ px: 4, py: 3, bgcolor: v.bg }}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={800} color={v.textColor}>{membership.bookingCount ?? 0}</Typography>
              <Typography variant="caption" color="text.secondary">{t('membership.total_bookings')}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={800} color={v.textColor}>{fmtVND(membership.totalSpent)}</Typography>
              <Typography variant="caption" color="text.secondary">{t('membership.total_spent')}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={800} color={v.textColor}>{tier.discountPct ?? 0}%</Typography>
              <Typography variant="caption" color="text.secondary">{t('membership.discount_rate')}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={800} color={v.textColor}>
                {membership.isFirstBookingUsed ? '✓' : t('membership.available')}
              </Typography>
              <Typography variant="caption" color="text.secondary">{t('membership.first_booking_perk')}</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Progress to next tier */}
        {!isVIP && nextTier && (
          <>
            <Divider sx={{ mb: 2.5, borderColor: v.border }} />
            <Typography variant="subtitle2" fontWeight={700} color={v.textColor} sx={{ mb: 2 }}>
              {t('membership.progress_to')} {nextTierName}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">{t('membership.spent_progress')}</Typography>
                  <Typography variant="caption" fontWeight={700} color={v.textColor}>
                    {fmtVND(spentToNext)} {t('membership.more')}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.max(5, spentProgress)}
                  sx={{
                    height: 8, borderRadius: 4,
                    bgcolor: `${v.border}`,
                    '& .MuiLinearProgress-bar': { background: v.gradient, borderRadius: 4 }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">{t('membership.booking_progress')}</Typography>
                  <Typography variant="caption" fontWeight={700} color={v.textColor}>
                    {bookingsToNext} {t('membership.bookings_more')}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.max(5, bookingProgress)}
                  sx={{
                    height: 8, borderRadius: 4,
                    bgcolor: `${v.border}`,
                    '& .MuiLinearProgress-bar': { background: v.gradient, borderRadius: 4 }
                  }}
                />
              </Grid>
            </Grid>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
              * {t('membership.upgrade_note')}
            </Typography>
          </>
        )}

        {isVIP && (
          <Alert severity="success" icon={<WorkspacePremium />} sx={{ mt: 1, borderRadius: 3 }}>
            {t('membership.vip_congrats')}
          </Alert>
        )}
      </Box>
    </Paper>
  )
}

// ── Tier comparison cards ────────────────────────────────────────────────────
const TierCard = ({ tier, isActive, lang, t }) => {
  const v = TIER_VISUAL[tier.tierCode] || defaultVisual
  const name = lang === 'en' ? (tier.displayNameEn || tier.tierCode) : (tier.displayNameVi || tier.tierCode)
  let benefits = []
  try {
    benefits = JSON.parse(lang === 'en' ? (tier.benefitsEn || '[]') : (tier.benefitsVi || '[]'))
  } catch { benefits = [] }

  return (
    <Card elevation={0} sx={{
      height: '100%',
      borderRadius: 4,
      border: isActive ? `2px solid ${v.textColor}` : `1px solid ${v.border}`,
      bgcolor: isActive ? v.bg : 'background.paper',
      transform: isActive ? 'scale(1.02)' : 'none',
      transition: 'all 0.2s',
      position: 'relative',
      overflow: 'visible'
    }}>
      {isActive && (
        <Chip
          label={`★ ${t('membership.your_tier')}`}
          size="small"
          sx={{
            position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
            background: v.gradient, color: 'white', fontWeight: 700, fontSize: 11,
            zIndex: 1
          }}
        />
      )}
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: '50%', background: v.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', mx: 'auto', mb: 1,
            boxShadow: `0 4px 12px ${v.border}`
          }}>
            {v.icon}
          </Box>
          <Typography variant="h6" fontWeight={800} color={v.textColor}>{name}</Typography>
          <Typography variant="h4" fontWeight={900} color={v.textColor} sx={{ lineHeight: 1 }}>
            {tier.discountPct}%
          </Typography>
          <Typography variant="caption" color="text.secondary">{t('membership.discount').toLowerCase()}</Typography>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {benefits.length > 0 ? (
          <Stack spacing={0.75}>
            {benefits.map((b, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                <CheckCircle sx={{ fontSize: 14, color: v.textColor, mt: 0.25, flexShrink: 0 }} />
                <Typography variant="caption" color="text.secondary">{b}</Typography>
              </Box>
            ))}
          </Stack>
        ) : (
          <Stack spacing={0.75}>
            {tier.tierCode === 'FIRST_TIME' && (
              <Box sx={{ display: 'flex', gap: 0.75 }}>
                <CheckCircle sx={{ fontSize: 14, color: v.textColor, mt: 0.25, flexShrink: 0 }} />
                <Typography variant="caption" color="text.secondary">{t('membership.first_booking_benefit')}</Typography>
              </Box>
            )}
            {tier.tierCode !== 'FIRST_TIME' && (
              <>
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  <CheckCircle sx={{ fontSize: 14, color: v.textColor, mt: 0.25, flexShrink: 0 }} />
                  <Typography variant="caption" color="text.secondary">{t('membership.tier_booking_benefit', { discount: tier.discountPct })}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  <CheckCircle sx={{ fontSize: 14, color: v.textColor, mt: 0.25, flexShrink: 0 }} />
                  <Typography variant="caption" color="text.secondary">{t('membership.spending_requirement', { amount: fmtVND(tier.minTotalSpent) })}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  <CheckCircle sx={{ fontSize: 14, color: v.textColor, mt: 0.25, flexShrink: 0 }} />
                  <Typography variant="caption" color="text.secondary">{t('membership.booking_requirement', { count: tier.minBookingCount })}</Typography>
                </Box>
              </>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

// ── Holiday notice ───────────────────────────────────────────────────────────
const HolidaySection = ({ holidays, t }) => {
  if (!holidays || holidays.length === 0) return null
  const active = holidays.filter(h => h.isActive)
  if (active.length === 0) return null

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #fde68a', bgcolor: '#fffbeb', mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Warning sx={{ color: '#f59e0b' }} />
        <Typography variant="subtitle1" fontWeight={700} color="#b45309">
          {t('membership.holiday_notice_title')}
        </Typography>
      </Stack>
      <Alert severity="warning" sx={{ mb: 2, borderRadius: 3 }}>
        <Typography variant="body2" fontWeight={600}>
          {t('membership.holiday_price_note')}
        </Typography>
      </Alert>
      <Grid container spacing={2}>
        {active.map(h => (
          <Grid key={h.holidayId} size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ p: 2, borderRadius: 3, border: '1px dashed #fcd34d', bgcolor: 'white' }}>
              <Typography variant="body2" fontWeight={700} color="#b45309">{h.nameVi}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(h.startDate).toLocaleDateString('vi-VN')} – {new Date(h.endDate).toLocaleDateString('vi-VN')}
              </Typography>
              <Chip
                label={`×${h.priceMultiplier}`}
                size="small"
                sx={{ ml: 1, bgcolor: '#fef3c7', color: '#b45309', fontWeight: 700, fontSize: 11 }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
}

// ── Group discount section ───────────────────────────────────────────────────
const GroupSection = ({ rules, t }) => {
  if (!rules || rules.length === 0) return null
  const active = rules.filter(r => r.isActive)
  if (active.length === 0) return null

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #bbf7d0', bgcolor: '#f0fdf4', mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Groups sx={{ color: '#16a34a' }} />
        <Typography variant="subtitle1" fontWeight={700} color="#15803d">
          {t('membership.group_discount_title')}
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('membership.group_discount_desc')}
      </Typography>
      <Grid container spacing={1.5}>
        {active.sort((a, b) => a.minGuests - b.minGuests).map(r => (
          <Grid key={r.ruleId} size={{ xs: 6, sm: 3 }}>
            <Box sx={{
              p: 2, borderRadius: 3, border: '1px solid #bbf7d0', bgcolor: 'white',
              textAlign: 'center'
            }}>
              <Typography variant="h6" fontWeight={800} color="#16a34a">-{r.discountPct}%</Typography>
              <Typography variant="caption" color="text.secondary">
                {r.maxGuests ? `${r.minGuests}–${r.maxGuests} ${t('membership.guests')}` : `≥${r.minGuests} ${t('membership.guests')}`}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
}

// ── Comparison table ─────────────────────────────────────────────────────────
const ComparisonTable = ({ tiers, currentCode, t, lang }) => {
  const sorted = [...(tiers || [])].sort((a, b) => a.tierLevel - b.tierLevel)
  return (
    <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <Box sx={{ px: 3, py: 2, bgcolor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <TrendingUp color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>{t('membership.comparison_title')}</Typography>
        </Stack>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f9fafb' }}>
              <TableCell sx={{ fontWeight: 700 }}>{t('membership.tier')}</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>{t('membership.discount')}</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>{t('membership.min_spent')}</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>{t('membership.min_bookings')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map(tier => {
              const v = TIER_VISUAL[tier.tierCode] || defaultVisual
              const isActive = tier.tierCode === currentCode
              const name = lang === 'en' ? (tier.displayNameEn || tier.tierCode) : (tier.displayNameVi || tier.tierCode)
              return (
                <TableRow
                  key={tier.tierId}
                  sx={{ bgcolor: isActive ? v.bg : 'inherit', '& td': { fontWeight: isActive ? 700 : 400 } }}
                >
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{
                        width: 24, height: 24, borderRadius: '50%', background: v.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0
                      }}>
                        {v.icon && <Box sx={{ fontSize: 12, display: 'flex' }}>{v.icon}</Box>}
                      </Box>
                      <Typography variant="body2" fontWeight={isActive ? 700 : 400} color={isActive ? v.textColor : 'inherit'}>
                        {name}
                        {isActive && <Chip label="✓" size="small" sx={{ ml: 0.75, height: 18, fontSize: 10, bgcolor: v.border, color: v.textColor }} />}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={`-${tier.discountPct}%`} size="small" sx={{ background: isActive ? v.gradient : undefined, color: isActive ? 'white' : v.textColor, fontWeight: 700 }} />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {tier.tierCode === 'FIRST_TIME' ? '—' : fmtVND(tier.minTotalSpent)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {tier.tierCode === 'FIRST_TIME' ? t('membership.once_only') : `≥ ${tier.minBookingCount}`}
                    </Typography>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
const MembershipPage = () => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language || 'vi'
  const [membership, setMembership] = useState(null)
  const [tiers, setTiers] = useState([])
  const [holidays, setHolidays] = useState([])
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      getMyMembershipApi(),
      getMembershipTiersApi(),
      getHolidaysApi(),
      getGroupDiscountRulesApi()
    ]).then(([m, tiersData, h, r]) => {
      setMembership(m)
      setTiers(tiersData || [])
      setHolidays(Array.isArray(h) ? h : [])
      setRules(Array.isArray(r) ? r : [])
    }).catch(err => {
      setError(err?.response?.data?.message || t('membership.fetch_error'))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const sortedTiers = [...tiers].sort((a, b) => a.tierLevel - b.tierLevel)

  return (
    <Box sx={{ maxWidth: 1180, mx: 'auto', py: { xs: 3, md: 5 }, px: { xs: 2, md: 4 } }}>
      {/* Page title */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5} sx={{ mb: 1 }}>
          <EmojiEvents sx={{ color: 'secondary.main', fontSize: 40 }} />
          <Typography variant="h4" fontWeight={900} color="secondary.main">
            {t('membership.page_title')}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">{t('membership.page_subtitle')}</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

      {/* Current tier */}
      <CurrentTierCard membership={membership} tiers={tiers} t={t} lang={lang} />

      {/* Holiday & Group discount notices */}
      <HolidaySection holidays={holidays} t={t} />
      <GroupSection rules={rules} t={t} />

      {/* Tier cards */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
          <LocalOffer color="primary" />
          <Typography variant="h6" fontWeight={700}>{t('membership.all_tiers_title')}</Typography>
        </Stack>
        <Grid container spacing={2}>
          {sortedTiers.map(tier => (
            <Grid key={tier.tierId} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <TierCard tier={tier} isActive={membership?.tier?.tierCode === tier.tierCode} lang={lang} t={t} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Comparison table */}
      <ComparisonTable tiers={tiers} currentCode={membership?.tier?.tierCode} t={t} lang={lang} />
    </Box>
  )
}

export default MembershipPage
