# 🏛️ Legal Helper

**Legal Helper** là nền tảng trợ lý pháp lý AI, giúp người dùng dễ dàng tra cứu và tương tác với các văn bản luật Việt Nam thông qua chatbot kết hợp GraphRAG và LLMs.

## 🧩 Thành phần hệ thống

- **Backend & Frontend**: FastAPI + Web UI (người dùng và admin).
- **Database**: MySQL (script khởi tạo nằm trong repo `legal-helper-db`).
- **RAG Chatbot**: Dịch vụ hỏi đáp văn bản luật, sử dụng Neo4j + Google Gemini (repo `vietnamese-law-bot`).

---

## 📂 Các kho GitHub liên quan

| Thành phần              | Repo                                      |
|-------------------------|--------------------------------------------|
| Main App (API, UI, Docker Compose) | https://github.com/nhatrinh-269/legal-helper |
| Database Init (MySQL Scripts)      | https://github.com/nhatrinh-269/legal-helper-db |
| Vietnamese Law Bot (RAG Chat Service) | https://github.com/Ming-doan/vietnamese-law-bot |

---

## 🚀 Hướng dẫn cài đặt & khởi chạy

### 1️⃣ Yêu cầu hệ thống

- **Docker** & **Docker Compose**
- **Git**

### 2️⃣ Clone toàn bộ project về máy

```bash
mkdir legalhelper-project && cd legalhelper-project
git clone https://github.com/nhatrinh-269/legal-helper.git
git clone https://github.com/nhatrinh-269/legal-helper-db.git
git clone https://github.com/Ming-doan/vietnamese-law-bot.git
```

### 3️⃣ Tạo file `.env`

Chuyển vào thư mục `legal-helper/` và tạo file `.env`:

```dotenv
# Database (MySQL)
DB_HOST=legalhelperdb
DB_PORT=3306
DB_NAME=legalhelperdb
DB_USER=admin
DB_PASS=legalhelperdb

# JWT
SECRET_KEY=my_super_secret_jwt_key
JWT_ALGORITHM=HS256

# Môi trường
ENVIRONMENT=development

# RAG Chatbot URL
LAW_RAG_CHAT_URL=http://lh-api:8001/chat

# Neo4j (Vietnamese Law Bot)
NEO4J_HOST=lh-neo4j
NEO4J_PORT=7687

# Google Gemini API Key
GOOGLE_GENAI_API_KEY=GOOGLE_GENAI_API_KEY
```

> ⚠️ **Lưu ý**: Thay `GOOGLE_GENAI_API_KEY` bằng API key thật của bạn.

---

### 4️⃣ Khởi động hệ thống bằng Docker Compose

```bash
cd legal-helper
docker-compose up -d --build
```

- `-d`: Chạy ở chế độ nền (detached).
- `--build`: Build lại image (nên dùng khi có thay đổi code).

---

### 5️⃣ Truy cập ứng dụng

- Web UI (người dùng / admin): [http://localhost](http://localhost)
- API Docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠️ Một số lệnh Docker Compose hữu ích

| Tác vụ               | Lệnh                                   |
|----------------------|----------------------------------------|
| Xem logs realtime    | `docker-compose logs -f`              |
| Dừng & xóa containers| `docker-compose down`                 |
| Chạy lại & rebuild   | `docker-compose up -d --build`        |

---

## ❤️ Liên hệ & hỗ trợ

Nếu gặp vấn đề hoặc có đề xuất, vui lòng mở Issue trên GitHub hoặc liên hệ trực tiếp tác giả.

---

> Made with 💜 by [Nhatrinh-269](https://github.com/nhatrinh-269) and team.