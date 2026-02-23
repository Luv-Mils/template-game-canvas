export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  rarity?: ItemRarity;
  stackable?: boolean;
  quantity?: number;
  category?: string;
  stats?: Record<string, number>;
  equipSlot?: string;
}

export interface InventorySlot {
  item: InventoryItem;
  quantity: number;
}

export interface InventoryConfig {
  slots: number;
  columns?: number;
  categories?: string[];
  equipSlots?: string[];
  maxStackSize?: number;
  onUse?: (item: InventoryItem) => void;
  onDrop?: (item: InventoryItem) => void;
  onEquip?: (item: InventoryItem, slot: string) => void;
  onUnequip?: (slot: string) => void;
}
