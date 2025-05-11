'use client';
import { Metaplex } from '@metaplex-foundation/js';
import { Connection } from '@solana/web3.js';

export const getMetaplex = (connection: Connection) => {
  return new Metaplex(connection);
}; 