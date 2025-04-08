import { useState, useCallback } from "react";
import { Formity, ReturnOutput } from "@formity/react";
import "tailwindcss/tailwind.css";

export default function CrearSolicitud() {
  const [values, setValues] = useState<ReturnOutput<Values> | null>(null);

  const onReturn = useCallback((values: ReturnOutput<Values>) => {
    setValues(values);
  }, []);

  if (values) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-black text-white">
        <pre className="bg-gray-800 p-4 rounded-lg text-left overflow-auto">
          {JSON.stringify(values, null, 2)}
        </pre>
        <button
          onClick={() => setValues(null)}
          className="mt-6 bg-indigo-500 text-white px-6 py-3 rounded-full"
        >
          Restart
        </button>
      </div>
    );
  }

  return <Formity schema={schema} onReturn={onReturn} />;
}