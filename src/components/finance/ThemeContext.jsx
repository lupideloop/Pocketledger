import { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const ThemeContext = createContext();

export const CURRENCIES = [
  { code: "USD", symbol: "$", locale: "en-US", label: "USD – US Dollar" },
  { code: "EUR", symbol: "€", locale: "de-DE", label: "EUR – Euro" },
  { code: "GBP", symbol: "£", locale: "en-GB", label: "GBP – British Pound" },
  { code: "JPY", symbol: "¥", locale: "ja-JP", label: "JPY – Japanese Yen" },
  { code: "CAD", symbol: "CA$", locale: "en-CA", label: "CAD – Canadian Dollar" },
  { code: "AUD", symbol: "A$", locale: "en-AU", label: "AUD – Australian Dollar" },
  { code: "CHF", symbol: "CHF", locale: "de-CH", label: "CHF – Swiss Franc" },
  { code: "CNY", symbol: "¥", locale: "zh-CN", label: "CNY – Chinese Yuan" },
  { code: "INR", symbol: "₹", locale: "en-IN", label: "INR – Indian Rupee" },
  { code: "BRL", symbol: "R$", locale: "pt-BR", label: "BRL – Brazilian Real" },
  { code: "MXN", symbol: "MX$", locale: "es-MX", label: "MXN – Mexican Peso" },
  { code: "SEK", symbol: "kr", locale: "sv-SE", label: "SEK – Swedish Krona" },
  { code: "NOK", symbol: "kr", locale: "nb-NO", label: "NOK – Norwegian Krone" },
  { code: "DKK", symbol: "kr", locale: "da-DK", label: "DKK – Danish Krone" },
  { code: "SGD", symbol: "S$", locale: "en-SG", label: "SGD – Singapore Dollar" },
];

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("hf-theme");
      if (saved === "dark") return true;
      if (saved === "light") return false;
      // Respect system dark mode preference on first launch (Android mandatory)
      return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    } catch { return false; }
  });

  const [currency, setCurrency] = useState(() => {
    try {
      const saved = localStorage.getItem("hf-currency");
      return CURRENCIES.find(c => c.code === saved) || CURRENCIES[0];
    } catch { return CURRENCIES[0]; }
  });

  useEffect(() => {
    base44.auth.me().then(async user => {
      if (user.theme_preference) setDark(user.theme_preference === "dark");
      if (user.currency_preference) {
        const remoteCurrency = CURRENCIES.find(c => c.code === user.currency_preference) || CURRENCIES[0];
        setCurrency(remoteCurrency);
        try { localStorage.setItem("hf-currency", remoteCurrency.code); } catch {}
      }
      if (!user.theme_preference || !user.currency_preference) {
        await base44.auth.updateMe({
          theme_preference: user.theme_preference || (dark ? "dark" : "light"),
          currency_preference: user.currency_preference || currency.code,
        });
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    try { localStorage.setItem("hf-theme", dark ? "dark" : "light"); } catch {}
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  const toggle = () => {
    setDark(current => {
      const next = !current;
      base44.auth.updateMe({ theme_preference: next ? "dark" : "light" }).catch(() => {});
      return next;
    });
  };

  const changeCurrency = (code) => {
    const found = CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
    setCurrency(found);
    try { localStorage.setItem("hf-currency", found.code); } catch {}
    base44.auth.updateMe({ currency_preference: found.code }).catch(() => {});
  };

  const fmt = (n) => {
    const num = n || 0;
    return num.toLocaleString(currency.locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <ThemeContext.Provider value={{ dark, toggle, currency, changeCurrency, fmt }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);