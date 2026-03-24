import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')


class Settings:
    """Application settings"""
    
    # Database
    MONGO_URL: str = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    DB_NAME: str = os.environ.get('DB_NAME', 'terra_db')
    
    # Security
    JWT_SECRET_KEY: str = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # CORS
    CORS_ORIGINS: str = os.environ.get('CORS_ORIGINS', '*')
    
    # App
    APP_NAME: str = "Terra Digital Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    # File Storage
    UPLOAD_DIR: str = os.environ.get('UPLOAD_DIR', '/tmp/uploads')
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Pricing Configuration (can be overridden in DB)
    PLATFORM_FEE_RATE: float = 0.05  # 5%
    TAX_RATE: float = 0.08  # 8% VAT
    LOGISTICS_BASE_FEE: float = 50.00
    LOGISTICS_PER_KM_FEE: float = 10.00
    
    # Rewards Configuration
    REWARD_PER_ORDER_RATE: float = 0.01  # 1%
    REFERRAL_BONUS_FIRST_ORDER: float = 100.00
    
    # MLM Configuration
    MLM_ENABLED: bool = os.environ.get('MLM_ENABLED', 'True').lower() == 'true'
    PAIRING_BONUS_RATE: float = 0.10  # 10%
    PAIRING_BONUS_CAP_DAILY: float = 10000.00


settings = Settings()
