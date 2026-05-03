import React, { memo } from 'react';
import { Box, Typography, Avatar, CircularProgress } from '@mui/material';
import { SmartToy, Person } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';

const PC = '#c0496e';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const Message = memo(({ message, isTyping = false }) => {
  const isUser = message.role === 'USER';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 1,
        mb: 1.5,
        px: 1,
        alignItems: 'flex-end',
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: isUser ? PC : '#e8e8e8',
          color: isUser ? '#fff' : PC,
          flexShrink: 0,
        }}
      >
        {isUser ? <Person sx={{ fontSize: 18 }} /> : <SmartToy sx={{ fontSize: 18 }} />}
      </Avatar>

      {/* Bubble */}
      <Box
        sx={{
          maxWidth: '75%',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            px: 1.8,
            py: 1.2,
            borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            bgcolor: isUser ? PC : '#f0f0f5',
            color: isUser ? '#fff' : '#1a1a2e',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            wordBreak: 'break-word',
            '& p': { m: 0 },
            '& p + p': { mt: 0.8 },
            '& ul, & ol': { pl: 2.5, my: 0.5 },
            '& li': { mb: 0.3 },
            '& code': {
              bgcolor: isUser ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)',
              px: 0.5,
              borderRadius: 0.5,
              fontSize: '0.85em',
            },
            '& pre': {
              bgcolor: isUser ? 'rgba(255,255,255,0.1)' : '#e4e4ec',
              p: 1.2,
              borderRadius: 1,
              overflowX: 'auto',
              my: 0.8,
            },
            '& a': {
              color: isUser ? '#ffd6e7' : PC,
              textDecoration: 'underline',
            },
            '& strong': {
              fontWeight: 700,
            },
          }}
        >
          {isTyping ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.3 }}>
              <CircularProgress size={14} sx={{ color: PC }} />
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#888' }}>
                Đang trả lời...
              </Typography>
            </Box>
          ) : isUser ? (
            <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.875rem' }}>
              {message.content}
            </Typography>
          ) : (
            <Box sx={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </Box>
          )}
        </Box>

        {/* Timestamp */}
        {!isTyping && message.createdAt && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: isUser ? 'right' : 'left',
              color: '#aaa',
              fontSize: '0.7rem',
              mt: 0.3,
              px: 0.5,
            }}
          >
            {formatTime(message.createdAt)}
          </Typography>
        )}
      </Box>
    </Box>
  );
});

Message.displayName = 'Message';

export default Message;
