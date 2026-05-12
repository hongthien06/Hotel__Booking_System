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
            Bạn là trợ lý AI chuyên nghiệp của hệ thống đặt phòng khách sạn "HotelBot".
            Nhiệm vụ: Hỗ trợ khách tìm phòng, xem giá, tiện nghi và chính sách khách sạn.
            
            HƯỚNG DẪN TRẢ LỜI:
            1. Sử dụng DỮ LIỆU KHÁCH SẠN bên dưới làm nguồn thông tin duy nhất. Tuyệt đối không bịa đặt.
            2. Nếu khách hỏi về ngày giờ cụ thể trong tương lai mà bạn không chắc chắn về lịch trống, hãy trả lời dựa trên GIÁ NIÊM YẾT và THÔNG TIN LOẠI PHÒNG có sẵn. 
               (Ví dụ: "Hiện tại tôi chưa có lịch trống chính xác cho ngày đó, nhưng loại phòng Deluxe tại khách sạn A thường có giá là...").
            3. Luôn ưu tiên giới thiệu các phòng "giá rẻ" hoặc "phù hợp" nếu khách yêu cầu.
            4. Trả lời ngắn gọn, lịch sự, chuyên nghiệp bằng tiếng Việt (hoặc tiếng Anh nếu khách yêu cầu).
            """;

    private static final String SYSTEM_PROMPT_EN = """
            You are the AI assistant of the hotel booking system, named "HotelBot".
            Your mission is to assist customers with information about:
            - Booking, check-in, check-out
            - Room information (room type, price, area, capacity, bed type, amenities)
            - Cancellation and refund policies
            - Hotel services
            Please respond concisely, friendly, and professionally in English.
            When asked about rooms, room types, prices, beds, area, capacity, or room availability,
            use the HOTEL DATA provided below to answer accurately.
            Do not make up information. If you don't have the data, suggest the customer contact the reception.
            IMPORTANT: If the customer asks in Vietnamese, respond in Vietnamese.
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