import logging
import secrets
from datetime import datetime, timedelta
from typing import Annotated

import jwt
from fastapi import APIRouter, HTTPException, Response, status, Request, Depends
from pydantic import BaseModel
from pwdlib import PasswordHash
from sqlalchemy import select, delete

from backend.config import config
from backend.db import DbSessionDep
from backend.tables.user import UserTable, UserSessionTable

logger = logging.getLogger(__name__)


auth_router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


class LoginRequest(BaseModel):
    username: str
    password: str


class ChangePasswordRequest(BaseModel):
    new_password: str


class Auth:
    """Authentication service class that handles user authentication, session management, and JWT operations."""

    def __init__(self):
        self.pwd_context = PasswordHash.recommended()

    def authenticate_user(
        self, request: LoginRequest, db: DbSessionDep
    ) -> UserTable | None:
        """
        Authenticate a user with username and password.
        Returns the user object if authentication succeeds, None otherwise.
        """
        # Query the user from database
        stmt = select(UserTable).where(UserTable.username == request.username)
        result = db.execute(stmt)
        user = result.scalar_one_or_none()

        if user is None:
            logger.warning(
                f"Login attempt failed for username: {request.username} - user not found"
            )
            return None

        if not user.enabled:
            logger.warning(
                f"Login attempt failed for username: {request.username} - user not found or disabled"
            )
            return None

        # Verify password
        if user.password_hash is None or not self.pwd_context.verify(
            request.password, user.password_hash
        ):
            logger.warning(
                f"Login attempt failed for username: {request.username} - incorrect password"
            )
            return None

        logger.debug(f"User {request.username} logged in successfully")
        return user

    def purge_expired_sessions(self, db: DbSessionDep) -> int:
        """
        Remove all expired sessions from the database.
        Returns the number of sessions that were deleted.
        """
        current_time = datetime.now()

        # Delete all sessions where expire_date is less than current time
        stmt = delete(UserSessionTable).where(
            UserSessionTable.expire_date < current_time
        )
        result = db.execute(stmt)
        deleted_count = result.rowcount

        if deleted_count > 0:
            logger.debug(f"Purged {deleted_count} expired sessions")

        return deleted_count

    def create_session(self, user: UserTable, db: DbSessionDep) -> UserSessionTable:
        """
        Create a new session for the user in the database.
        Returns the created session object.
        """
        expire_date = datetime.now() + timedelta(
            seconds=config.auth_session_expire_seconds
        )
        session_id = secrets.token_urlsafe(32)

        session = UserSessionTable(
            session_id=session_id, user_id=user.user_id, expire_date=expire_date
        )

        db.add(session)
        db.commit()
        db.refresh(session)

        logger.debug(f"Created session {session.session_id} for user {user.username}")
        return session

    def create_jwt_token(self, session: UserSessionTable, user: UserTable) -> str:
        """
        Create a JWT token containing session and user information.
        Returns the encoded JWT token as a string.
        """
        jwt_payload = {
            "session_id": session.session_id,
            "user_id": user.user_id,
            "username": user.username,
            "exp": session.expire_date,  # JWT expiration matches session expiration
        }

        token = jwt.encode(
            jwt_payload,
            config.auth_jwt_secret_key.get_secret_value(),
            algorithm="HS256",
        )

        return token

    def validate_token_and_get_user(
        self, request: Request, db: DbSessionDep
    ) -> UserTable | None:
        """
        Validate the access token from cookies and return the username.
        Returns None if authentication fails.
        """
        # Get the access token from cookies
        access_token = request.cookies.get("access_token")

        if not access_token:
            logger.debug("No access token found in cookies")
            return None

        try:
            # Decode and validate the JWT token
            payload = jwt.decode(
                access_token,
                config.auth_jwt_secret_key.get_secret_value(),
                algorithms=["HS256"],
            )

            session_id = payload.get("session_id")

            if not session_id:
                logger.debug("Invalid token payload - missing session_id")
                return None

            # Check that the session is valid and join with user table to get the user
            stmt = (
                select(UserTable)
                .join(UserSessionTable, UserSessionTable.user_id == UserTable.user_id)
                .where(
                    UserSessionTable.session_id == session_id,
                    UserSessionTable.expire_date > datetime.now(),
                )
            )
            result = db.execute(stmt)
            user = result.scalar_one_or_none()
            if not user:
                logger.debug(f"Valid user not found for session_id='{session_id}'")
                return None

            return user

        except jwt.ExpiredSignatureError:
            logger.debug("JWT token has expired")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Invalid JWT token")
            return None
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return None

    def invalidate_session(self, request: Request, db: DbSessionDep) -> None:
        """
        Invalidate the current session by removing it from the database.
        """
        try:
            access_token = request.cookies.get("access_token")

            if access_token:
                try:
                    payload = jwt.decode(
                        access_token,
                        config.auth_jwt_secret_key.get_secret_value(),
                        algorithms=["HS256"],
                    )
                    session_id = payload.get("session_id")
                    username = payload.get("username")

                    if session_id:
                        # Delete the session from database
                        stmt = delete(UserSessionTable).where(
                            UserSessionTable.session_id == session_id
                        )
                        result = db.execute(stmt)
                        db.commit()

                        if result.rowcount > 0:
                            logger.debug(
                                f"Invalidated session {session_id} for user {username}"
                            )

                except jwt.InvalidTokenError:
                    logger.warning("Invalid JWT token during logout")

        except Exception as e:
            logger.error(f"Error during session invalidation: {str(e)}")

    def set_auth_cookie(self, response: Response, token: str) -> None:
        """
        Set the authentication cookie with the JWT token.
        """
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False,
            samesite="strict",
            max_age=config.auth_session_expire_seconds,
            path="/",
        )

    def clear_auth_cookie(self, response: Response) -> None:
        """
        Clear the authentication cookie.
        """
        response.delete_cookie(
            key="access_token",
            path="/",
            httponly=True,
            secure=False,
            samesite="strict",
        )

    def change_password(
        self, user: UserTable, new_password: str, db: DbSessionDep
    ) -> None:
        """
        Change the user's password.
        """
        # Hash new password and update
        new_password_hash = self.pwd_context.hash(new_password)
        user.password_hash = new_password_hash
        db.commit()

        logger.debug(f"Password changed successfully for user: {user.username}")

    def invalidate_all_user_sessions(self, user: UserTable, db: DbSessionDep) -> int:
        """
        Invalidate all sessions for a user (including current one).
        Returns the number of sessions that were invalidated.
        """
        # Delete all sessions for this user
        stmt = delete(UserSessionTable).where(UserSessionTable.user_id == user.user_id)
        result = db.execute(stmt)
        deleted_count = result.rowcount
        db.commit()

        if deleted_count > 0:
            logger.debug(
                f"Invalidated all {deleted_count} sessions for user {user.username}"
            )

        return deleted_count


