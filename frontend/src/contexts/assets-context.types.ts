import { createContext } from "react";

export interface AssetsContextType {
  signature: string;
  setSignature: (signature: string) => void;
  companyLogo: string;
  setCompanyLogo: (logo: string) => void;
  clearSignature: () => void;
  clearLogo: () => void;
}

export const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

