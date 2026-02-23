export interface CardEffect {
  type: string;
  value: number;
  target?: 'self' | 'enemy' | 'all-enemies';
}

export interface Card {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'attack' | 'defend' | 'skill' | 'power' | 'curse';
  rarity?: 'common' | 'uncommon' | 'rare';
  effects?: CardEffect[];
  art?: string;
  exhausts?: boolean;
}

export interface CardSystemConfig {
  deckSize?: number;
  handSize?: number;
  startingHandSize?: number;
  shuffleOnEmpty?: boolean;
  energyPerTurn?: number;
}
