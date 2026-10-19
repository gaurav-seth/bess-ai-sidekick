
import sqlite3
import uuid
from datetime import datetime, timezone

DATABASE_PATH = "bess_maintenance.db"


def get_connection():
    """Create a connection to the maintenance database."""
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    """Create the maintenance cases table if it does not exist."""
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS maintenance_cases (
                case_id TEXT PRIMARY KEY,
                rack_id TEXT NOT NULL,
                symptoms TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'OPEN'
                    CHECK (status IN ('OPEN', 'IN_PROGRESS', 'CLOSED')),
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )


def create_case(rack_id: str, symptoms: str) -> dict:
    """Create and return a maintenance case."""
    rack_id = rack_id.strip()
    symptoms = symptoms.strip()

    if not rack_id or not symptoms:
        raise ValueError("rack_id and symptoms are required.")

    now = datetime.now(timezone.utc).isoformat()
    case_id = f"MC-{uuid.uuid4().hex[:8].upper()}"

    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO maintenance_cases (
                case_id, rack_id, symptoms, status, created_at, updated_at
            )
            VALUES (?, ?, ?, 'OPEN', ?, ?)
            """,
            (case_id, rack_id, symptoms, now, now),
        )

        row = connection.execute(
            "SELECT * FROM maintenance_cases WHERE case_id = ?",
            (case_id,),
        ).fetchone()

        return dict(row)


def get_case(case_id: str) -> dict | None:
    """Retrieve a maintenance case by its ID."""
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM maintenance_cases WHERE case_id = ?",
            (case_id.strip(),),
        ).fetchone()

        return dict(row) if row else None


def list_cases() -> list[dict]:
    """Return maintenance cases, newest first."""
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT * FROM maintenance_cases
            ORDER BY created_at DESC
            """
        ).fetchall()

        return [dict(row) for row in rows]


initialize_database()
