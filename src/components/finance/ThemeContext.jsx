import { createContext, useContext, useState, useEffect } from "react";

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
    try { return localStorage.getItem("hf-theme") === "dark"; } catch { return false; }
  });

  const [currency, setCurrency] = useState(() => {
    try {
      const saved = localStorage.getItem("hf-currency");
      return CURRENCIES.find(c => c.code === saved) || CURRENCIES[0];
    } catch { return CURRENCIES[0]; }
  });

  useEffect(() => {
    try { localStorage.setItem("hf-theme", dark ? "dark" : "light"); } catch {}
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  const changeCurrency = (code) => {
    const found = CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
    setCurrency(found);
    try { localStorage.setItem("hf-currency", found.code); } catch {}
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
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d), currency, changeCurrency, fmt }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);