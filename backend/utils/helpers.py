import uuid
from datetime import datetime
import re


def generate_uuid() -> str:
    """Generate a UUID string"""
    return str(uuid.uuid4())


def utc_now() -> str:
    """Get current UTC timestamp in ISO format"""
    return datetime.utcnow().isoformat() + "Z"


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_phone(phone: str) -> bool:
    """Validate phone number (E.164 format)"""
    pattern = r'^\+[1-9]\d{1,14}$'
    return re.match(pattern, phone) is not None


def normalize_email(email: str) -> str:
    """Normalize email to lowercase"""
    return email.lower().strip()


def generate_referral_code(name: str, suffix: str = "") -> str:
    """Generate a referral code from name"""
    # Remove special characters and take first 6 letters
    clean_name = re.sub(r'[^a-zA-Z0-9]', '', name).upper()[:6]
    if suffix:
        return f"{clean_name}{suffix}"
    return f"{clean_name}{str(uuid.uuid4())[:3].upper()}"


def generate_order_number() -> str:
    """Generate unique order number"""
    now = datetime.utcnow()
    return f"ORD-{now.strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"


def generate_ticket_number() -> str:
    """Generate unique ticket number"""
    now = datetime.utcnow()
    return f"TICKET-{now.strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text
