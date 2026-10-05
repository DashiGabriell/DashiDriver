from datetime import datetime, timezone
from typing import Any

import httpx

from ..config import Config
from ..utils.logger import get_logger


class DiscordAlerter:
    def __init__(self, config: Config) -> None:
        self.webhook_url = config.discord_webhook_url
        self.logger = get_logger()

    def send(
        self,
        brute_force: list[tuple[str, int]],
        injection_findings: list[dict[str, Any]],
        anomalies: list[dict[str, Any]],
        actions: list[dict[str, Any]],
    ) -> bool:
        if not self.webhook_url:
            self.logger.warning("No Discord webhook URL configured, skipping alert")
            return False

        total_threats = len(brute_force) + len(injection_findings) + len(anomalies)
        total_actions = len(actions)
        has_issues = total_threats > 0 or total_actions > 0

        color = 0xED4245 if total_threats > 0 else (0xFEE75C if total_actions > 0 else 0x57F287)
        status = "🚨 AMEAÇAS DETECTADAS" if total_threats > 0 else (
            "✅ Nenhuma ameaça" if total_actions == 0 else "⚠️ Atenção"
        )

        embed: dict[str, Any] = {
            "title": f"🔒 Security Monitor — {status}",
            "color": color,
            "fields": [],
            "footer": {"text": "DashiDrive Security Monitor"},
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        if brute_force:
            lines = "\n".join(f"`{ip}` — {count} falhas" for ip, count in brute_force[:10])
            embed["fields"].append({
                "name": f"🔴 Brute Force ({len(brute_force)})",
                "value": lines or "Nenhum",
                "inline": False,
            })

        if injection_findings:
            lines = "\n".join(
                f"[{f['pattern']}] {f['query'][:60]}..."
                for f in injection_findings[:5]
            )
            embed["fields"].append({
                "name": f"⚠️ SQL Injection Patterns ({len(injection_findings)})",
                "value": lines or "Nenhum",
                "inline": False,
            })

        if anomalies:
            lines = "\n".join(
                f"• {a['type']}: {a.get('detail', '')[:80]}"
                for a in anomalies[:10]
            )
            embed["fields"].append({
                "name": f"🟡 Anomalias ({len(anomalies)})",
                "value": lines or "Nenhuma",
                "inline": False,
            })

        if actions:
            lines = "\n".join(
                f"{'✅' if a['success'] else '❌'} {a['type']}: {a.get('target', '')[:30]}"
                for a in actions[:10]
            )
            embed["fields"].append({
                "name": f"🛡️ Ações Tomadas ({len(actions)})",
                "value": lines or "Nenhuma",
                "inline": False,
            })

        if not embed["fields"]:
            embed["fields"].append({
                "name": "Status",
                "value": "Nenhuma ameaça detectada na última varredura.",
                "inline": False,
            })

        payload = {"embeds": [embed]}

        try:
            resp = httpx.post(self.webhook_url, json=payload, timeout=15)
            if resp.is_success:
                self.logger.info("Alert sent to Discord successfully")
                return True
            else:
                self.logger.error(
                    "Failed to send Discord alert: HTTP %d %s",
                    resp.status_code,
                    resp.text[:200],
                )
                return False
        except Exception as e:
            self.logger.error("Failed to send Discord alert: %s", e)
            return False
