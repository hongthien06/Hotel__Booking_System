import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import { Close, LockOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LoginPromptModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 2,
          textAlign: 'center'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ 
          width: 70, 
          height: 70, 
          borderRadius: '50%', 
          bgcolor: 'rgba(154, 28, 72, 0.1)', 
          color: '#9a1c48',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3
        }}>
          <LockOutlined sx={{ fontSize: 35 }} />
        </Box>
        
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: '#9a1c48' }}>
          {t('auth.login_required_title') || 'Yêu cầu đăng nhập'}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
          {t('auth.login_to_book_desc') || 'Đăng nhập để tiến hành đặt phòng và hưởng các ưu đãi tốt nhất từ chúng tôi.'}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ flexDirection: 'column', gap: 1.5, px: 3, pb: 2 }}>
        <Button 
          fullWidth 
          variant="contained" 
          onClick={handleLogin}
          sx={{ 
            bgcolor: '#9a1c48', 
            '&:hover': { bgcolor: '#c02860' },
            borderRadius: 3,
            py: 1.5,
            fontWeight: 700,
            fontSize: '1rem',
            textTransform: 'none'
          }}
        >
          {t('header.login') || 'Đăng nhập ngay'}
        </Button>
        <Button 
          fullWidth 
          variant="text" 
          onClick={onClose}
          sx={{ 
            color: 'text.secondary',
            fontWeight: 600,
            textTransform: 'none'
          }}
        >
          {t('common.cancel') || 'Để sau'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginPromptModal;
