from typing import Any

from ..supabase_client import SupabaseClient
from ..utils.logger import get_logger


def disable_users(
    client: SupabaseClient,
    anomalies: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    logger = get_logger()
    actions: list[dict[str, Any]] = []

    handled: set[str] = set()

    for anomaly in anomalies:
        user_id = anomaly.get("user_id", "")
        if not user_id or user_id in handled:
            continue

        reason = anomaly.get("detail", "Security violation")
        ok = client.disable_user(user_id)

        if ok:
            handled.add(user_id)
            client.add_to_denylist(
                user_id=user_id,
                reason=reason,
            )
            actions.append({
                "type": "disable_user",
                "target": user_id,
                "reason": reason,
                "success": True,
            })
            logger.warning("Disabled user %s (%s)", user_id[:12], reason)
        else:
            actions.append({
                "type": "disable_user",
                "target": user_id,
                "reason": reason,
                "success": False,
            })
            logger.error("Failed to disable user %s", user_id[:12])

    return actions
