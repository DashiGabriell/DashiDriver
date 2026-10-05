import os
from dataclasses import dataclass
from typing import Optional


@dataclass
class Config:
    supabase_url: str = ""
    supabase_secret_key: str = ""
    discord_webhook_url: str = ""
    database_url: Optional[str] = None

    brute_force_threshold: int = 10
    signup_flood_threshold: int = 50
    edge_abuse_threshold: int = 1000
    interval_minutes: int = 60

    @classmethod
    def from_env(cls) -> "Config":
        return cls(
            supabase_url=os.getenv("SUPABASE_URL", ""),
            supabase_secret_key=os.getenv("SUPABASE_SECRET_KEY", ""),
            discord_webhook_url=os.getenv("DISCORD_WEBHOOK_URL", ""),
            database_url=os.getenv("DATABASE_URL"),
            brute_force_threshold=int(os.getenv("BRUTE_FORCE_THRESHOLD", "10")),
            signup_flood_threshold=int(os.getenv("SIGNUP_FLOOD_THRESHOLD", "50")),
            edge_abuse_threshold=int(os.getenv("EDGE_ABUSE_THRESHOLD", "1000")),
            interval_minutes=int(os.getenv("MONITOR_INTERVAL_MINUTES", "60")),
        )

    def validate(self) -> list[str]:
        errors: list[str] = []
        if not self.supabase_url:
            errors.append("SUPABASE_URL is required")
        if not self.supabase_secret_key:
            errors.append("SUPABASE_SECRET_KEY is required")
        if not self.discord_webhook_url:
            errors.append("DISCORD_WEBHOOK_URL is required")
        return errors
