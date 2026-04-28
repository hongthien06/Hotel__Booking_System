package com.hotel.modules.chatbot.dto.request;

import com.hotel.modules.chatbot.entity.enums.MessageRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {

    @NotNull
    private Long conversationId;

    @NotNull
    private MessageRole role;

    @NotBlank
    @Size(max=10000)
    private String content;

    private Long hotelId;
    private Long roomId;
    private Long bookingId;
}