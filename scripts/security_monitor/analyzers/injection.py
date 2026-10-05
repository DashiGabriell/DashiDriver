import re
from typing import Any

from ..utils.logger import get_logger


INJECTION_PATTERNS: list[tuple[str, str]] = [
    ("SQL_UNION", r"\bUNION\b.*\bSELECT\b"),
    ("SQL_OR_TRUE", r"\bOR\s+['\"]?1['\"]?\s*=\s*['\"]?1['\"]?"),
    ("SQL_OR_TRUE_NUM", r"\bOR\s+1\s*=\s*1"),
    ("SQL_DROP", r"\bDROP\s+TABLE"),
    ("SQL_DELETE", r"\bDELETE\s+FROM"),
    ("SQL_UPDATE", r"\bUPDATE\s+.*\bSET\b"),
    ("SQL_INSERT", r"\bINSERT\s+INTO"),
    ("SQL_SLEEP", r"\bpg_sleep\b|\bSLEEP\b|\bWAITFOR\b"),
    ("SQL_EXEC", r"\bEXEC\b|\bEXECUTE\b|\bxp_cmdshell\b"),
    ("SQL_COMMENT", r"--\s|\#\s|/\*.*\*/"),
    ("SQL_UNION_ALL", r"\bUNION\s+ALL\s+SELECT"),
    ("SQL_HEX_ENC", r"0x[0-9a-fA-F]{6,}"),
    ("NO_SQL_INJECTION", r"\$gt|\$ne|\$where|\$regex"),
]


def analyze_injection(
    pg_stats: dict[str, Any],
) -> list[dict[str, Any]]:
    logger = get_logger()
    logger.info("Analyzing SQL injection patterns...")

    findings: list[dict[str, Any]] = []

    queries = []
    for row in pg_stats.get("slow_queries", []):
        if row and len(row) > 0:
            queries.append(row[0])

    for query_text in queries:
        if not query_text or not isinstance(query_text, str):
            continue
        query_upper = query_text.upper()

        for name, pattern in INJECTION_PATTERNS:
            if re.search(pattern, query_upper, re.IGNORECASE):
                findings.append({
                    "pattern": name,
                    "query": query_text[:200],
                    "severity": "HIGH" if name.startswith("SQL_") else "MEDIUM",
                })
                break

    if findings:
        logger.warning("Detected %d suspicious query patterns", len(findings))
        for f in findings:
            logger.warning("  [%s] %s", f["pattern"], f["query"][:80])

    return findings
