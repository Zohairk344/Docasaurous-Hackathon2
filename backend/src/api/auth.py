from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select
from requests_oauthlib import OAuth2Session
import os
from dotenv import load_dotenv

from ..services.db_service import User, get_session

load_dotenv()

# ============================================================
#  Better Auth Configuration
# ============================================================
# These should be in your .env file
CLIENT_ID = os.getenv("BETTER_AUTH_CLIENT_ID")
CLIENT_SECRET = os.getenv("BETTER_AUTH_CLIENT_SECRET")

# WARNING: The user has specified that the Better Auth instance and the
# Docusaurus frontend are both running on http://localhost:3000.
# This will cause a port conflict if both are run simultaneously without a reverse proxy.
# Using the user-provided URL for the Better Auth instance.
BETTER_AUTH_BASE_URL = os.getenv("BETTER_AUTH_URL", "http://localhost:3000")
AUTHORIZATION_BASE_URL = f"{BETTER_AUTH_BASE_URL}/oauth2/authorize"
TOKEN_URL = f"{BETTER_AUTH_BASE_URL}/oauth2/token"
USERINFO_URL = f"{BETTER_AUTH_BASE_URL}/oauth2/userinfo"


# This must match the redirect_uri configured in your Better Auth app
REDIRECT_URI = "https://renewed-courtesy-production.up.railway.app/api/auth/callback"


router = APIRouter()

@router.get("/auth/login")
def login():
    """
    Redirects the user to the Better Auth provider for authentication.
    """
    if not CLIENT_ID:
        raise HTTPException(status_code=500, detail="BETTER_AUTH_CLIENT_ID is not configured.")

    better_auth = OAuth2Session(CLIENT_ID, redirect_uri=REDIRECT_URI, scope=["openid", "email", "profile"])
    authorization_url, state = better_auth.authorization_url(AUTHORIZATION_BASE_URL)
    
    return RedirectResponse(authorization_url)


@router.get("/auth/callback")
def auth_callback(request: Request, session: Session = Depends(get_session)):
    """
    Handles the callback from the Better Auth provider after authentication.
    """
    if not CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="BETTER_AUTH_CLIENT_SECRET is not configured.")

    # Using the full URL from the request to handle the callback
    better_auth = OAuth2Session(CLIENT_ID, redirect_uri=REDIRECT_URI)
    
    try:
        token = better_auth.fetch_token(
            TOKEN_URL,
            client_secret=CLIENT_SECRET,
            authorization_response=str(request.url)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch token: {e}")

    # Fetch user info from Better Auth
    user_info = better_auth.get(USERINFO_URL).json()
    user_email = user_info.get("email")

    if not user_email:
        raise HTTPException(status_code=400, detail="Email not found in user info from provider.")

    # Check if user exists in our DB, if not, create them
    db_user = session.exec(select(User).where(User.email == user_email)).first()
    if not db_user:
        db_user = User(
            email=user_email,
            hashed_password=""  # Not used with OAuth
        )
        session.add(db_user)
        session.commit()
        session.refresh(db_user)

    # Here you would typically create a session for the user in your app,
    # e.g., by creating a JWT and returning it or by setting a session cookie.
    # For now, we'll just return a success message and redirect.
    
    # Redirect to the frontend with a token (in a real app)
    # For now, redirect to the homepage.
    return RedirectResponse(url="/?login_success=true")


@router.post("/auth/signup")
def signup_disabled():
    raise HTTPException(
        status_code=403, 
        detail="Password-based signup is disabled. Please use the 'Login' button to sign up with Better Auth."
    )

@router.post("/auth/login")
def login_disabled():
    raise HTTPException(
        status_code=403, 
        detail="Password-based login is disabled. Please use the 'Login' button to authenticate with Better Auth."
    )
