export const Header = () => {
  return (
    <header className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-700" />
      
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* National context - smaller */}
        <div className="mb-8 text-primary-foreground/90">
          <p className="text-sm font-medium mb-2">Contexto Nacional - Chile</p>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="font-bold text-xl">1.9 M</span>
              <span className="ml-2">personas con discapacidad </span>
            </div>
            <div>
              <span className="font-bold text-xl">1 de cada 10</span>
              <span className="ml-2">reporta barreras de movilidad</span>
            </div>
          </div>
        </div>

        {/* Local hero - larger */}
        <div className="text-primary-foreground">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Dashboard de Accesibilidad
            <span className="block mt-2 text-3xl md:text-4xl lg:text-5xl">Comuna de Santiago</span>
          </h1>
          <p className="text-xl md:text-2xl opacity-95 max-w-3xl">
            Visualización en tiempo real de barreras arquitectónicas y datos de accesibilidad universal
          </p>
        </div>
      </div>

      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 48h1440V0s-187.5 48-360 48S720 0 720 0 532.5 48 360 48 0 0 0 0v48z" fill="currentColor" className="text-background"/>
        </svg>
      </div>
    </header>
  );
};
