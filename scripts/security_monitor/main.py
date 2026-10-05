from typing import Any

from .config import Config
from .supabase_client import SupabaseClient
from .collectors.auth_logs import collect_auth_logs
from .collectors.pg_stats import collect_pg_stats
from .analyzers.brute_force import analyze_brute_force
from .analyzers.injection import analyze_injection
from .analyzers.anomaly import analyze_anomalies
from .blockers.block_ip import block_ips
from .blockers.disable_user import disable_users
from .alerters.discord import DiscordAlerter
from .utils.logger import setup_logger, get_logger


def run() -> None:
    logger = setup_logger()
    logger.info("=" * 60)
    logger.info("DashiDrive Security Monitor — Starting scan")
    logger.info("=" * 60)

    config = Config.from_env()
    errors = config.validate()
    if errors:
        for err in errors:
            logger.error("Configuration error: %s", err)
        logger.error("Scan aborted due to configuration errors")
        return

    client = SupabaseClient(config)
    alerter = DiscordAlerter(config)

    scan_log_id = client.create_scan_log(triggered_by="scheduled")

    audit_logs = collect_auth_logs(client, hours_back=1)

    pg_stats = collect_pg_stats(config.database_url)

    brute_force_results = analyze_brute_force(audit_logs, config)

    injection_results = analyze_injection(pg_stats)

    anomalies = analyze_anomalies(audit_logs, client, config)

    actions: list[dict[str, Any]] = []

    ip_actions = block_ips(client, brute_force_results)
    actions.extend(ip_actions)

    user_actions = disable_users(client, anomalies)
    actions.extend(user_actions)

    alerter.send(
        brute_force=brute_force_results,
        injection_findings=injection_results,
        anomalies=anomalies,
        actions=actions,
    )

    total = (
        len(brute_force_results)
        + len(injection_results)
        + len(anomalies)
        + len(actions)
    )
    threats_found = len(brute_force_results) + len(injection_results) + len(anomalies)

    client.finish_scan_log(
        log_id=scan_log_id,
        status="completed",
        threats_detected=threats_found,
        blocks_inserted=len(actions),
        audit_logs_analyzed=len(audit_logs),
        summary={
            "brute_force_ips": len(brute_force_results),
            "injection_patterns": len(injection_results),
            "anomalies": len(anomalies),
            "actions_taken": len(actions),
        },
    )

    logger.info("-" * 60)
    logger.info("Scan complete — %d events", total)
    logger.info("  Brute force: %d IPs", len(brute_force_results))
    logger.info("  Injection patterns: %d", len(injection_results))
    logger.info("  Anomalies: %d", len(anomalies))
    logger.info("  Actions taken: %d", len(actions))
    logger.info("=" * 60)
