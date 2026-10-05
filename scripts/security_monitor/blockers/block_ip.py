from typing import Any

from ..supabase_client import SupabaseClient
from ..utils.logger import get_logger


def block_ips(
    client: SupabaseClient,
    ips: list[tuple[str, int]],
) -> list[dict[str, Any]]:
    logger = get_logger()
    actions: list[dict[str, Any]] = []

    for ip_address, count in ips:
        already = client.is_ip_blocked(ip_address)
        if already:
            logger.info("IP %s already in denylist, skipping", ip_address)
            continue

        reason = f"Brute force: {count} login failures in 1h"
        ok = client.add_to_denylist(ip_address=ip_address, reason=reason)

        if ok:
            actions.append({
                "type": "block_ip",
                "target": ip_address,
                "reason": reason,
                "success": True,
            })
            logger.warning("Blocked IP %s (%s)", ip_address, reason)
        else:
            actions.append({
                "type": "block_ip",
                "target": ip_address,
                "reason": reason,
                "success": False,
            })
            logger.error("Failed to block IP %s", ip_address)

    return actions
