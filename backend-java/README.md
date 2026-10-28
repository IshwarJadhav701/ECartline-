# ECartline Spring Boot Java Backend

Production-grade **Java 17 + Spring Boot 3** REST API backend for the ECartline e-commerce platform, replacing the legacy Node.js/Express.js backend.

---

## 1. Technology Stack
* **Java**: OpenJDK 17 LTS
* **Framework**: Spring Boot 3.2.5
* **Web**: Spring Web (Tomcat embedded on port 3000)
* **ORM & Persistence**: Spring Data JPA / Hibernate (DDL-auto: none, preserving existing tables & data)
* **Security & Auth**: Spring Security 6 with BCrypt password hashing & JJWT (HMAC-SHA256)
* **Database**: MySQL 8.0 / MariaDB (schema in `ecartline.sql`)
* **Build Tool**: Apache Maven 3.9+

---

## 2. Directory Structure
```
backend-java/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/ecartline/
    │   │   ├── ECartlineApplication.java
    │   │   ├── config/
    │   │   │   ├── SecurityConfig.java
    │   │   │   ├── JwtTokenProvider.java
    │   │   │   ├── JwtAuthenticationFilter.java
    │   │   │   ├── UserPrincipal.java
    │   │   │   ├── CorsConfig.java
    │   │   │   └── WebMvcConfig.java
    │   │   ├── controller/
    │   │   │   ├── AuthController.java
    │   │   │   ├── ProductController.java
    │   │   │   ├── CartController.java
    │   │   │   ├── OrderController.java
    │   │   │   ├── AddressController.java
    │   │   │   ├── WishlistController.java
    │   │   │   ├── ReviewController.java
    │   │   │   ├── ContactController.java
    │   │   │   └── HealthController.java
    │   │   ├── dto/
    │   │   │   ├── ApiResponse.java
    │   │   │   ├── AuthDtos.java
    │   │   │   ├── ProductDto.java
    │   │   │   ├── CartDtos.java
    │   │   │   ├── OrderDtos.java
    │   │   │   ├── AddressDto.java
    │   │   │   ├── ReviewDtos.java
    │   │   │   └── ContactDto.java
    │   │   ├── entity/
    │   │   │   ├── User.java
    │   │   │   ├── Product.java
    │   │   │   ├── CartItem.java
    │   │   │   ├── Order.java
    │   │   │   ├── OrderItem.java
    │   │   │   ├── Address.java
    │   │   │   ├── WishlistItem.java
    │   │   │   ├── Review.java
    │   │   │   └── ContactMessage.java
    │   │   ├── exception/
    │   │   │   ├── ApiException.java
    │   │   │   └── GlobalExceptionHandler.java
    │   │   ├── repository/
    │   │   │   ├── UserRepository.java
    │   │   │   ├── ProductRepository.java
    │   │   │   ├── CartItemRepository.java
    │   │   │   ├── OrderRepository.java
    │   │   │   ├── OrderItemRepository.java
    │   │   │   ├── AddressRepository.java
    │   │   │   ├── WishlistItemRepository.java
    │   │   │   ├── ReviewRepository.java
    │   │   │   └── ContactMessageRepository.java
    │   │   └── service/
    │   │       ├── AuthService.java
    │   │       ├── ProductService.java
    │   │       ├── CartService.java
    │   │       ├── OrderService.java
    │   │       ├── AddressService.java
    │   │       ├── WishlistService.java
    │   │       ├── ReviewService.java
    │   │       └── ContactService.java
    │   └── resources/
    │       └── application.properties
```

---

## 3. Configuration & Environment Variables
Configured in `application.properties` with fallback defaults and environment variable overrides:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `SERVER_PORT` / `server.port` | `3000` | Port for the REST API server |
| `DB_HOST` | `localhost` | MySQL hostname |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `ecartline` | Database schema name |
| `DB_USER` | `root` | Database username |
| `DB_PASSWORD` | *(empty)* | Database password |
| `JWT_SECRET` | *(HMAC key)* | Secret string for signing and verifying JWTs |
| `CORS_ORIGIN` | `http://localhost:5173,http://localhost:3000` | Allowed origins |

---

## 4. How to Run & Build

### Running the Backend:
```bash
# Using root batch script
run-backend.bat

# Or using Maven directly
cd backend-java
mvn spring-boot:run

# Or running the packaged JAR
java -jar target/ecartline-backend-1.0.0.jar
```

### Packaging for Production:
```bash
# Using root batch script
build-backend.bat

# Or using Maven
cd backend-java
mvn clean package -DskipTests
```
The output executable JAR is generated at `backend-java/target/ecartline-backend-1.0.0.jar`.
