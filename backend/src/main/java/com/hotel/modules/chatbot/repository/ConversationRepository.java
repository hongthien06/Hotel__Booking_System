package com.hotel.modules.chatbot.repository;

import com.hotel.modules.chatbot.entity.Conversation;
import com.hotel.modules.chatbot.entity.enums.ConversationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation,Long> {
    List<Conversation> findByUser_UserIdOrderByUpdatedAtDesc(Long userId);

    Optional<Conversation> findBySessionIdAndStatus(String sessionId, ConversationStatus status);
}
