export type User = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'profesor' | 'coordinador' | 'admin';
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string;
};

export type SafeUser = Omit<User, 'password_hash'>;

export type Block = {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
};

export type Slot = {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  order_index: number;
  is_active: boolean;
};

export type Room = {
  id: string;
  block_id: string;
  code: string;
  type: 'salon' | 'laboratorio' | 'auditorio' | 'sala_computo' | 'otro';
  capacity: number;
  equipment: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Reservation = {
  id: string;
  room_id: string;
  slot_id: string;
  professor_id: string;
  reservation_date: string;
  subject: string;
  group_name: string;
  status: 'confirmada' | 'cancelada';
  cancellation_reason: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  created_by: string;
  created_at: string;
};

export type ReservationWithDetails = Reservation & {
  professor?: SafeUser;
  room?: Room;
  slot?: Slot;
  cancelled_by_user?: SafeUser;
};

export type CreateReservationRequest = {
  room_id: string;
  slot_id: string;
  reservation_date: string;
  subject: string;
  group_name: string;
};

export type CancelReservationRequest = {
  cancellation_reason?: string;
};

export type ReservationFilters = {
  status?: 'confirmada' | 'cancelada';
  from_date?: string;
  to_date?: string;
  block_id?: string;
};

export type AuditEntry = {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_role: 'profesor' | 'coordinador' | 'admin';
  action:
    | 'create_reservation'
    | 'cancel_reservation'
    | 'deactivate_room'
    | 'create_room'
    | 'update_room'
    | 'create_user'
    | 'toggle_user'
    | 'login'
    | 'logout'
    | 'bootstrap';
  entity: 'reservation' | 'room' | 'user' | 'system';
  entity_id?: string;
  summary: string;
  metadata?: Record<string, unknown>;
};

export type SystemMode = 'seed' | 'live';

export type JWTPayload = {
  userId: string;
  role: 'profesor' | 'coordinador' | 'admin';
  email: string;
  mustChangePassword?: boolean;
};

// Report types
export type OccupancyReportRow = {
  fecha: string;           // DD/MM/YYYY
  bloque: string;          // Block name
  salon: string;           // Room code
  codigo: string;          // Room code (duplicate)
  franja: string;          // Slot name
  profesor: string;        // Professor full name
  materia: string;         // Subject
  grupo: string;           // Group name
  estado: string;          // Status
};

export type ReportFilters = {
  from_date: string;       // YYYY-MM-DD
  to_date: string;         // YYYY-MM-DD
  block_id?: string;       // Optional block filter
};

// User management types
export type CreateUserRequest = {
  name: string;
  email: string;
  role: 'profesor' | 'coordinador' | 'admin';
};

export type CreateUserResponse = {
  user: SafeUser;
  temporaryPassword: string;
};

export type UpdateUserRequest = {
  name?: string;
  role?: 'profesor' | 'coordinador' | 'admin';
  is_active?: boolean;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};
