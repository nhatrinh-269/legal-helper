import logging
import sys

# Cấu hình logger root
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Lấy logger cho toàn app
logger = logging.getLogger("legal-helper")
