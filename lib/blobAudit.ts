import { put, get } from '@vercel/blob';
import type { AuditEntry } from './types';

let lockMap = new Map<string, Promise<unknown>>();

function getBlobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable not configured');
  }
  return token;
}

async function withFileLock<T>(
  filename: string,
  callback: () => Promise<T>
): Promise<T> {
  if (lockMap.has(filename)) {
    await lockMap.get(filename);
  }

  const lockPromise: Promise<T> = callback().then(
    (result) => {
      lockMap.delete(filename);
      return result;
    },
    (error) => {
      lockMap.delete(filename);
      throw error;
    }
  );

  lockMap.set(filename, lockPromise);
  return lockPromise;
}

async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  let result = await reader.read();
  while (!result.done) {
    chunks.push(result.value);
    result = await reader.read();
  }

  const buffer = new Uint8Array(
    chunks.reduce((acc: number[], val) => [...acc, ...Array.from(val)], [])
  );
  return new TextDecoder().decode(buffer);
}

export async function appendAudit(entry: AuditEntry): Promise<void> {
  try {
    const token = getBlobToken();
    const now = new Date();
    const yyyymm = now
      .toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit' })
      .split('/')
      .reverse()
      .join('');

    const filename = `audit/${yyyymm}.json`;

    await withFileLock(filename, async () => {
      let entries: AuditEntry[] = [];

      try {
        const result = await get(filename, { token, access: 'private' });
        if (result && result.stream) {
          const text = await streamToString(result.stream as ReadableStream<Uint8Array>);
          entries = JSON.parse(text);
        }
      } catch {
        // File doesn't exist yet, start with empty array
        entries = [];
      }

      entries.push(entry);

      const content = JSON.stringify(entries, null, 2);
      await put(filename, content, {
        token,
        access: 'private',
        contentType: 'application/json',
      });
    });
  } catch (error) {
    console.error('Error appending audit entry:', error);
    // Silently fail - auditing should not break the application
  }
}

export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]> {
  try {
    const token = getBlobToken();
    const filename = `audit/${yyyymm}.json`;

    const result = await get(filename, { token, access: 'private' });
    if (!result || !result.stream) {
      return [];
    }

    const text = await streamToString(result.stream as ReadableStream<Uint8Array>);
    return JSON.parse(text);
  } catch {
    return [];
  }
}

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
