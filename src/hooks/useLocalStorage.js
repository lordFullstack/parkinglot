// src/hooks/useLocalStorage.js
import { useState, useCallback } from 'react';

export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch (err) {
      console.error(`Error leyendo localStorage["${key}"]`, err);
      return initialValue;
    }
  });

  const set = useCallback(
    (nextValue) => {
      setValue((prev) => {
        const resolved =
          typeof nextValue === 'function' ? nextValue(prev) : nextValue;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch (err) {
          console.error(`Error guardando localStorage["${key}"]`, err);
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, set];
}
