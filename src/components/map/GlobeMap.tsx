import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { useTheme } from 'next-themes';

interface PointData {
  lat: number;
  lng: number;
  city: string;
  region: string;
  country: string;
  userId: string;
  lastAccess: string;
}

interface GlobeMapProps {
  points: PointData[];
  className?: string;
  width?: number;
  height?: number;
}

function getPointColor(index: number): string {
  const colors = ['#22c55e', '#3b82f6', '#eab308', '#a855f7', '#ec4899', '#06b6d4', '#f97316'];
  return colors[index % colors.length];
}

export function GlobeMap({ points, className, width, height }: GlobeMapProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [hoveredPoint, setHoveredPoint] = useState<PointData | null>(null);

  const globeData = useMemo(() => {
    return points.map((p, i) => ({
      ...p,
      color: getPointColor(i),
      radius: 0.15,
    }));
  }, [points]);

  const arcsData = useMemo(() => {
    if (globeData.length < 2) return [];
    const first = globeData[0];
    return globeData.slice(1).map(p => ({
      startLat: first.lat,
      startLng: first.lng,
      endLat: p.lat,
      endLng: p.lng,
      color: p.color,
    }));
  }, [globeData]);

  const handlePointHover = useCallback((point: any) => {
    setHoveredPoint(point || null);
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.8;
    }
  }, []);

  return (
    <div className={`relative ${className ?? ''}`}>
      <Globe
        ref={globeRef}
        width={width ?? 600}
        height={height ?? 600}
        globeImageUrl={isDark
          ? '//unpkg.com/three-globe/example/img/earth-dark.jpg'
          : '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
        }
        backgroundImageUrl={isDark
          ? '//unpkg.com/three-globe/example/img/night-sky.png'
          : undefined
        }
        backgroundColor="rgba(0,0,0,0)"

        pointsData={globeData}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.01}
        pointRadius="radius"
        pointsMerge={true}
        onPointHover={handlePointHover}

        arcsData={arcsData}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcDashLength={0.5}
        arcDashGap={0.2}
        arcDashAnimateTime={3000}

        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.15}

        enablePointerInteraction={true}
      />
      {hoveredPoint && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 text-sm shadow-lg pointer-events-none z-10 whitespace-nowrap">
          <div className="font-semibold">{hoveredPoint.city}, {hoveredPoint.region}</div>
          <div className="text-muted-foreground">{hoveredPoint.country}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(hoveredPoint.lastAccess).toLocaleDateString('pt-BR', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </div>
        </div>
      )}
    </div>
  );
}
