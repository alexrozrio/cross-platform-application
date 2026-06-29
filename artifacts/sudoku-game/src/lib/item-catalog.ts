import colourThemes from '@/config/colour-themes.json';

export type ItemType = "color_theme" | "font" | "icon_set";

const _colorThemeCosts = Object.fromEntries(
  colourThemes.map(t => [t.id, t.gems])
);

export const ITEM_COSTS: Record<ItemType, Record<string, number>> = {
  color_theme: _colorThemeCosts,
  font: {
    default: 0,
    modern: 50,
    elegant: 50,
    rounded: 50,
    playful: 75,
    mono: 75,
    classic: 75,
    handwritten: 75,
  },
  icon_set: {
    shapes: 0,
    adventure: 0,
    superhero: 100,
    ocean: 200,
    jungle: 300,
    space: 300,
  },
};

export function isFreeItem(type: ItemType, id: string): boolean {
  return (ITEM_COSTS[type][id] ?? 999) === 0;
}

export function getItemCost(type: ItemType, id: string): number {
  return ITEM_COSTS[type][id] ?? 999;
}
