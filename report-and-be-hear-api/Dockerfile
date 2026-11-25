# Etapa 1: compilar con Maven (usa el wrapper del repo)
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

# Etapa 2: imagen liviana que solo corre el .jar
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8084
# Render da el puerto en la variable PORT; en local usa 8084
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8084}"]
