"""
Google OAuth Authentication Routes
REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import os
import httpx
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")

class GoogleTokenRequest(BaseModel):
    credential: str  # The ID token from Google

class GoogleUserResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: str | None = None
    email_verified: bool = False


@router.post("/auth/google/verify")
async def verify_google_token(request: GoogleTokenRequest):
    """
    Verify Google ID token and return user info.
    This endpoint receives the credential (ID token) from the frontend Google Sign-In
    and verifies it with Google's tokeninfo endpoint.
    """
    try:
        # Verify the token with Google
        async with httpx.AsyncClient() as client:
            # Use Google's tokeninfo endpoint to verify the ID token
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={request.credential}"
            )
            
            if response.status_code != 200:
                logger.error(f"Google token verification failed: {response.text}")
                raise HTTPException(status_code=401, detail="Invalid Google token")
            
            token_info = response.json()
            
            # Verify the token was issued for our app
            if token_info.get("aud") != GOOGLE_CLIENT_ID:
                logger.error(f"Token audience mismatch. Expected: {GOOGLE_CLIENT_ID}, Got: {token_info.get('aud')}")
                raise HTTPException(status_code=401, detail="Token was not issued for this application")
            
            # Extract user info from verified token
            user_data = GoogleUserResponse(
                id=token_info.get("sub", ""),
                email=token_info.get("email", ""),
                name=token_info.get("name", token_info.get("email", "").split("@")[0]),
                picture=token_info.get("picture"),
                email_verified=token_info.get("email_verified", "false").lower() == "true"
            )
            
            logger.info(f"Google user verified: {user_data.email}")
            
            return {
                "success": True,
                "user": user_data.model_dump(),
                "message": "Google authentication successful"
            }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google auth error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


@router.get("/auth/google/client-id")
async def get_google_client_id():
    """
    Return the Google Client ID for frontend use.
    This allows the frontend to get the client ID without hardcoding it.
    """
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    return {"client_id": GOOGLE_CLIENT_ID}
