import React, { useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  Close,
  DeleteOutline,
  ChatBubbleOutline,
} from '@mui/icons-material';
import Message from './Message';
import MessageInput from './MessageInput';

const PC = '#c0496e';
const PC_LIGHT = '#fce4ec';

const ChatWindow = ({
  // Data
  conversations,
  activeConvId,
  messages,

  // State
  loading,
  sending,
  error,

  // Actions
  onSelectConversation,
  onCreateConversation,
  onSendMessage,
  onCloseConversation,
  onDismissError,

  // Window control
  onClose,
}) => {
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, sending]);

  const activeConversation = conversations.find(
    (c) => c.conversationId === activeConvId,
  );

  const showConversationList = !activeConvId;

  /* ─── Header ──────────────────────────────────────── */
  const renderHeader = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 1.5,
        py: 1,
        background: `linear-gradient(135deg, ${PC} 0%, #e8527a 100%)`,
        color: '#fff',
        minHeight: 48,
      }}
    >
      {activeConvId && (
        <IconButton
          size="small"
          onClick={() => onSelectConversation(null)}
          sx={{ color: '#fff', mr: 0.5 }}
        >
          <ArrowBack sx={{ fontSize: 20 }} />
        </IconButton>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            fontSize: '0.85rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {activeConvId
            ? activeConversation?.title || 'Cuộc trò chuyện'
            : '🏨 Hotel Assistant'}
        </Typography>
        {!activeConvId && (
          <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.7rem' }}>
            Xin chào! Tôi có thể giúp gì cho bạn?
          </Typography>
        )}
      </Box>

      {activeConvId && activeConversation?.status !== 'CLOSED' && (
        <Tooltip title="Đóng cuộc trò chuyện">
          <IconButton
            size="small"
            onClick={() => onCloseConversation(activeConvId)}
            sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
          >
            <DeleteOutline sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}

      <IconButton
        size="small"
        onClick={onClose}
        sx={{ color: '#fff', ml: 0.5 }}
      >
        <Close sx={{ fontSize: 20 }} />
      </IconButton>
    </Box>
  );

  /* ─── Conversation list view ──────────────────────── */
  const renderConversationList = () => (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* New conversation button */}
      <Box sx={{ p: 1.5 }}>
        <Box
          onClick={() => onCreateConversation()}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.5,
            borderRadius: 2,
            border: `2px dashed ${PC}40`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: PC_LIGHT,
              borderColor: PC,
            },
          }}
        >
          <Add sx={{ color: PC, fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: PC }}>
            Cuộc trò chuyện mới
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Conversation list */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {conversations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5, px: 2 }}>
            <ChatBubbleOutline sx={{ fontSize: 48, color: '#ddd', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Chưa có cuộc trò chuyện nào.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Bắt đầu cuộc trò chuyện mới để được hỗ trợ!
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {conversations.map((conv) => (
              <ListItemButton
                key={conv.conversationId}
                onClick={() => onSelectConversation(conv.conversationId)}
                sx={{
                  py: 1.2,
                  px: 2,
                  borderBottom: '1px solid #f5f5f5',
                  transition: 'background 0.15s',
                  '&:hover': { bgcolor: PC_LIGHT },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '0.82rem',
                        }}
                      >
                        {conv.title || 'Cuộc trò chuyện'}
                      </Typography>
                      <Chip
                        label={conv.status === 'CLOSED' ? 'Đã đóng' : 'Đang mở'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          bgcolor:
                            conv.status === 'CLOSED' ? '#eee' : PC_LIGHT,
                          color: conv.status === 'CLOSED' ? '#999' : PC,
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      sx={{ color: '#aaa', fontSize: '0.7rem' }}
                    >
                      {conv.createdAt
                        ? (() => {
                            const dateStr = conv.createdAt;
                            const normalizedDateStr =
                              dateStr.endsWith('Z') || dateStr.includes('+')
                                ? dateStr
                                : `${dateStr}Z`;
                            return new Date(normalizedDateStr).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            });
                          })()
                        : ''}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>

      {/* Quick send — when no conversation selected, user can type directly */}
      <MessageInput
        onSend={(text) => {
          onCreateConversation().then(() => {
            // Small delay so conversation is created before sending
            setTimeout(() => onSendMessage(text), 100);
          });
        }}
        disabled={false}
      />
    </Box>
  );

  /* ─── Chat view (messages) ────────────────────────── */
  const renderChatView = () => (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Error banner */}
      {error && (
        <Alert
          severity="error"
          onClose={onDismissError}
          sx={{
            borderRadius: 0,
            fontSize: '0.78rem',
            py: 0,
            '& .MuiAlert-message': { py: 0.6 },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Messages area */}
      <Box
        ref={scrollContainerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          py: 1.5,
          px: 0.5,
          bgcolor: '#fafafa',
          scrollBehavior: 'smooth',
        }}
      >
        {/* Welcome message if no messages yet */}
        {messages.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
            <Typography sx={{ fontSize: 40, mb: 1 }}>🏨</Typography>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: '#555', mb: 0.5 }}
            >
              Xin chào!
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              Tôi là trợ lý ảo của hệ thống khách sạn. Hãy hỏi tôi về phòng, giá
              cả, dịch vụ, hoặc bất cứ điều gì bạn cần!
            </Typography>
          </Box>
        )}

        {messages.map((msg) => (
          <Message key={msg.messageId} message={msg} />
        ))}

        {/* Typing indicator */}
        {sending && (
          <Message
            message={{ role: 'ASSISTANT', content: '' }}
            isTyping
          />
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      {activeConversation?.status !== 'CLOSED' ? (
        <MessageInput onSend={onSendMessage} disabled={sending} />
      ) : (
        <Box sx={{ p: 1.5, textAlign: 'center', bgcolor: '#f5f5f5' }}>
          <Typography variant="caption" color="text.secondary">
            Cuộc trò chuyện này đã đóng.
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        bgcolor: '#fff',
      }}
    >
      {renderHeader()}
      {showConversationList ? renderConversationList() : renderChatView()}
    </Box>
  );
};

export default ChatWindow;
