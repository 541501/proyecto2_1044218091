-- Bloques académicos (A, B, C)
CREATE TABLE IF NOT EXISTS blocks (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name       VARCHAR(50)  NOT NULL,
  code       VARCHAR(5)   UNIQUE NOT NULL,  -- A, B, C
  is_active  BOOLEAN      DEFAULT true,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- Franjas horarias fijas de la institución
CREATE TABLE IF NOT EXISTS slots (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        VARCHAR(20) NOT NULL,         -- "07:00–09:00"
  start_time  TIME        NOT NULL,
  end_time    TIME        NOT NULL,
  order_index INTEGER     NOT NULL,         -- para ordenar en el calendario
  is_active   BOOLEAN     DEFAULT true,
  UNIQUE (start_time, end_time)
);

-- Salones: tipo puede ser 'salon', 'laboratorio', 'auditorio', 'sala_computo', 'otro'
CREATE TABLE IF NOT EXISTS rooms (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id    UUID         NOT NULL REFERENCES blocks(id),
  code        VARCHAR(20)  NOT NULL,        -- "A-101"
  type        VARCHAR(20)  NOT NULL DEFAULT 'salon'
              CHECK (type IN ('salon', 'laboratorio', 'auditorio', 'sala_computo', 'otro')),
  capacity    INTEGER      NOT NULL CHECK (capacity > 0),
  equipment   TEXT,                         -- descripción libre: "Videobeam, tablero, AC"
  is_active   BOOLEAN      DEFAULT true,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE (block_id, code)                   -- RN-09: código único dentro del bloque
);

CREATE INDEX IF NOT EXISTS idx_rooms_block  ON rooms(block_id, is_active);
CREATE INDEX IF NOT EXISTS idx_rooms_active ON rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_blocks_code  ON blocks(code);
CREATE INDEX IF NOT EXISTS idx_slots_order  ON slots(order_index);

-- Insertar los datos del seed inicialmente en modo seed (estos se cargan desde data/seed.json en Fase 3)
-- Los datos serán insertados por el bootstrap desde el seed.json del servidor
