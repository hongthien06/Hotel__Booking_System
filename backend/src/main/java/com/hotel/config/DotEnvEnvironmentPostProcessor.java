package com.hotel.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Tự động load file .env vào Spring Environment trước khi context khởi động.
 * - Thử tìm .env ở CWD trước, rồi thử thư mục cha (../) để hỗ trợ chạy từ backend/.
 * - Chỉ load nếu file .env tồn tại (bỏ qua nếu không có → an toàn cho Docker/CI).
 * - Chèn vào trước "systemProperties" → Spring resolve được ${} từ .env.
 * - Biến hệ thống thật (systemProperties, systemEnvironment) vẫn ưu tiên cao hơn.
 */
public class DotEnvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String PROPERTY_SOURCE_NAME = "dotenvProperties";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        // Tìm file .env ở thư mục hiện tại trước, sau đó thử một cấp trên (../),
        // vì khi chạy `mvnw spring-boot:run` CWD là backend/, còn .env nằm ở thư mục gốc
        Dotenv dotenv = loadDotenv(".")
                .orElseGet(() -> loadDotenv("..").orElse(null));

        if (dotenv == null) {
            System.out.println("[DotEnv] No .env file found, skipping.");
            return;
        }

        Map<String, Object> properties = new HashMap<>();
        for (var entry : dotenv.entries()) {
            properties.put(entry.getKey(), entry.getValue());
        }

        if (properties.isEmpty()) {
            return;
        }

        MutablePropertySources propertySources = environment.getPropertySources();
        MapPropertySource dotenvSource = new MapPropertySource(PROPERTY_SOURCE_NAME, properties);

        // Chèn sau "systemEnvironment" (biến môi trường OS) nhưng trước phần còn lại.
        // Nếu không có "systemEnvironment" thì thêm vào đầu.
        // → Biến OS/JVM thật > dotenv > application.yml defaults
        if (propertySources.contains("systemEnvironment")) {
            propertySources.addAfter("systemEnvironment", dotenvSource);
        } else if (propertySources.contains("systemProperties")) {
            propertySources.addAfter("systemProperties", dotenvSource);
        } else {
            propertySources.addFirst(dotenvSource);
        }

        System.out.println("[DotEnv] Loaded " + properties.size() + " variables from .env file");
    }

    private Optional<Dotenv> loadDotenv(String directory) {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory(directory)
                    .ignoreIfMissing()
                    .ignoreIfMalformed()
                    .load();
            boolean hasEntries = dotenv.entries().iterator().hasNext();
            return hasEntries ? Optional.of(dotenv) : Optional.empty();
        } catch (DotenvException e) {
            return Optional.empty();
        }
    }
}
