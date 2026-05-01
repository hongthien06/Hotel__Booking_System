package com.hotel.modules.chatbot.service;

import com.hotel.modules.auth.entity.User;
import com.hotel.modules.auth.repository.UserRepository;
import com.hotel.modules.booking.entity.Booking;
import com.hotel.modules.booking.repository.BookingRepository;
import com.hotel.modules.chatbot.dto.request.ChatRequest;
import com.hotel.modules.chatbot.dto.request.ConversationRequest;
import com.hotel.modules.chatbot.dto.response.ChatResponse;
import com.hotel.modules.chatbot.dto.response.ConversationResponse;
import com.hotel.modules.chatbot.entity.ChatMessage;
import com.hotel.modules.chatbot.entity.Conversation;
import com.hotel.modules.chatbot.entity.enums.ConversationStatus;
import com.hotel.modules.chatbot.entity.enums.MessageRole;
import com.hotel.modules.chatbot.repository.ChatMessageRepository;
import com.hotel.modules.chatbot.repository.ConversationRepository;
import com.hotel.modules.chatbot.service.gemini.GeminiService;
import com.hotel.modules.hotel.entity.Hotel;
import com.hotel.modules.hotel.repository.HotelRepository;
import com.hotel.modules.rooms.entity.Room;
import com.hotel.modules.rooms.repository.RoomRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final GeminiService geminiService;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;

    @Transactional
    public ConversationResponse createConversation(ConversationRequest request) {
        Conversation conv = new Conversation();

        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));
            conv.setUser(user);
        }

        conv.setSessionId(request.getSessionId());
        conv.setTitle(request.getTitle() != null ? request.getTitle() : "Cuộc trò chuyện mới");
        conv.setStatus(ConversationStatus.ACTIVE);

        Conversation save = conversationRepository.save(conv);
        return ConversationResponse.from(save);
    }

    public List<ConversationResponse> getConversationsByUser(Long userId) {
        return conversationRepository.findByUser_UserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(ConversationResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public ConversationResponse closeConversation(Long conversationId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found: " + conversationId));
        conv.setStatus(ConversationStatus.CLOSED);
        return ConversationResponse.from(conversationRepository.save(conv));
    }

    @Transactional
    public ChatResponse sendMessage(ChatRequest request) {
        Conversation conv = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found: " + request.getConversationId()));

        if (conv.getStatus() == ConversationStatus.CLOSED) {
            throw new IllegalStateException("Conversation closed");
        }

        List<Message> history = buildHistory(conv.getConversationId());

        ChatMessage userMsg = buildMessage(conv, MessageRole.USER, request);
        chatMessageRepository.save(userMsg);

        String hotelContext = buildHotelContext();
        String aiReply = geminiService.chat(history, request.getContent(), hotelContext, request.getLang());

        ChatMessage assistantMsg = new ChatMessage();
        assistantMsg.setConversation(conv);
        assistantMsg.setRole(MessageRole.ASSISTANT);
        assistantMsg.setContent(aiReply);

        chatMessageRepository.save(assistantMsg);

        return ChatResponse.from(assistantMsg);
    }

    public List<ChatResponse> getMessages(Long conversationId) {
        conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found"));

        return chatMessageRepository.findByConversationId(conversationId)
                .stream()
                .map(ChatResponse::from)
                .collect(Collectors.toList());
    }

    private ChatMessage buildMessage(Conversation conv, MessageRole role, ChatRequest request) {
        ChatMessage msg = new ChatMessage();
        msg.setConversation(conv);
        msg.setRole(role);
        msg.setContent(request.getContent());

        if (request.getHotelId() != null) {
            Hotel hotel = hotelRepository.findById(request.getHotelId()).orElse(null);
            msg.setHotel(hotel);
        }
        if (request.getRoomId() != null) {
            Room room = roomRepository.findById(request.getRoomId()).orElse(null);
            msg.setRoom(room);
        }
        if (request.getBookingId() != null) {
            Booking booking = bookingRepository.findById(request.getBookingId()).orElse(null);
            msg.setBooking(booking);
        }
        return msg;
    }

    private List<Message> buildHistory(Long conversationId) {
        List<ChatMessage> allMessages = chatMessageRepository.findByConversationId(conversationId);
        int maxHistory = 6;
        int startIndex = Math.max(0, allMessages.size() - maxHistory);
        return allMessages.subList(startIndex, allMessages.size())
                .stream()
                .filter(m -> m.getRole() == MessageRole.USER || m.getRole() == MessageRole.ASSISTANT)
                .map(m -> m.getRole() == MessageRole.USER
                        ? (Message) new UserMessage(m.getContent())
                        : new AssistantMessage(m.getContent()))
                .collect(Collectors.toList());
    }

    private String buildHotelContext() {
        List<Hotel> hotels = hotelRepository.findAll();
        if (hotels.isEmpty()) {
            return "";
        }

        StringBuilder context = new StringBuilder();
        for (Hotel h : hotels) {
            context.append("- Khách sạn: ").append(h.getHotelName())
                    .append(" | Mã: ").append(h.getHotelCode())
                    .append(" | Địa chỉ: ").append(h.getAddress())
                    .append(", ").append(h.getDistrict())
                    .append(", ").append(h.getProvince())
                    .append(" | Hạng sao: ").append(h.getStarRating()).append(" sao\n");
        }
        return context.toString();
    }
}