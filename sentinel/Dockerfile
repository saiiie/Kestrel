FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY sentinel/pom.xml ./
COPY sentinel/src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/target/sentinel-0.0.1-SNAPSHOT.jar app.jar
USER 10001:10001
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70", "-jar", "app.jar"]
