import { useEffect } from "react";
import AppRouter from "./router";
import { useTheme } from "./hooks/useTheme";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const { actualTheme } = useTheme();

  // Aplicar clase del tema al HTML root para compatibilidad completa
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", actualTheme);

    // Agregar meta tag para tema en navegadores móviles
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute(
        "content",
        actualTheme === "dark" ? "#0d0d0d" : "#ffffff",
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = actualTheme === "dark" ? "#0d0d0d" : "#ffffff";
      document.head.appendChild(meta);
    }
  }, [actualTheme]);

  return (
    <div className="theme-transition">
      <Toaster position="top-center" expand={true} richColors closeButton />
      <AppRouter />
    </div>
  );
}
