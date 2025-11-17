import { ExternalLink } from "lucide-react";

export const Footer = () => {
  const now = new Date();
  const formattedDate = now.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <footer className="bg-muted/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Fuentes de Datos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a 
                  href="https://sidewalk-rancagua.cs.washington.edu" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center gap-1"
                >
                  Sidewalk Project API
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.senadis.gob.cl" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center gap-1"
                >
                  SENADIS Chile
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.ine.gob.cl" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center gap-1"
                >
                  INE - Instituto Nacional de Estadísticas
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Acerca del Proyecto</h3>
            <p className="text-sm text-muted-foreground">
              Este dashboard visualiza datos de accesibilidad universal en Santiago, Chile, 
              combinando información demográfica nacional con datos en tiempo real de 
              auditorías de accesibilidad urbana.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Última Actualización</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {formattedDate}
            </p>
            <p className="text-xs text-muted-foreground">
              © 2025 Dashboard de Accesibilidad Santiago
              <br />
              Powered by Sidewalk Project - University of Washington
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
