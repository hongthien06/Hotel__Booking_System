package com.hotel.modules.chatbot.dto.response;


import com.hotel.modules.chatbot.entity.Conversation;
import com.hotel.modules.chatbot.entity.enums.ConversationStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
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
        res.conversationId = conversation.getConversationId();
        if(conversation.getUser() != null) {
            res.userId = conversation.getUser().getUserId();
        }
        res.sessionId = conversation.getSessionId();
        res.title = conversation.getTitle();
        res.status = conversation.getStatus();
        res.createdAt = conversation.getCreatedAt();
        res.updatedAt = conversation.getUpdatedAt();
        return res;
    }
}
