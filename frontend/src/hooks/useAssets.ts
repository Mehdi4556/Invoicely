import { useContext } from "react";
import { AssetsContext } from "../contexts/assets-context.types";

export function useAssets() {
  const context = useContext(AssetsContext);
  if (context === undefined) {
    throw new Error("useAssets must be used within an AssetsProvider");
  }
  return context;
}

