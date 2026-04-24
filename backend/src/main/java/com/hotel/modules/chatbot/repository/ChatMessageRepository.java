package com.hotel.modules.chatbot.repository;

import com.hotel.modules.chatbot.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage,Long> {
    @Query("SELECT m FROM ChatMessage m WHERE m.conversation.conversationId = :convId ORDER BY m.createdAt ASC")
    List<ChatMessage> findByConversationId(@Param("convId") Long conversationId);
}
