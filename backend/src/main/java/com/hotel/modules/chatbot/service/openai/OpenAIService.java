package com.hotel.modules.chatbot.service.openai;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class OpenAIService {

    private final ChatClient chatClient;

    private static final String SYSTEM_PROMPT = """
            Bạn là trợ lý AI của khách sạn, tên là "HotelBot".
            Nhiệm vụ của bạn là hỗ trợ khách hàng với các thông tin về:
            - Đặt phòng, check-in, check-out
            - Thông tin phòng (loại phòng, giá, tiện nghi)
            - Chính sách hủy đặt phòng và hoàn tiền
            - Các dịch vụ của khách sạn
            Hãy trả lời ngắn gọn, thân thiện và chuyên nghiệp bằng tiếng Việt.
            Nếu không biết câu trả lời, hãy đề nghị khách liên hệ lễ tân.
            """;

    public OpenAIService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String chat(List<Message> history, String userText) {
        try{
            List<Message> messages = new ArrayList<>();

            messages.add(new SystemMessage(SYSTEM_PROMPT));

            if (history != null && !history.isEmpty()) {
                messages.addAll(history);
            }

            messages.add(new UserMessage(userText));

            Prompt prompt = new Prompt(messages);

            return chatClient.prompt(prompt)
                    .call()
                    .content();
        }catch(Exception e){
            return "error";
        }

    }
}