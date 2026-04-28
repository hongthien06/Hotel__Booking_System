package com.hotel.modules.chatbot.dto.response;

import com.hotel.modules.chatbot.entity.Conversation;
import com.hotel.modules.chatbot.entity.enums.ConversationStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponse {
    private Long conversationId;
    private Long userId;
    private String sessionId;
    private String title;
    private ConversationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ConversationResponse from(Conversation conversation) {
        if(conversation == null) return null;

        ConversationResponse res = new ConversationResponse();
        res.setConversationId(conversation.getConversationId());

        if(conversation.getUser() != null) {
            res.setUserId(conversation.getUser().getUserId());
        }

        res.setSessionId(conversation.getSessionId());
        res.setTitle(conversation.getTitle());
        res.setStatus(conversation.getStatus());
        res.setCreatedAt(conversation.getCreatedAt());
        res.setUpdatedAt(conversation.getUpdatedAt());

        return res;
    }
}