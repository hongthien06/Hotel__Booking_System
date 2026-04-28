package com.hotel.modules.chatbot.service.gemini;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GeminiService {

    private final ChatClient chatClient;

    private static final String SYSTEM_PROMPT = """
            Bạn là trợ lý AI của hệ thống đặt phòng khách sạn, tên là "HotelBot".
            Nhiệm vụ của bạn là hỗ trợ khách hàng với các thông tin về:
            - Đặt phòng, check-in, check-out
            - Thông tin phòng (loại phòng, giá, tiện nghi)
            - Chính sách hủy đặt phòng và hoàn tiền
            - Các dịch vụ của khách sạn
            Hãy trả lời ngắn gọn, thân thiện và chuyên nghiệp bằng tiếng Việt.
            Tuyệt đối không bịa đặt thông tin. Nếu không có dữ liệu, hãy đề nghị khách liên hệ lễ tân.
            """;

    public GeminiService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String chat(List<Message> history, String userText, String hotelContext) {
        try {
            List<Message> messages = new ArrayList<>();

            String dynamicSystemPrompt = SYSTEM_PROMPT;
            if (hotelContext != null && !hotelContext.isBlank()) {
                dynamicSystemPrompt += "\n\nDỮ LIỆU KHÁCH SẠN HIỆN TẠI ĐỂ BẠN TƯ VẤN:\n" + hotelContext;
            }
            messages.add(new SystemMessage(dynamicSystemPrompt));

            if (history != null && !history.isEmpty()) {
                messages.addAll(history);
            }

            messages.add(new UserMessage(userText));

            Prompt prompt = new Prompt(messages);

            return chatClient.prompt(prompt)
                    .call()
                    .content();

        } catch (Exception e) {
            e.printStackTrace();
            return "Xin lỗi, hệ thống HotelBot đang quá tải hoặc mất kết nối. Vui lòng thử lại sau vài giây.";
        }
    }
}