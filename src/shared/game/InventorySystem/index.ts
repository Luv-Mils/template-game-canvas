/**
 * InventorySystem — Game Engine Component (GME-13)
 *
 * Grid-based inventory with item stacking, rarity, equip/unequip slots,
 * category filtering, and JSON serialization.
 */

import type { InventoryConfig, InventoryItem, InventorySlot } from './types';

export class InventorySystem {
  private slots: (InventorySlot | null)[];
  private equipped: Map<string, InventoryItem> = new Map();
  private config: InventoryConfig;

  constructor(config: InventoryConfig) {
    this.config = config;
    this.slots = new Array(config.slots).fill(null);
  }

  // -- Core operations --------------------------------------------------------

  addItem(item: InventoryItem): boolean {
    const maxStack = this.config.maxStackSize ?? 99;
    const qty = item.quantity ?? 1;

    // Try to stack with existing
    if (item.stackable) {
      for (let i = 0; i < this.slots.length; i++) {
        const slot = this.slots[i];
        if (slot && slot.item.id === item.id && slot.quantity < maxStack) {
          const space = maxStack - slot.quantity;
          const toAdd = Math.min(qty, space);
          slot.quantity += toAdd;
          if (toAdd >= qty) return true;
          // Remaining needs a new slot — continue below
          return this.addItem({ ...item, quantity: qty - toAdd });
        }
      }
    }

    // Find empty slot
    const emptyIdx = this.slots.findIndex((s) => s === null);
    if (emptyIdx === -1) return false; // inventory full

    this.slots[emptyIdx] = { item: { ...item }, quantity: qty };
    return true;
  }

  removeItem(slotIndex: number, quantity = 1): InventoryItem | null {
    const slot = this.slots[slotIndex];
    if (!slot) return null;

    const removed = { ...slot.item, quantity: Math.min(quantity, slot.quantity) };
    slot.quantity -= removed.quantity!;
    if (slot.quantity <= 0) {
      this.slots[slotIndex] = null;
    }
    return removed;
  }

  moveItem(fromSlot: number, toSlot: number): void {
    if (fromSlot === toSlot) return;
    if (fromSlot < 0 || fromSlot >= this.slots.length) return;
    if (toSlot < 0 || toSlot >= this.slots.length) return;

    const from = this.slots[fromSlot];
    const to = this.slots[toSlot];

    // Merge stacks of same item
    if (from && to && from.item.id === to.item.id && from.item.stackable) {
      const maxStack = this.config.maxStackSize ?? 99;
      const space = maxStack - to.quantity;
      const transfer = Math.min(from.quantity, space);
      to.quantity += transfer;
      from.quantity -= transfer;
      if (from.quantity <= 0) this.slots[fromSlot] = null;
      return;
    }

    // Swap
    this.slots[fromSlot] = to;
    this.slots[toSlot] = from;
  }

  getItem(slotIndex: number): InventoryItem | null {
    const slot = this.slots[slotIndex];
    return slot ? { ...slot.item, quantity: slot.quantity } : null;
  }

  getSlots(): (InventorySlot | null)[] {
    return this.slots.map((s) => s ? { item: { ...s.item }, quantity: s.quantity } : null);
  }

  // -- Equip system -----------------------------------------------------------

  equip(slotIndex: number): boolean {
    const slot = this.slots[slotIndex];
    if (!slot || !slot.item.equipSlot) return false;
    if (!this.config.equipSlots?.includes(slot.item.equipSlot)) return false;

    // Unequip existing item in that slot first
    const existing = this.equipped.get(slot.item.equipSlot);
    if (existing) {
      const emptyIdx = this.slots.findIndex((s) => s === null);
      if (emptyIdx === -1) return false; // no space for unequipped item
      this.slots[emptyIdx] = { item: existing, quantity: 1 };
    }

    this.equipped.set(slot.item.equipSlot, { ...slot.item });
    if (slot.quantity <= 1) {
      this.slots[slotIndex] = null;
    } else {
      slot.quantity -= 1;
    }

    this.config.onEquip?.(slot.item, slot.item.equipSlot);
    return true;
  }

  unequip(equipSlot: string): boolean {
    const item = this.equipped.get(equipSlot);
    if (!item) return false;

    const emptyIdx = this.slots.findIndex((s) => s === null);
    if (emptyIdx === -1) return false; // inventory full

    this.slots[emptyIdx] = { item, quantity: 1 };
    this.equipped.delete(equipSlot);

    this.config.onUnequip?.(equipSlot);
    return true;
  }

  getEquipped(): Map<string, InventoryItem> {
    return new Map(Array.from(this.equipped.entries()).map(([k, v]) => [k, { ...v }]));
  }

  getEquippedItem(slot: string): InventoryItem | null {
    const item = this.equipped.get(slot);
    return item ? { ...item } : null;
  }

  // -- Query ------------------------------------------------------------------

  findItems(predicate: (item: InventoryItem) => boolean): Array<{ item: InventoryItem; slot: number }> {
    const results: Array<{ item: InventoryItem; slot: number }> = [];
    for (let i = 0; i < this.slots.length; i++) {
      const s = this.slots[i];
      if (s && predicate(s.item)) {
        results.push({ item: { ...s.item, quantity: s.quantity }, slot: i });
      }
    }
    return results;
  }

  hasItem(itemId: string, quantity = 1): boolean {
    return this.getItemCount(itemId) >= quantity;
  }

  getItemCount(itemId: string): number {
    let count = 0;
    for (const slot of this.slots) {
      if (slot && slot.item.id === itemId) count += slot.quantity;
    }
    return count;
  }

  isFull(): boolean {
    return this.slots.every((s) => s !== null);
  }

  getEmptySlots(): number {
    return this.slots.filter((s) => s === null).length;
  }

  getItemsByCategory(category: string): Array<{ item: InventoryItem; slot: number }> {
    return this.findItems((item) => item.category === category);
  }

  // -- Serialization ----------------------------------------------------------

  save(): string {
    return JSON.stringify({
      slots: this.slots,
      equipped: Object.fromEntries(this.equipped),
    });
  }

  load(json: string): void {
    try {
      const data = JSON.parse(json);
      if (Array.isArray(data.slots)) {
        this.slots = new Array(this.config.slots).fill(null);
        for (let i = 0; i < Math.min(data.slots.length, this.config.slots); i++) {
          this.slots[i] = data.slots[i];
        }
      }
      if (data.equipped && typeof data.equipped === 'object') {
        this.equipped = new Map(Object.entries(data.equipped));
      }
    } catch {
      // corrupted data
    }
  }
}

export type { InventoryConfig, InventoryItem, InventorySlot, ItemRarity } from './types';
