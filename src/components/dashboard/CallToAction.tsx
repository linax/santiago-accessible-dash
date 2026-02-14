import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Users, TrendingUp } from "lucide-react";

export const CallToAction = () => {
  return (
    <Card className="shadow-lg bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 border-primary/20">
      <CardContent className="p-8 md:p-12">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            ¡Contribuye a Mejorar la Accesibilidad en Chile!
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8">
            Únete a la comunidad de Sidewalk Project en alianza con Ciudad Fácil, en Chil, y ayuda a mapear las barreras de accesibilidad en tu ciudad
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col items-center gap-2">
              <Users className="h-10 w-10 text-primary" />
              <div className="text-2xl font-bold text-foreground">1,200+</div>
              <div className="text-sm text-muted-foreground">Contribuidores activos</div>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <TrendingUp className="h-10 w-10 text-success" />
              <div className="text-2xl font-bold text-foreground">450km</div>
              <div className="text-sm text-muted-foreground">Calles mapeadas</div>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <ExternalLink className="h-10 w-10 text-warning" />
              <div className="text-2xl font-bold text-foreground">2 ciudades</div>
              <div className="text-sm text-muted-foreground">En Chile</div>
            </div>
          </div>

          <Button 
            size="lg"
            className="text-lg px-8 py-6"
            onClick={() => window.open("https://sidewalk-rancagua.cs.washington.edu", "_blank")}
          >
            Comenzar a Contribuir
            <ExternalLink className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
