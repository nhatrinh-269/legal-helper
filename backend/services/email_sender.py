import smtplib
from email.message import EmailMessage
from backend.core.config import settings

def send_email(to_email: str, subject: str, body: str):
    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = "noreply@legalhelper.ai"
        msg["To"] = to_email
        msg.set_content(body)

        # Đây là demo gửi email bằng localhost:1025 (maildev hoặc debug SMTP)
        with smtplib.SMTP("localhost", 1025) as server:
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        return False
