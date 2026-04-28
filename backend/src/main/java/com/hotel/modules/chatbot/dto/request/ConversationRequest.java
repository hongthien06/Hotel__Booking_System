package com.hotel.modules.chatbot.dto.request;

import com.hotel.modules.chatbot.entity.enums.ConversationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConversationRequest {

    private Long userId;

    @NotBlank
    @Size(max=100)
    private String sessionId;

    @Size(max=255)
    private String title;

    private ConversationStatus status;
}