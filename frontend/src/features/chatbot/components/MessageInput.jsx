import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, InputBase } from '@mui/material';
import { Send } from '@mui/icons-material';

const PC = '#c0496e';

const MessageInput = ({ onSend, disabled = false }) => {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-focus when enabled
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 0.5,
        p: 1,
        borderTop: '1px solid #eee',
        bgcolor: '#fafafa',
      }}
    >
      <InputBase
        inputRef={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nhập tin nhắn..."
        disabled={disabled}
        multiline
        maxRows={4}
        sx={{
          flex: 1,
          px: 1.5,
          py: 1,
          bgcolor: '#fff',
          borderRadius: 2.5,
          border: '1px solid #e0e0e0',
          fontSize: '0.875rem',
          transition: 'border-color 0.2s',
          '&.Mui-focused': {
            borderColor: PC,
          },
        }}
      />
      <IconButton
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        sx={{
          bgcolor: text.trim() && !disabled ? PC : '#e0e0e0',
          color: '#fff',
          width: 38,
          height: 38,
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: text.trim() && !disabled ? '#a0365a' : '#e0e0e0',
          },
          '&.Mui-disabled': {
            color: '#bbb',
            bgcolor: '#e8e8e8',
          },
        }}
      >
        <Send sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
};

export default MessageInput;
