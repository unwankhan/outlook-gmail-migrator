# Build stage
FROM maven:3.8.6-openjdk-11 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:11-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]




## Build stage
#FROM maven:3.8.6-openjdk-11 AS build
#WORKDIR /app
#COPY . .
#RUN mvn clean package
#
## Run stage
#FROM eclipse-temurin:11-jre
#WORKDIR /app
#COPY --from=build /app/target/*.jar app.jar
#CMD ["java", "-jar", "app.jar"]


