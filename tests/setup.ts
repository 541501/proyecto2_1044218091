import { beforeAll, afterEach, vi } from 'vitest';

// === MOCK PRISMA CLIENT ===
// Mock @prisma/client to avoid database connections during unit tests
vi.mock('@prisma/client', () => {
  const mockPrismaClient = {
    // Add mock methods as needed
    reserva: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    usuario: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    salon: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(mockPrismaClient)),
    $disconnect: vi.fn(),
  };
  
  return {
    PrismaClient: vi.fn(() => mockPrismaClient),
  };
});

// ===  MOCK NEXT-AUTH ===
// Mock next-auth to avoid session checks during unit tests
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(async () => null),
}));

// === MOCK ENVIRONMENT VARIABLES ===
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXTAUTH_SECRET = 'test-secret-key';
process.env.NEXTAUTH_CREDENTIALPROVIDER_SECRET = 'test-cred-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// === GLOBAL TEST SETUP ===
beforeAll(() => {
  // Setup any global test utilities if needed
  console.log('✅ Global test setup complete');
});

// === CLEANUP AFTER EACH TEST ===
afterEach(() => {
  // Clear all mocks to avoid test pollution
  vi.clearAllMocks();
});

// === EXTEND vi GLOBALS ===
// Make vi utilities available globally
import '@vitest/globals';
