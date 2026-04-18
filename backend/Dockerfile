FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /build

COPY pom.xml .
RUN mvn dependency:go-offline -B -q

COPY src ./src
RUN mvn package -DskipTests -B -q

FROM eclipse-temurin:21-jre-alpine AS runtime

RUN addgroup -S hbms && adduser -S hbms -G hbms

WORKDIR /app

COPY --from=builder --chown=hbms:hbms \
    /build/target/hotel-0.0.1-SNAPSHOT.jar \
    app.jar

RUN mkdir -p /app/logs /app/uploads && \
    chown -R hbms:hbms /app

USER hbms

EXPOSE 8080

ENV JAVA_OPTS="-Xms256m -Xmx512m \
               -XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

HEALTHCHECK --interval=20s --timeout=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/api/v1/actuator/health || exit 1