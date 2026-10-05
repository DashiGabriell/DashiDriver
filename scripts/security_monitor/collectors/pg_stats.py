from typing import Any, Optional

from ..utils.logger import get_logger


def collect_pg_stats(database_url: Optional[str]) -> dict[str, Any]:
    logger = get_logger()
    result: dict[str, Any] = {
        "connections": [],
        "slow_queries": [],
    }

    if not database_url:
        logger.info("DATABASE_URL not set, skipping PG stats collection")
        return result

    logger.info("Collecting PostgreSQL stats...")

    try:
        import psycopg2
    except ImportError:
        logger.warning("psycopg2 not installed, skipping PG stats collection")
        return result

    try:
        conn = psycopg2.connect(database_url, connect_timeout=10)
        cur = conn.cursor()

        cur.execute("""
            SELECT pid, state, query, query_start, usename
            FROM pg_stat_activity
            WHERE state = 'active'
              AND pid <> pg_backend_pid()
              AND query NOT LIKE '%pg_stat_activity%'
            ORDER BY query_start DESC
        """)
        result["connections"] = cur.fetchall()
        logger.info("Collected %d active connections", len(result["connections"]))

        try:
            cur.execute("""
                SELECT query, calls, total_exec_time, mean_exec_time, rows
                FROM pg_stat_statements
                ORDER BY total_exec_time DESC
                LIMIT 50
            """)
            result["slow_queries"] = cur.fetchall()
            logger.info("Collected %d slow query stats", len(result["slow_queries"]))
        except Exception:
            logger.info("pg_stat_statements extension not available, skipping")

        cur.close()
        conn.close()

    except Exception as e:
        logger.error("Failed to collect PG stats: %s", e)

    return result
