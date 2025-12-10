import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface PromoterLocation {
  id: number;
  lat: number;
  lng: number;
  name: string;
  active: boolean;
}

interface HeatMapProps {
  promoters: PromoterLocation[];
}

export function HeatMap({ promoters }: HeatMapProps) {
  const activePromoters = promoters.filter(p => p.active);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Mapa de Promotores Activos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[400px] bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Mapa de calor de promotores activos
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {activePromoters.length} promotores activos en el mapa
              </p>
            </div>
          </div>

          <svg className="w-full h-full absolute inset-0" xmlns="http://www.w3.org/2000/svg">
            {activePromoters.map((promoter, index) => {
              const x = ((promoter.lng + 180) / 360) * 100;
              const y = ((90 - promoter.lat) / 180) * 100;
              const opacity = 0.3 + (Math.random() * 0.4);

              return (
                <g key={promoter.id}>
                  <circle
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="20"
                    fill="rgba(59, 130, 246, 0.1)"
                    className="animate-pulse"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  />
                  <circle
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="8"
                    fill={`rgba(59, 130, 246, ${opacity})`}
                  />
                  <circle
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="3"
                    fill="rgb(37, 99, 235)"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{activePromoters.length}</div>
            <div className="text-xs text-slate-500">Activos ahora</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-600">{promoters.length}</div>
            <div className="text-xs text-slate-500">Total promotores</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round((activePromoters.length / promoters.length) * 100)}%
            </div>
            <div className="text-xs text-slate-500">Tasa de actividad</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.floor(Math.random() * 50 + 20)}
            </div>
            <div className="text-xs text-slate-500">Zonas cubiertas</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
