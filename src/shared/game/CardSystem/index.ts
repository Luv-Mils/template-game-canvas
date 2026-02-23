/**
 * CardSystem — Game Engine Component (GME-14)
 *
 * Deck builder / card game state machine.
 * Draw pile, hand, discard pile, exhaust pile, energy system,
 * Fisher-Yates shuffle, full turn lifecycle.
 */

import type { CardSystemConfig, Card } from './types';

export class CardSystem {
  private drawPile: Card[] = [];
  private hand: Card[] = [];
  private discardPile: Card[] = [];
  private exhaustPile: Card[] = [];
  private energy: number;
  private maxEnergy: number;
  private config: CardSystemConfig;

  constructor(config: CardSystemConfig) {
    this.config = config;
    this.energy = config.energyPerTurn ?? 3;
    this.maxEnergy = this.energy;
  }

  // -- Deck building (pre-game) -----------------------------------------------

  buildDeck(cards: Card[]): void {
    const maxSize = this.config.deckSize ?? 40;
    this.drawPile = cards.slice(0, maxSize).map((c) => ({ ...c }));
    this.hand = [];
    this.discardPile = [];
    this.exhaustPile = [];
    this.shuffleDrawPile();
  }

  addToDeck(card: Card): boolean {
    const maxSize = this.config.deckSize ?? 40;
    const totalCards = this.drawPile.length + this.hand.length + this.discardPile.length + this.exhaustPile.length;
    if (totalCards >= maxSize) return false;
    this.drawPile.push({ ...card });
    return true;
  }

  removeFromDeck(cardId: string): boolean {
    let idx = this.drawPile.findIndex((c) => c.id === cardId);
    if (idx !== -1) { this.drawPile.splice(idx, 1); return true; }
    idx = this.discardPile.findIndex((c) => c.id === cardId);
    if (idx !== -1) { this.discardPile.splice(idx, 1); return true; }
    idx = this.hand.findIndex((c) => c.id === cardId);
    if (idx !== -1) { this.hand.splice(idx, 1); return true; }
    return false;
  }

  getDeck(): Card[] {
    return [
      ...this.drawPile.map((c) => ({ ...c })),
      ...this.hand.map((c) => ({ ...c })),
      ...this.discardPile.map((c) => ({ ...c })),
      ...this.exhaustPile.map((c) => ({ ...c })),
    ];
  }

  // -- Turn flow --------------------------------------------------------------

  startTurn(): Card[] {
    this.energy = this.maxEnergy;
    const startSize = this.config.startingHandSize ?? 5;
    const maxHand = this.config.handSize ?? 10;
    const toDraw = Math.min(startSize, maxHand - this.hand.length);
    return this.drawCards(toDraw);
  }

  endTurn(): void {
    // Discard entire hand
    while (this.hand.length > 0) {
      this.discardPile.push(this.hand.pop()!);
    }
  }

  // -- Card actions -----------------------------------------------------------

  drawCards(count: number): Card[] {
    const drawn: Card[] = [];
    const maxHand = this.config.handSize ?? 10;

    for (let i = 0; i < count; i++) {
      if (this.hand.length >= maxHand) break;

      if (this.drawPile.length === 0) {
        if (this.config.shuffleOnEmpty !== false && this.discardPile.length > 0) {
          this.shuffleDiscardIntoDrawPile();
        } else {
          break; // no cards left
        }
      }

      if (this.drawPile.length === 0) break;
      const card = this.drawPile.pop()!;
      this.hand.push(card);
      drawn.push({ ...card });
    }

    return drawn;
  }

  playCard(cardId: string): { success: boolean; reason?: string } {
    const idx = this.hand.findIndex((c) => c.id === cardId);
    if (idx === -1) return { success: false, reason: 'Card not in hand' };

    const card = this.hand[idx];
    if (card.cost > this.energy) return { success: false, reason: 'Not enough energy' };

    this.energy -= card.cost;
    this.hand.splice(idx, 1);

    if (card.exhausts) {
      this.exhaustPile.push(card);
    } else {
      this.discardPile.push(card);
    }

    return { success: true };
  }

  discardCard(cardId: string): void {
    const idx = this.hand.findIndex((c) => c.id === cardId);
    if (idx === -1) return;
    this.discardPile.push(this.hand.splice(idx, 1)[0]);
  }

  // -- Energy -----------------------------------------------------------------

  getEnergy(): number {
    return this.energy;
  }

  getMaxEnergy(): number {
    return this.maxEnergy;
  }

  spendEnergy(amount: number): boolean {
    if (this.energy < amount) return false;
    this.energy -= amount;
    return true;
  }

  gainEnergy(amount: number): void {
    this.energy += amount;
  }

  setMaxEnergy(value: number): void {
    this.maxEnergy = value;
  }

  // -- Pile queries -----------------------------------------------------------

  getHand(): Card[] {
    return this.hand.map((c) => ({ ...c }));
  }

  getDrawPileSize(): number {
    return this.drawPile.length;
  }

  getDiscardPile(): Card[] {
    return this.discardPile.map((c) => ({ ...c }));
  }

  getExhaustPile(): Card[] {
    return this.exhaustPile.map((c) => ({ ...c }));
  }

  // -- Shuffle ----------------------------------------------------------------

  shuffleDrawPile(): void {
    // Fisher-Yates shuffle
    const arr = this.drawPile;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  shuffleDiscardIntoDrawPile(): void {
    while (this.discardPile.length > 0) {
      this.drawPile.push(this.discardPile.pop()!);
    }
    this.shuffleDrawPile();
  }

  // -- Serialization ----------------------------------------------------------

  save(): string {
    return JSON.stringify({
      drawPile: this.drawPile,
      hand: this.hand,
      discardPile: this.discardPile,
      exhaustPile: this.exhaustPile,
      energy: this.energy,
      maxEnergy: this.maxEnergy,
    });
  }

  load(json: string): void {
    try {
      const data = JSON.parse(json);
      if (Array.isArray(data.drawPile)) this.drawPile = data.drawPile;
      if (Array.isArray(data.hand)) this.hand = data.hand;
      if (Array.isArray(data.discardPile)) this.discardPile = data.discardPile;
      if (Array.isArray(data.exhaustPile)) this.exhaustPile = data.exhaustPile;
      if (typeof data.energy === 'number') this.energy = data.energy;
      if (typeof data.maxEnergy === 'number') this.maxEnergy = data.maxEnergy;
    } catch {
      // corrupted data
    }
  }
}

export type { CardSystemConfig, Card, CardEffect } from './types';
