from datetime import datetime, timezone

import httpx
from typing import Any, Optional
from .config import Config


class SupabaseClient:
    def __init__(self, config: Config) -> None:
        self.base_url = config.supabase_url.rstrip("/")
        self.secret_key = config.supabase_secret_key

    def _headers(self) -> dict[str, str]:
        return {
            "apikey": self.secret_key,
            "Content-Type": "application/json",
        }

    def get_auth_audit_logs(self, limit: int = 1000) -> list[dict[str, Any]]:
        url = f"{self.base_url}/auth/v1/admin/audit"
        resp = httpx.get(
            url,
            headers=self._headers(),
            params={"limit": limit},
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()

    def get_users(self) -> list[dict[str, Any]]:
        url = f"{self.base_url}/auth/v1/admin/users"
        resp = httpx.get(url, headers=self._headers(), timeout=30)
        resp.raise_for_status()
        data = resp.json()
        return data.get("users", [])

    def disable_user(self, user_id: str) -> bool:
        url = f"{self.base_url}/auth/v1/admin/users/{user_id}"
        resp = httpx.put(
            url,
            headers=self._headers(),
            json={"ban_duration": "none"},
            timeout=15,
        )
        return resp.is_success

    def add_to_denylist(
        self,
        *,
        ip_address: str = "",
        user_id: str = "",
        reason: str = "",
    ) -> bool:
        url = f"{self.base_url}/rest/v1/security_denylist"
        payload: dict[str, Any] = {
            "reason": reason,
            "blocked_by": "security_monitor",
        }
        if ip_address:
            payload["ip_address"] = ip_address
        if user_id:
            payload["user_id"] = user_id

        resp = httpx.post(url, headers=self._headers(), json=payload, timeout=15)
        return resp.is_success

    def is_ip_blocked(self, ip_address: str) -> bool:
        url = f"{self.base_url}/rest/v1/security_denylist"
        resp = httpx.get(
            url,
            headers=self._headers(),
            params={
                "ip_address": f"eq.{ip_address}",
                "select": "id",
                "limit": 1,
            },
            timeout=15,
        )
        if not resp.is_success:
            return False
        data = resp.json()
        return len(data) > 0

    def create_scan_log(self, triggered_by: str = "scheduled") -> str:
        url = f"{self.base_url}/rest/v1/security_scan_log"
        resp = httpx.post(
            url,
            headers=self._headers(),
            json={
                "triggered_by": triggered_by,
                "status": "running",
                "started_at": datetime.now(timezone.utc).isoformat(),
            },
            timeout=15,
        )
        if resp.is_success:
            data = resp.json()
            if isinstance(data, list) and len(data) > 0:
                return data[0].get("id", "")
            if isinstance(data, dict):
                return data.get("id", "")
        return ""

    def finish_scan_log(
        self,
        log_id: str,
        status: str = "completed",
        threats_detected: int = 0,
        blocks_inserted: int = 0,
        audit_logs_analyzed: int = 0,
        summary: Optional[dict[str, Any]] = None,
        error: Optional[str] = None,
    ) -> bool:
        if not log_id:
            return False
        url = f"{self.base_url}/rest/v1/security_scan_log?id=eq.{log_id}"
        payload: dict[str, Any] = {
            "status": status,
            "finished_at": datetime.now(timezone.utc).isoformat(),
            "threats_detected": threats_detected,
            "blocks_inserted": blocks_inserted,
            "audit_logs_analyzed": audit_logs_analyzed,
        }
        if summary is not None:
            payload["summary"] = summary
        if error is not None:
            payload["error"] = error

        resp = httpx.patch(url, headers=self._headers(), json=payload, timeout=15)
        return resp.is_success
