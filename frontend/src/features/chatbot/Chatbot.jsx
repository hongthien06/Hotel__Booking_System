import React, { useState } from 'react';
import { Box, Fab, Badge, Zoom, Slide } from '@mui/material';
import { SmartToy, Close } from '@mui/icons-material';
import ChatWindow from './components/ChatWindow';
import useChatbot from './hooks/useChatbot';

const PC = '#c0496e';

const Chatbot = () => {
  const [open, setOpen] = useState(false);

  const {
    conversations,
    activeConvId,
    messages,
    loading,
    sending,
    error,
    selectConversation,
    createConversation,
    sendMessage,
    closeConversation,
    setError,
  } = useChatbot();

  const handleSelectConversation = async (convId) => {
    if (convId === null) {
      // Go back to list — clear active
      selectConversation(null);
      return;
    }
    await selectConversation(convId);
  };

  const handleCreateConversation = async (title) => {
    const conv = await createConversation(title);
    return conv;
  };

  const handleSendMessage = async (content) => {
    await sendMessage(content);
  };

  return (
    <>
      {/* Chat Window */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 24,
            width: 380,
            height: 520,
            zIndex: 1300,
            borderRadius: 3,
            overflow: 'hidden',
            // Responsive
            '@media (max-width: 480px)': {
              width: 'calc(100vw - 16px)',
              height: 'calc(100vh - 120px)',
              right: 8,
              bottom: 80,
            },
          }}
        >
          <ChatWindow
            conversations={conversations}
            activeConvId={activeConvId}
            messages={messages}
            loading={loading}
            sending={sending}
            error={error}
            onSelectConversation={handleSelectConversation}
            onCreateConversation={handleCreateConversation}
            onSendMessage={handleSendMessage}
            onCloseConversation={closeConversation}
            onDismissError={() => setError(null)}
            onClose={() => setOpen(false)}
          />
        </Box>
      </Slide>

      {/* Floating Action Button */}
      <Zoom in>
        <Fab
          onClick={() => setOpen((prev) => !prev)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1300,
            width: 56,
            height: 56,
            background: open
              ? '#555'
              : `linear-gradient(135deg, ${PC} 0%, #e8527a 100%)`,
            color: '#fff',
            boxShadow: '0 4px 20px rgba(192, 73, 110, 0.4)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: open
                ? '#444'
                : `linear-gradient(135deg, #a0365a 0%, ${PC} 100%)`,
              transform: 'scale(1.05)',
              boxShadow: '0 6px 24px rgba(192, 73, 110, 0.5)',
            },
          }}
        >
          {open ? (
            <Close sx={{ fontSize: 24 }} />
          ) : (
            <Badge
              color="error"
              variant="dot"
              invisible
            >
              <SmartToy sx={{ fontSize: 26 }} />
            </Badge>
          )}
        </Fab>
      </Zoom>
    </>
  );
};

export default Chatbot;