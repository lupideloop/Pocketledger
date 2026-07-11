import { useState } from "react";

const compute = (a, b, operator) => {
  if (operator === "+") return a + b;
  if (operator === "−") return a - b;
  if (operator === "×") return a * b;
  return b === 0 ? NaN : a / b;
};

export default function useCalculator() {
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waiting, setWaiting] = useState(false);

  const clear = () => { setDisplay("0"); setStored(null); setOperator(null); setWaiting(false); };
  const chooseOperator = (nextOperator) => {
    const current = Number(display);
    if (stored !== null && operator && !waiting) {
      const result = compute(stored, current, operator);
      setDisplay(Number.isFinite(result) ? String(result) : "Error");
      setStored(result);
    } else setStored(current);
    setOperator(nextOperator);
    setWaiting(true);
  };
  const press = (key) => {
    if (/^\d$/.test(key)) return setDisplay(value => waiting || value === "0" || value === "Error" ? key : value + key), setWaiting(false);
    if (key === ".") return setDisplay(value => waiting || value === "Error" ? "0." : value.includes(".") ? value : value + "."), setWaiting(false);
    if (key === "C") return clear();
    if (key === "±") return setDisplay(value => String(-Number(value)));
    if (key === "%") return setDisplay(value => String(Number(value) / 100));
    if (key === "⌫") return setDisplay(value => value.length > 1 ? value.slice(0, -1) : "0");
    if (key === "=" && operator && stored !== null) {
      const result = compute(stored, Number(display), operator);
      setDisplay(Number.isFinite(result) ? String(result) : "Error");
      setStored(null); setOperator(null); setWaiting(true); return;
    }
    if (["+", "−", "×", "÷"].includes(key)) chooseOperator(key);
  };
  return { display, press, clear };
}