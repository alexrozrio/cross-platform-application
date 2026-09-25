import { createContext, useContext } from "react";

export const GameResultVisibilityContext = createContext<(visible: boolean) => void>(() => {});

export function useGameResultVisibility() {
  return useContext(GameResultVisibilityContext);
}