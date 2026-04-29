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

    private static final String SYSTEM_PROMPT_VI = """
            Bạn là trợ lý AI của hệ thống đặt phòng khách sạn, tên là "HotelBot".
            Nhiệm vụ của bạn là hỗ trợ khách hàng với các thông tin về:
            - Đặt phòng, check-in, check-out
            - Thông tin phòng (loại phòng, giá, tiện nghi)
            - Chính sách hủy đặt phòng và hoàn tiền
            - Các dịch vụ của khách sạn
            Hãy trả lời ngắn gọn, thân thiện và chuyên nghiệp bằng tiếng Việt.
            Tuyệt đối không bịa đặt thông tin. Nếu không có dữ liệu, hãy đề nghị khách liên hệ lễ tân.
            """;

    private static final String SYSTEM_PROMPT_EN = """
            You are the AI assistant of the hotel booking system, named "HotelBot".
            Your mission is to assist customers with information about:
            - Booking, check-in, check-out
            - Room information (room type, price, amenities)
            - Cancellation and refund policies
            - Hotel services
            Please respond concisely, friendly, and professionally in English.
            Do not make up information. If you don't have the data, suggest the customer contact the reception.
            """;

    public GeminiService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String chat(List<Message> history, String userText, String hotelContext, String lang) {
        try {
            List<Message> messages = new ArrayList<>();

            String dynamicSystemPrompt = "en".equalsIgnoreCase(lang) ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_VI;
            if (hotelContext != null && !hotelContext.isBlank()) {
                String contextHeader = "en".equalsIgnoreCase(lang) ? 
                    "\n\nCURRENT HOTEL DATA FOR CONSULTATION:\n" : 
                    "\n\nDỮ LIỆU KHÁCH SẠN HIỆN TẠI ĐỂ BẠN TƯ VẤN:\n";
                dynamicSystemPrompt += contextHeader + hotelContext;
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
            return "en".equalsIgnoreCase(lang) ? 
                "Sorry, the HotelBot system is currently overloaded or disconnected. Please try again in a few seconds." : 
                "Xin lỗi, hệ thống HotelBot đang quá tải hoặc mất kết nối. Vui lòng thử lại sau vài giây.";
        }
    }
}