import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
  Button,
  Paper,
  Divider
} from '@mui/material';
import {
  KingBed,
  Security,
  SupportAgent,
  Star,
  Wifi,
  Pool,
  Restaurant,
  Spa,
  EventNote
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import heroBg from '../../assets/hotel_hero.png';

// Dữ liệu giới thiệu dịch vụ
const features = [
  { icon: <KingBed sx={{ fontSize: 40 }} />, title: 'home.features.rooms.title', desc: 'home.features.rooms.desc' },
  { icon: <Security sx={{ fontSize: 40 }} />, title: 'home.features.security.title', desc: 'home.features.security.desc' },
  { icon: <SupportAgent sx={{ fontSize: 40 }} />, title: 'home.features.support.title', desc: 'home.features.support.desc' },
  { icon: <Star sx={{ fontSize: 40 }} />, title: 'home.features.experience.title', desc: 'home.features.experience.desc' },
];

// Dữ liệu tiện ích
const amenities = [
  { icon: <Wifi />, label: 'home.amenities.wifi' },
  { icon: <Pool />, label: 'home.amenities.pool' },
  { icon: <Restaurant />, label: 'home.amenities.restaurant' },
  { icon: <Spa />, label: 'home.amenities.spa' },
];

// Dữ liệu đánh giá
const reviews = [
  { key: 'item1', avatar: 'A', rating: 5, date: '15/04/2026' },
  { key: 'item2', avatar: 'M', rating: 5, date: '10/04/2026' },
  { key: 'item3', avatar: 'P', rating: 4, date: '05/04/2026' },
  { key: 'item4', avatar: 'N', rating: 5, date: '01/04/2026' },
];

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          height: '70vh',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 100%), url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center', zIndex: 1 }}>
          <Typography variant="overline" sx={{ letterSpacing: 4, fontSize: '0.9rem', opacity: 0.9, mb: 2, display: 'block' }}>
            {t("home.hero.welcome")}
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, textShadow: '2px 4px 20px rgba(0,0,0,0.4)' }}>
            Hotel Booking System
          </Typography>
          <Typography variant="h6" sx={{ mb: 5, fontWeight: 300, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
            {t("home.hero.subtitle")}
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<EventNote />}
            onClick={() => navigate('/bookings')}
            sx={{
              py: 1.8, px: 5, borderRadius: 3, fontWeight: 800, fontSize: '1.1rem',
              bgcolor: 'white', color: '#9a1c48',
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: '#9a1c48',
                color: 'white',
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 35px rgba(154, 28, 72, 0.4)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {t("home.hero.cta")}
          </Button>
        </Container>
      </Box>

      {/* Stats Bar */}
      <Paper 
        elevation={8} 
        sx={{ 
          mx: 'auto', 
          maxWidth: 1200, 
          width: '95%',
          mt: -6, 
          borderRadius: 4, 
          position: 'relative', 
          zIndex: 2, 
          overflow: 'hidden', 
          background: 'linear-gradient(135deg, #9a1c48 0%, #c02860 100%)',
          boxShadow: '0 10px 40px rgba(154, 28, 72, 0.3)',
          display: 'flex', // Dùng Flexbox để ép giãn đều
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {[
          { number: '200+', labelKey: 'home.stats.rooms' },
          { number: '50K+', labelKey: 'home.stats.customers' },
          { number: '4.8★', labelKey: 'home.stats.rating' },
          { number: '24/7', labelKey: 'home.stats.support' },
        ].map((stat, i) => (
          <Box 
            key={i}
            sx={{ 
              flex: 1, // Mỗi ô chiếm 1 phần bằng nhau (1/4)
              textAlign: 'center', 
              py: { xs: 3, md: 5 }, 
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.15)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#fff', mb: 0.5, fontSize: { xs: '1.2rem', sm: '1.8rem', md: '2.5rem' } }}>
              {stat.number}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: 1, textTransform: 'uppercase', fontSize: { xs: '0.6rem', sm: '0.75rem', md: '0.9rem' } }}>
              {t(stat.labelKey)}
            </Typography>
          </Box>
        ))}
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 7 }}>
          <Typography variant="overline" color="secondary.main" sx={{ fontWeight: 700, letterSpacing: 3 }}>
            {t("home.features.overline")}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>
            {t("home.features.title")}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((f, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{
                p: 3, textAlign: 'center', borderRadius: 4, height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 30px rgba(0,0,0,0.1)' }
              }}>
                <Box sx={{
                  width: 80, height: 80, borderRadius: 3, mx: 'auto', mb: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: '#9a1c48', color: '#fff'
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

      {/* Amenities Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography variant="overline" color="secondary.main" sx={{ fontWeight: 700, letterSpacing: 3 }}>
              {t("home.amenities.overline")}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>
              {t("home.amenities.title")}
            </Typography>
          </Box>
          <Grid container spacing={3} justifyContent="center">
            {amenities.map((a, i) => (
              <Grid item xs={6} sm={3} key={i}>
                <Paper elevation={0} sx={{
                  p: 3, textAlign: 'center', borderRadius: 3, border: '2px solid', borderColor: 'divider',
                  transition: 'all 0.3s', '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.light', color: 'primary.contrastText' }
                }}>
                  <Box sx={{ mb: 1 }}>{a.icon}</Box>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{t(a.label)}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Reviews Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 7 }}>
          <Typography variant="overline" color="secondary.main" sx={{ fontWeight: 700, letterSpacing: 3 }}>
            {t("home.reviews.overline")}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>
            {t("home.reviews.title")}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {reviews.map((r, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{
                p: 3, borderRadius: 4, height: '100%', position: 'relative',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }
              }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', fontWeight: 700 }}>{r.avatar}</Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t(`home.reviews.${r.key}.name`)}</Typography>
                      <Typography variant="caption" color="text.secondary">{r.date}</Typography>
                    </Box>
                  </Box>
                  <Rating value={r.rating} readOnly size="small" sx={{ mb: 1.5 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', lineHeight: 1.7 }}>
                    "{t(`home.reviews.${r.key}.comment`)}"
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{
        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        py: 8, textAlign: 'center', color: 'white'
      }}>
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
            {t("home.cta.title")}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            {t("home.cta.subtitle")}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/bookings')}
            sx={{
              bgcolor: 'white', color: '#9a1c48', fontWeight: 800, px: 6, py: 2, borderRadius: 3,
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              '&:hover': {
                bgcolor: '#9a1c48',
                color: 'white',
                transform: 'translateY(-3px)',
                boxShadow: '0 15px 40px rgba(154, 28, 72, 0.4)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {t("home.hero.cta")}
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t("home.footer.text")}
        </Typography>
      </Box>
    </Box>
  );
};

export default HomePage;
