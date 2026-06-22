export type ItemType = "color_theme" | "font" | "icon_set";

export const ITEM_COSTS: Record<ItemType, Record<string, number>> = {
  color_theme: {
    light: 0,
    dark: 0,
    ocean: 100,
    forest: 150,
    sunset: 150,
    midnight: 200,
    rose: 200,
  },
  font: {
    default: 0,
    modern: 50,
    elegant: 50,
    rounded: 50,
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
