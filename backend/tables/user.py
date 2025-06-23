from datetime import datetime

from sqlalchemy import Boolean, Integer, String, Identity, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.tables.base import BaseTable


class UserTable(BaseTable):
    __tablename__ = "T_USERS"
    __table_args__ = {
        "comment": "Користувач системи",
    }

    user_id: Mapped[int] = mapped_column(
        Integer, Identity(), primary_key=True, comment="ID користувача"
    )
    username: Mapped[str] = mapped_column(
        String(50), nullable=False, unique=True, comment="Логін"
    )
    full_name: Mapped[str] = mapped_column(String(255), comment="ПІБ")
    email: Mapped[str] = mapped_column(String(255), comment="Електронна адреса")
    enabled: Mapped[bool] = mapped_column(
        Boolean(create_constraint=True),
        default=True,
        server_default="1",
        comment="Активний",
    )
    password_hash: Mapped[str] = mapped_column(
        String(255), nullable=True, comment="Хеш пароля"
    )

    def __repr__(self):
        return f"{self.username} ({self.full_name}, {self.email})"


class UserSessionTable(BaseTable):
    __tablename__ = "T_USER_SESSIONS"
    __table_args__ = {
        "comment": "Сесії користувачів",
    }

    session_id: Mapped[str] = mapped_column(
        String(64), primary_key=True, comment="ID сесії"
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("T_USERS.user_id"), nullable=False, comment="ID користувача"
    )
    expire_date: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, comment="Дійсна до"
    )

    def __repr__(self):
        return f"Session {self.session_id} for User {self.user_id} (expires {self.expire_date})"
