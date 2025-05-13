export interface TokenFood extends Food {
  mint: string;
  address: string;
  tokenName: string;
  tokenImage: string;
}

export interface Food {
  id: number;
  name: string;
  image: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  isBeingEaten: boolean;
}
