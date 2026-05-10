-- Migration 0003: Initialize reservations table with partial UNIQUE index
-- Phase 4: Reservations
-- Key: The UNIQUE index is PARTIAL on status = 'confirmada' to allow multiple
-- cancelled reservas for the same (room, slot, date) combination.

CREATE TABLE IF NOT EXISTS reservations (
  id               UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id          UUID         NOT NULL REFERENCES rooms(id),
  slot_id          UUID         NOT NULL REFERENCES slots(id),
  professor_id     UUID         NOT NULL REFERENCES users(id),
  reservation_date DATE         NOT NULL,  -- only weekdays (Mon-Fri)
  subject          VARCHAR(150) NOT NULL,  -- course subject
  group_name       VARCHAR(50)  NOT NULL,  -- group (e.g., "2024-1 Group A")
  status           VARCHAR(15)  NOT NULL DEFAULT 'confirmada'
                   CHECK (status IN ('confirmada', 'cancelada')),
  cancellation_reason TEXT,                -- only when status='cancelada'
  cancelled_by     UUID         REFERENCES users(id),  -- may differ from professor
  cancelled_at     TIMESTAMPTZ,
  created_by       UUID         REFERENCES users(id),  -- always equals professor_id
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- RN-01: Uniqueness of active reservations via partial index.
-- Only one 'confirmada' reservation per (room, slot, date) combination.
-- Allows multiple 'cancelada' reservations for the same combination.
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_reservation
  ON reservations(room_id, slot_id, reservation_date)
  WHERE status = 'confirmada';

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_reservations_professor  ON reservations(professor_id, reservation_date DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_room_date  ON reservations(room_id, reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_date       ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status     ON reservations(status);
