import fs from 'fs/promises';
import path from 'path';
import type { User, Block, Slot, Room } from './types';

export interface SeedData {
  users: User[];
  blocks: Block[];
  slots: Slot[];
  rooms: Room[];
}

let cachedSeed: SeedData | null = null;

export async function readSeed(): Promise<SeedData> {
  if (cachedSeed) {
    return cachedSeed;
  }

  try {
    const seedPath = path.join(process.cwd(), 'data', 'seed.json');
    const content = await fs.readFile(seedPath, 'utf-8');
    const rawSeed = JSON.parse(content);

    cachedSeed = {
      users: rawSeed.users || [],
      blocks: rawSeed.blocks || [],
      slots: rawSeed.slots || [],
      rooms: rawSeed.rooms || [],
    };

    return cachedSeed;
  } catch (error) {
    console.error('Error reading seed:', error);
    return {
      users: [],
      blocks: [],
      slots: [],
      rooms: [],
    };
  }
}
