package com.hotel.modules.chatbot.dto.response;

import com.hotel.modules.chatbot.entity.ChatMessage;
import com.hotel.modules.chatbot.entity.enums.MessageRole;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private Long messageId;
    private Long conversationId;
    private MessageRole role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String content;

    private Long hotelId;
    private Long roomId;
    private Long bookingId;

    public static ChatResponse from(ChatMessage chatMessage) {
        if(chatMessage == null) return null;

        ChatResponse res = new ChatResponse();
        res.setMessageId(chatMessage.getMessageId());

        if(chatMessage.getConversation() != null){
            res.setConversationId(chatMessage.getConversation().getConversationId());
        }

        res.setRole(chatMessage.getRole());
        res.setCreatedAt(chatMessage.getCreatedAt());
        res.setUpdatedAt(chatMessage.getCreatedAt());
        res.setContent(chatMessage.getContent());

        if(chatMessage.getHotel() != null){
            res.setHotelId(chatMessage.getHotel().getHotelId());
        }
        if(chatMessage.getRoom() != null){
            res.setRoomId(chatMessage.getRoom().getRoomId());
        }
        if(chatMessage.getBooking() != null){
            res.setBookingId(chatMessage.getBooking().getBookingId());
        }

        return res;
    }
}