import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { NationalKPIs } from "@/components/dashboard/NationalKPIs";
import { ApiKPIs } from "@/components/dashboard/ApiKPIs";
import { InteractiveMap } from "@/components/dashboard/InteractiveMap";
import { ProblemFilters } from "@/components/dashboard/ProblemFilters";
import { ProblemsDistribution } from "@/components/dashboard/ProblemsDistribution";
import { SeverityChart } from "@/components/dashboard/SeverityChart";
import { AuditCoverage } from "@/components/dashboard/AuditCoverage";
import { ProblemTypeCards } from "@/components/dashboard/ProblemTypeCards";
import { CallToAction } from "@/components/dashboard/CallToAction";
import { Footer } from "@/components/dashboard/Footer";
import { Separator } from "@/components/ui/separator";
import { fetchSidewalkData, getOverallData } from "@/lib/api";
import { LabelData, ProblemFilter } from "@/lib/types";

const Index = () => {
  const [labels, setLabels] = useState<LabelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kmExplored, setKmExplored] = useState<number | null>(null);
  const [filters, setFilters] = useState<ProblemFilter>({
    types: [],
    severityRange: [1, 5],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [labelsData, statsData] = await Promise.all([
          fetchSidewalkData(),
          getOverallData()
        ]);
        setLabels(labelsData);
        if (statsData && statsData.km_explored !== undefined) {
          setKmExplored(statsData.km_explored);
        }
        setError(null);
      } catch (err) {
        console.error("Error loading Sidewalk data:", err);
        setError("No se pudo conectar con la API. Mostrando datos de ejemplo.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredLabels = labels.filter((label) => {
    // Si filters.types está vacío, todos están seleccionados
    // Si filters.types tiene elementos, solo esos están seleccionados
    // Si filters.types tiene todos los tipos, ninguno está seleccionado (no mostrar nada)
    const allTypeIds = ["CurbRamp", "Obstacle", "SurfaceProblem", "Crosswalk", "NoCurbRamp"];
    const noTypesSelected = filters.types.length === allTypeIds.length && 
      allTypeIds.every(id => filters.types.includes(id));
    
    const typeMatch = noTypesSelected 
      ? false 
      : (filters.types.length === 0 || filters.types.includes(label.label_type));
    const severityMatch = 
      label.severity >= filters.severityRange[0] && 
      label.severity <= filters.severityRange[1];
    
    // Filtro por tags de obstáculos
    // Si obstacleTags está vacío o undefined, todos los tags están seleccionados (mostrar todos)
    let obstacleTagMatch = true;
    if (label.label_type === "Obstacle" && filters.obstacleTags && filters.obstacleTags.length > 0) {
      // Si hay tags específicos seleccionados, el label debe tener al menos uno de esos tags
      const labelTags = label.tags || [];
      obstacleTagMatch = filters.obstacleTags.some((selectedTag) => 
        labelTags.includes(selectedTag)
      );
    }
    
    // Filtro por tags de problemas de superficie
    // Si surfaceProblemTags está vacío o undefined, todos los tags están seleccionados (mostrar todos)
    let surfaceProblemTagMatch = true;
    if (label.label_type === "SurfaceProblem" && filters.surfaceProblemTags && filters.surfaceProblemTags.length > 0) {
      // Si hay tags específicos seleccionados, el label debe tener al menos uno de esos tags
      const labelTags = label.tags || [];
      surfaceProblemTagMatch = filters.surfaceProblemTags.some((selectedTag) => 
        labelTags.includes(selectedTag)
      );
    }
    
    return typeMatch && severityMatch && obstacleTagMatch && surfaceProblemTagMatch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* National Context */}
        <section className="my-16">
        <h2 className="text-3xl font-bold mb-8 text-foreground">
            Contexto nacional (CENSO 2024)
          </h2>
          <NationalKPIs />
        </section>

        {/* Separator */}
        <div className="my-16 flex items-center gap-4">
          <Separator className="flex-1" />
          <div className="text-muted-foreground text-sm font-medium px-4">
            Datos de la Comuna de Santiago
          </div>
          <Separator className="flex-1" />
        </div>

        {/* API Data Section */}
        <section className="my-20">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Datos de Accesibilidad en Santiago
          </h2>
          <ApiKPIs labels={labels} loading={loading} kmExplored={kmExplored} />
        </section>

              {/* Problem Type Cards */}
        <section className="my-20">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Tipos de Problemas Detectados
          </h2>
          <ProblemTypeCards labels={labels} loading={loading} />
        </section>

        {/* Filters Section */}
        <section className="my-20">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Filtros de Accesibilidad
          </h2>
          <ProblemFilters 
            labels={filteredLabels}
            allLabels={labels}
            filters={filters}
            onFilterChange={setFilters}
          />
        </section>

        {/* Charts Grid */}
        <section className="my-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProblemsDistribution labels={filteredLabels} loading={loading} />
          <SeverityChart labels={filteredLabels} loading={loading} />
        </section>

        {/* Interactive Map */}
        <section className="my-20">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Mapa de Accesibilidad
          </h2>
          <InteractiveMap 
            labels={filteredLabels}
            loading={loading}
          />
        </section>

        {/* Coverage */}
        <section className="my-20">
          <AuditCoverage labels={filteredLabels} loading={loading} kmExplored={kmExplored} />
        </section>

  

  

        {/* CTA */}
        <section className="my-20">
          <CallToAction />
        </section>
      </main>

      <Footer />
      
      {error && (
        <div className="fixed bottom-4 right-4 bg-warning text-warning-foreground px-6 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default Index;