# Create a global instance of the Auth class
auth_service = Auth()


# Create a dependency for easier use in route parameters
def get_current_user(request: Request, db: DbSessionDep) -> UserTable:
    """Dependency to get the current authenticated user."""
    user = auth_service.validate_token_and_get_user(request, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


CurrentUser = Annotated[UserTable, Depends(get_current_user)]


@auth_router.post("/login", operation_id="login")
async def login(request: LoginRequest, db: DbSessionDep, response: Response):
    """
    Login using username & password
    """
    user = auth_service.authenticate_user(request, db)
    if user:
        # Purge expired sessions before creating a new one
        auth_service.purge_expired_sessions(db)

        # Create a new session
        session = auth_service.create_session(user, db)

        # Create JWT token
        token = auth_service.create_jwt_token(session, user)

        # Set authentication cookie
        auth_service.set_auth_cookie(response, token)

        return {"result": "ok"}
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )


@auth_router.get("/me", operation_id="get_me")
async def get_me(current_user: CurrentUser):
    """
    Get the current user information.
    """
    return {
        "username": current_user.username,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "enabled": current_user.enabled,
    }


@auth_router.post("/change-password", operation_id="change_password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: CurrentUser,
    db: DbSessionDep,
    response: Response,
):
    """
    Change the current user's password and invalidate all user sessions (including current one).
    User will be forced to re-login.
    """

    # Change the password
    auth_service.change_password(current_user, request.new_password, db)

    # Invalidate ALL sessions for this user (including current one)
    invalidated_count = auth_service.invalidate_all_user_sessions(current_user, db)

    # Clear the authentication cookie to force re-login
    auth_service.clear_auth_cookie(response)

    logger.debug(
        f"Password changed for user {current_user}, invalidated {invalidated_count} sessions (including current)"
    )

    return {
        "result": "ok",
        "message": "Пароль успішно змінено. Будь ласка, увійдіть знову.",
    }


@auth_router.post("/logout", operation_id="logout")
async def logout(request: Request, response: Response, db: DbSessionDep):
    """
    Logout the current user by clearing the authentication cookie and invalidating the session
    """
    # Invalidate the session in the database
    auth_service.invalidate_session(request, db)

    # Clear the authentication cookie
    auth_service.clear_auth_cookie(response)

    logger.debug("User logged out successfully")
    return {"result": "ok"}
