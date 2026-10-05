from datetime import datetime, timezone, timedelta
from typing import Any

from ..supabase_client import SupabaseClient
from ..utils.logger import get_logger


def collect_auth_logs(
    client: SupabaseClient,
    hours_back: int = 1,
) -> list[dict[str, Any]]:
    logger = get_logger()
    logger.info("Collecting auth audit logs...")

    try:
        logs = client.get_auth_audit_logs(limit=1000)
    except Exception as e:
        logger.error("Failed to fetch auth audit logs: %s", e)
        return []

    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours_back)

    filtered = []
    for entry in logs:
        try:
            created = entry.get("created_at", "")
            if created:
                ts = datetime.fromisoformat(created.replace("Z", "+00:00"))
                if ts >= cutoff:
                    filtered.append(entry)
        except (ValueError, TypeError):
            continue

    logger.info("Collected %d auth log entries (last %dh)", len(filtered), hours_back)
    return filtered
