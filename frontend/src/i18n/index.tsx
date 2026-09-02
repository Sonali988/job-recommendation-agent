// LC-F6 I18nProvider — minimal t() shim; English shipped, locale-ready.
import { createContext, useContext, type ReactNode } from "react";
import { en } from "./en";

const bundles: Record<string, Record<string, string>> = { en };

interface I18n { t: (key: string) => string; locale: string; }
const I18nContext = createContext<I18n>({ t: (k) => k, locale: "en" });

export function I18nProvider({ children, locale = "en" }: { children: ReactNode; locale?: string }) {
  const bundle = bundles[locale] || en;
  const t = (key: string) => bundle[key] ?? key;
  return <I18nContext.Provider value={{ t, locale }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
