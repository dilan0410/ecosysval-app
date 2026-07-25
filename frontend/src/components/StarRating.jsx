// frontend/src/components/StarRating.jsx
import React, { useState } from "react";
import { Star } from "lucide-react";

/**
 * Componente reutilizable de estrellas.
 * 
 * Props:
 * - value:       número actual (0-5)
 * - onChange:    función que se ejecuta al hacer click (si no se pasa, es solo lectura)
 * - size:        tamaño en px (default: 20)
 * - showNumber:  si muestra "4.5 / 5" al lado (default: false)
 * - readOnly:    fuerza modo solo lectura aunque haya onChange
 */
export default function StarRating({
  value = 0,
  onChange,
  size = 20,
  showNumber = false,
  readOnly = false,
}) {
  const [hoverValue, setHoverValue] = useState(0);
  const isInteractive = !!onChange && !readOnly;

  // El valor que se muestra: hover tiene prioridad sobre value
  const displayValue = hoverValue || value;

  return (
    <div className="inline-flex items-center gap-2">
      <div className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayValue;
          return (
            <button
              key={star}
              type="button"
              disabled={!isInteractive}
              onClick={() => isInteractive && onChange(star)}
              onMouseEnter={() => isInteractive && setHoverValue(star)}
              onMouseLeave={() => isInteractive && setHoverValue(0)}
              className={`
                transition-all
                ${isInteractive ? "cursor-pointer hover:scale-110" : "cursor-default"}
                ${!isInteractive ? "pointer-events-none" : ""}
              `}
              aria-label={`${star} de 5 estrellas`}
            >
              <Star
                size={size}
                className={`
                  transition-colors
                  ${isFilled ? "text-yellow-400 fill-yellow-400" : "text-white/20 fill-transparent"}
                `}
              />
            </button>
          );
        })}
      </div>

      {showNumber && value > 0 && (
        <span className="text-white/80 font-semibold text-sm">
          {value.toFixed(1)} / 5
        </span>
      )}
    </div>
  );
}