import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { NationalKPIs } from "@/components/dashboard/NationalKPIs";
import { ApiKPIs } from "@/components/dashboard/ApiKPIs";
import { InteractiveMap } from "@/components/dashboard/InteractiveMap";
import { ProblemsDistribution } from "@/components/dashboard/ProblemsDistribution";
import { SeverityChart } from "@/components/dashboard/SeverityChart";
import { AuditCoverage } from "@/components/dashboard/AuditCoverage";
import { ProblemTypeCards } from "@/components/dashboard/ProblemTypeCards";
import { TimelineChart } from "@/components/dashboard/TimelineChart";
import { CriticalZones } from "@/components/dashboard/CriticalZones";
import { CallToAction } from "@/components/dashboard/CallToAction";
import { Footer } from "@/components/dashboard/Footer";
import { fetchSidewalkData } from "@/lib/api";
import { LabelData, ProblemFilter } from "@/lib/types";

const Index = () => {
  const [labels, setLabels] = useState<LabelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProblemFilter>({
    types: [],
    severityRange: [1, 5],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchSidewalkData();
        setLabels(data);
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
    const typeMatch = filters.types.length === 0 || filters.types.includes(label.label_type);
    const severityMatch = 
      label.severity >= filters.severityRange[0] && 
      label.severity <= filters.severityRange[1];
    return typeMatch && severityMatch;
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


        {/* API Data Section */}
        <section className="my-20">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Datos de Accesibilidad en Santiago
          </h2>
          <ApiKPIs labels={filteredLabels} loading={loading} />
        </section>

        {/* Interactive Map */}
        <section className="my-20">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Mapa de Problemas de Accesibilidad
          </h2>
          <InteractiveMap 
            labels={filteredLabels} 
            loading={loading}
            filters={filters}
            onFilterChange={setFilters}
          />
        </section>

        {/* Charts Grid */}
        <section className="my-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProblemsDistribution labels={filteredLabels} loading={loading} />
          <SeverityChart labels={filteredLabels} loading={loading} />
        </section>

        {/* Coverage */}
        <section className="my-20">
          <AuditCoverage labels={filteredLabels} loading={loading} />
        </section>

        {/* Problem Type Cards */}
        <section className="my-20">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Tipos de Problemas Detallados
          </h2>
          <ProblemTypeCards labels={filteredLabels} loading={loading} />
        </section>

        {/* Timeline */}
        <section className="my-20">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Evolución Temporal
          </h2>
          <TimelineChart labels={filteredLabels} loading={loading} />
        </section>

        {/* Critical Zones */}
        <section className="my-20">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Zonas Críticas
          </h2>
          <CriticalZones labels={filteredLabels} loading={loading} />
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
