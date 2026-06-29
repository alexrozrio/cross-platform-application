import colourThemes from '@/config/colour-themes.json';
import fontThemes from '@/config/font-themes.json';
import iconSets from '@/config/icon-sets.json';

export type ItemType = "color_theme" | "font" | "icon_set";

export const ITEM_COSTS: Record<ItemType, Record<string, number>> = {
  color_theme: Object.fromEntries(colourThemes.map(t => [t.id, t.gems])),
  font:        Object.fromEntries(fontThemes.map(t => [t.id, t.gems])),
  icon_set:    Object.fromEntries(iconSets.map(t => [t.id, t.gems])),
};

export function isFreeItem(type: ItemType, id: string): boolean {
  return (ITEM_COSTS[type][id] ?? 999) === 0;
}

export function getItemCost(type: ItemType, id: string): number {
  return ITEM_COSTS[type][id] ?? 999;
}
