from collections import Counter
from typing import Any

from ..config import Config
from ..utils.logger import get_logger


def analyze_brute_force(
    audit_logs: list[dict[str, Any]],
    config: Config,
) -> list[tuple[str, int]]:
    logger = get_logger()
    logger.info("Analyzing brute force patterns...")

    failed_ips: Counter = Counter()

    for entry in audit_logs:
        action = entry.get("action", "")
        if action in ("login_failure", "login", "token_refresh"):
            traits = entry.get("traits", {}) or {}
            ip = traits.get("ip_address", "")
            if not ip and "ip_address" in entry:
                ip = entry.get("ip_address", "")
            if ip:
                failed_ips[ip] += 1

    threshold = config.brute_force_threshold
    detected = [(ip, count) for ip, count in failed_ips.items() if count >= threshold]

    if detected:
        logger.warning(
            "Brute force detected: %d IPs above threshold (%d failures)",
            len(detected),
            threshold,
        )
        for ip, count in detected:
            logger.warning("  IP %s — %d failures", ip, count)

    return detected
