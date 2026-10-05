from collections import Counter
from datetime import datetime, timezone, timedelta
from typing import Any

from ..config import Config
from ..supabase_client import SupabaseClient
from ..utils.logger import get_logger


def analyze_anomalies(
    audit_logs: list[dict[str, Any]],
    client: SupabaseClient,
    config: Config,
) -> list[dict[str, Any]]:
    logger = get_logger()
    logger.info("Analyzing anomaly patterns...")

    anomalies: list[dict[str, Any]] = []

    signup_ips: Counter = Counter()
    user_actions: dict[str, list[dict[str, Any]]] = {}
    locations: Counter = Counter()

    for entry in audit_logs:
        action = entry.get("action", "")
        traits = entry.get("traits", {}) or {}
        ip = traits.get("ip_address", "") or entry.get("ip_address", "")
        actor = entry.get("actor_id", "")

        if action == "signup" and ip:
            signup_ips[ip] += 1

        if actor:
            if actor not in user_actions:
                user_actions[actor] = []
            user_actions[actor].append(entry)

        loc = traits.get("location", "") or traits.get("city", "") or ""
        if loc:
            locations[loc] += 1

    threshold = config.signup_flood_threshold
    for ip, count in signup_ips.items():
        if count >= threshold:
            anomalies.append({
                "type": "signup_flood",
                "ip": ip,
                "count": count,
                "detail": f"Signup flood from {ip}: {count} signups in 1h",
            })
            logger.warning("Signup flood detected: IP %s (%d signups)", ip, count)

    suspicious_user_agents = {"python-requests", "curl", "wget", "go-http-client", "scrapy"}
    for user_id, entries in user_actions.items():
        ips_seen: set = set()
        agents_seen: set = set()
        for e in entries:
            t = e.get("traits", {}) or {}
            ip = t.get("ip_address", "")
            agent = (t.get("user_agent", "") or "").lower()
            if ip:
                ips_seen.add(ip)
            if agent:
                agents_seen.add(agent)
                for sa in suspicious_user_agents:
                    if sa in agent:
                        anomalies.append({
                            "type": "suspicious_user_agent",
                            "user_id": user_id,
                            "detail": f"Suspicious user-agent '{agent[:50]}' for user {user_id[:12]}",
                        })
                        break

        if len(ips_seen) >= 3:
            anomalies.append({
                "type": "token_replay",
                "user_id": user_id,
                "detail": f"Token used from {len(ips_seen)} different IPs: {', '.join(ips_seen)}",
            })
            logger.warning("Token replay detected: user %s from %d IPs", user_id[:12], len(ips_seen))

    logger.info("Found %d anomalies", len(anomalies))
    return anomalies
