package com.hotel.modules.chatbot.controller;

import com.hotel.modules.chatbot.dto.request.ChatRequest;
import com.hotel.modules.chatbot.dto.request.ConversationRequest;
import com.hotel.modules.chatbot.dto.response.ChatResponse;
import com.hotel.modules.chatbot.dto.response.ConversationResponse;
import com.hotel.modules.chatbot.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
public class ChatbotController {
    private final ChatbotService chatbotService;
    @PostMapping("/conversations")
    public ResponseEntity<ConversationResponse> createConversation(@RequestBody ConversationRequest request) {
        return ResponseEntity.ok(chatbotService.createConversation(request));
    }

    @GetMapping("/conversations/user/{userId}")
    public ResponseEntity<List<ConversationResponse>> getConversations(@PathVariable Long userId) {
        return ResponseEntity.ok(chatbotService.getConversationsByUser(userId));
    }

    @PostMapping("/send")
    public ResponseEntity<ChatResponse> sendMessage(@RequestBody ChatRequest request) {
        return ResponseEntity.ok(chatbotService.sendMessage(request));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<ChatResponse>> getMessages(@PathVariable Long id) {
        return ResponseEntity.ok(chatbotService.getMessages(id));
    }

    @PutMapping("/conversations/{id}/close")
    public ResponseEntity<ConversationResponse> closeConversation(@PathVariable Long id) {
        return ResponseEntity.ok(chatbotService.closeConversation(id));
    }
}
