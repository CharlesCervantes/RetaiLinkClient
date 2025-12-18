import React from "react";
import { Button } from "./button";
import { useTheme } from "../../hooks/useTheme";

interface ThemeToggleProps {
  size?: "sm" | "md" | "lg";
  variant?: "sidebar" | "header" | "floating" | "default";
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = "md",
  variant = "default",
  showLabel = true,
  className,
}) => {
  const { actualTheme, toggleTheme, isLight, isDark } = useTheme();

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-8 px-2 text-xs";
      case "lg":
        return "h-12 px-4 text-base";
      default:
        return "h-10 px-3 text-sm";
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "header":
        return "bg-card-bg border border-border hover:bg-hover text-primary";
      case "floating":
        return "bg-accent text-black hover:bg-black hover:text-accent shadow-lg";
      default: // sidebar
        return "bg-transparent hover:bg-hover text-primary border border-border";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "lg":
        return "text-lg";
      default:
        return "text-base";
    }
  };

  return (
    <Button
      onClick={toggleTheme}
      className={`
        ${getSizeClasses()}
        ${getVariantClasses()}
        flex items-center gap-2 transition-all duration-300 ease-in-out
        transform hover:scale-105 active:scale-95
        ${className || ""}
      `}
      title={`Cambiar a tema ${isLight ? "oscuro" : "claro"}`}
    >
      {/* Contenedor del ícono con animación */}
      <div className="relative overflow-hidden flex items-center justify-center">
        {/* Sol - Tema claro */}
        <div
          className={`
            ${getIconSize()} transition-all duration-500 ease-in-out
            ${
              isLight
                ? "transform translate-y-0 opacity-100 rotate-0"
                : "transform -translate-y-8 opacity-0 rotate-180"
            }
            absolute
          `}
        >
          ☀️
        </div>

        {/* Luna - Tema oscuro */}
        <div
          className={`
            ${getIconSize()} transition-all duration-500 ease-in-out
            ${
              isDark
                ? "transform translate-y-0 opacity-100 rotate-0"
                : "transform translate-y-8 opacity-0 -rotate-180"
            }
            absolute
          `}
        >
          🌙
        </div>
      </div>

      {/* Etiqueta de texto */}
      {showLabel && (
        <span className="font-medium">{isLight ? "Oscuro" : "Claro"}</span>
      )}

      {/* Indicador de estado */}
      <div className="flex items-center gap-1">
        <div
          className={`
            w-2 h-2 rounded-full transition-all duration-300
            ${isLight ? "bg-warning" : "bg-info"}
          `}
        />
      </div>
    </Button>
  );
};

// Versión compacta solo con ícono
export const ThemeToggleCompact: React.FC<{ className?: string }> = ({
  className,
}) => (
  <ThemeToggle
    size="sm"
    variant="floating"
    showLabel={false}
    className={`w-10 h-10 rounded-full ${className || ""}`}
  />
);

// Versión para el header
export const ThemeToggleHeader: React.FC<{ className?: string }> = ({
  className,
}) => (
  <ThemeToggle
    size="md"
    variant="header"
    showLabel={false}
    className={`rounded-lg ${className || ""}`}
  />
);
