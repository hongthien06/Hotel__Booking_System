import { useState, useCallback, useRef, useEffect } from 'react';
import {
  createConversationApi,
  getConversationsByUserApi,
  sendMessageApi,
  getMessagesApi,
  closeConversationApi,
} from '~/shared/api/chatbotApi';
import { useAuth } from '~/shared/hooks/useAuth';

const SESSION_KEY = 'chatbot_session_id';
const CONV_KEY = 'chatbot_conversation_id';

/** Generate a simple session ID for guest users */
const generateSessionId = () =>
  'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);

const getOrCreateSessionId = () => {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
};

export const useChatbot = () => {
  const { user, isAuthenticated } = useAuth();

  // Conversations
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);

  // Messages for the active conversation
  const [messages, setMessages] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Ref to track whether initial load happened
  const initialised = useRef(false);

  /* ─── Load conversations on mount ─────────────────── */
  const loadConversations = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    try {
      const userId =
        user.userId ?? user.id ?? user.user_id;
      if (!userId) return;
      const data = await getConversationsByUserApi(userId);
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      // silent — guest users won't have conversations
    }
  }, [isAuthenticated, user]);

  /* ─── Load messages for a conversation ────────────── */
  const loadMessages = useCallback(async (convId) => {
    if (!convId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMessagesApi(convId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load messages', err);
      setError('Không thể tải tin nhắn.');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ─── Select a conversation ───────────────────────── */
  const selectConversation = useCallback(
    async (convId) => {
      setActiveConvId(convId);
      sessionStorage.setItem(CONV_KEY, String(convId));
      await loadMessages(convId);
    },
    [loadMessages],
  );

  /* ─── Create a new conversation ───────────────────── */
  const createConversation = useCallback(
    async (title) => {
      setError(null);
      try {
        const sessionId = getOrCreateSessionId();
        const userId =
          isAuthenticated && user
            ? user.userId ?? user.id ?? user.user_id ?? null
            : null;

        const data = await createConversationApi({
          userId,
          sessionId,
          title: title || 'Cuộc trò chuyện mới',
        });

        setConversations((prev) => [data, ...prev]);
        setActiveConvId(data.conversationId);
        sessionStorage.setItem(CONV_KEY, String(data.conversationId));
        setMessages([]);
        return data;
      } catch (err) {
        console.error('Failed to create conversation', err);
        setError('Không thể tạo cuộc trò chuyện.');
        return null;
      }
    },
    [isAuthenticated, user],
  );

  /* ─── Send a message ──────────────────────────────── */
  const sendMessage = useCallback(
    async (content, extra = {}) => {
      if (!content.trim()) return null;

      let convId = activeConvId;

      // Auto-create conversation if none active
      if (!convId) {
        const conv = await createConversation();
        if (!conv) return null;
        convId = conv.conversationId;
      }

      // Optimistic user message
      const optimisticId = 'temp_' + Date.now();
      const userMsg = {
        messageId: optimisticId,
        conversationId: convId,
        role: 'USER',
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      setSending(true);
      setError(null);

      try {
        const response = await sendMessageApi({
          conversationId: convId,
          role: 'USER',
          content,
          lang: extra.lang || 'vi',
          hotelId: extra.hotelId || null,
          roomId: extra.roomId || null,
          bookingId: extra.bookingId || null,
        });

        // Replace optimistic msg & add assistant reply
        setMessages((prev) => {
          const cleaned = prev.filter((m) => m.messageId !== optimisticId);
          // Add the real user message (its ID will be different from response)
          const realUserMsg = {
            ...userMsg,
            messageId: 'sent_' + Date.now(),
          };
          return [...cleaned, realUserMsg, response];
        });

        return response;
      } catch (err) {
        console.error('Failed to send message', err);
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Gửi tin nhắn thất bại. Vui lòng thử lại.';
        setError(msg);
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.messageId !== optimisticId));
        return null;
      } finally {
        setSending(false);
      }
    },
    [activeConvId, createConversation],
  );

  /* ─── Close a conversation ────────────────────────── */
  const closeConversation = useCallback(
    async (convId) => {
      try {
        await closeConversationApi(convId || activeConvId);
        setConversations((prev) =>
          prev.map((c) =>
            c.conversationId === (convId || activeConvId)
              ? { ...c, status: 'CLOSED' }
              : c,
          ),
        );
        if ((convId || activeConvId) === activeConvId) {
          setActiveConvId(null);
          setMessages([]);
          sessionStorage.removeItem(CONV_KEY);
        }
      } catch (err) {
        console.error('Failed to close conversation', err);
      }
    },
    [activeConvId],
  );

  /* ─── Initialise on mount ─────────────────────────── */
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    (async () => {
      await loadConversations();

      // Restore last active conversation
      const savedConvId = sessionStorage.getItem(CONV_KEY);
      if (savedConvId) {
        setActiveConvId(Number(savedConvId));
        await loadMessages(Number(savedConvId));
      }
    })();
  }, [loadConversations, loadMessages]);

  return {
    // Data
    conversations,
    activeConvId,
    messages,

    // UI state
    loading,
    sending,
    error,

    // Actions
    loadConversations,
    selectConversation,
    createConversation,
    sendMessage,
    closeConversation,
    setError,
  };
};

export default useChatbot;
