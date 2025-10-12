import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AssetsContextType {
  signature: string;
  setSignature: (signature: string) => void;
  companyLogo: string;
  setCompanyLogo: (logo: string) => void;
  clearSignature: () => void;
  clearLogo: () => void;
}

const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

export function AssetsProvider({ children }: { children: ReactNode }) {
  const [signature, setSignatureState] = useState<string>(() => {
    const saved = localStorage.getItem("invoicely-signature");
    return saved || "";
  });

  const [companyLogo, setCompanyLogoState] = useState<string>(() => {
    const saved = localStorage.getItem("invoicely-company-logo");
    return saved || "";
  });

  useEffect(() => {
    if (signature) {
      localStorage.setItem("invoicely-signature", signature);
    } else {
      localStorage.removeItem("invoicely-signature");
    }
  }, [signature]);

  useEffect(() => {
    if (companyLogo) {
      localStorage.setItem("invoicely-company-logo", companyLogo);
    } else {
      localStorage.removeItem("invoicely-company-logo");
    }
  }, [companyLogo]);

  const setSignature = (sig: string) => {
    setSignatureState(sig);
  };

  const setCompanyLogo = (logo: string) => {
    setCompanyLogoState(logo);
  };

  const clearSignature = () => {
    setSignatureState("");
    localStorage.removeItem("invoicely-signature");
  };

  const clearLogo = () => {
    setCompanyLogoState("");
    localStorage.removeItem("invoicely-company-logo");
  };

  return (
    <AssetsContext.Provider
      value={{
        signature,
        setSignature,
        companyLogo,
        setCompanyLogo,
        clearSignature,
        clearLogo,
      }}
    >
      {children}
    </AssetsContext.Provider>
  );
}

export function useAssets() {
  const context = useContext(AssetsContext);
  if (context === undefined) {
    throw new Error("useAssets must be used within an AssetsProvider");
  }
  return context;
}

