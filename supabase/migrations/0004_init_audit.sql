-- Migration 0004: Initialize audit table
-- Phase 4+: Audit trail for all system operations

CREATE TABLE IF NOT EXISTS audit_entries (
  id               UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp        TIMESTAMPTZ  DEFAULT NOW(),
  user_id          UUID         NOT NULL REFERENCES users(id),
  user_email       VARCHAR(255) NOT NULL,
  user_role        VARCHAR(15)  NOT NULL
                   CHECK (user_role IN ('profesor', 'coordinador', 'admin')),
  action           VARCHAR(30)  NOT NULL
                   CHECK (action IN (
                     'create_reservation', 'cancel_reservation',
                     'deactivate_room', 'create_room', 'update_room',
                     'create_user', 'toggle_user',
                     'login', 'logout', 'bootstrap'
                   )),
  entity           VARCHAR(20)  NOT NULL
                   CHECK (entity IN ('reservation', 'room', 'user', 'system')),
  entity_id        UUID,                                   -- nullable for system-wide actions
  summary          TEXT         NOT NULL,
  metadata         JSONB,                                  -- flexible for additional data
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_entries_timestamp ON audit_entries(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entries_user_id   ON audit_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entries_action    ON audit_entries(action);
CREATE INDEX IF NOT EXISTS idx_audit_entries_entity    ON audit_entries(entity, entity_id);
