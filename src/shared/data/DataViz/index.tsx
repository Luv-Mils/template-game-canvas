/**
 * DataViz -- Data Component (DAT-04)
 *
 * SVG chart components: bar, line, pie, donut, area, sparkline.
 * Theme-aware colors via useTheme() hex values for SVG fill/stroke.
 * No chart library — pure SVG elements.
 */

import React, { useState, useMemo } from 'react';
import { useTheme } from '../../foundation';
import type { DataVizConfig, DataVizDataset } from './types';

// -- Helpers ------------------------------------------------------------------

function resolveColor(
  color: string | undefined,
  index: number,
  palette: string[],
): string {
  if (color && color.startsWith('#')) return color;
  return palette[index % palette.length];
}

// -- Bar Chart ----------------------------------------------------------------

function BarChart({
  config,
  palette,
  w,
  h,
}: {
  config: DataVizConfig;
  palette: string[];
  w: number;
  h: number;
}) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const { labels, datasets } = config.data;

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const allValues = datasets.flatMap((d) => d.values);
  const maxVal = Math.max(...allValues, 1);

  const barGroupWidth = chartW / labels.length;
  const barWidth = Math.max(4, (barGroupWidth * 0.7) / datasets.length);
  const groupPad = barGroupWidth * 0.15;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`}>
      {/* Grid lines */}
      {config.showGrid !== false &&
        [0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = padding.top + chartH * (1 - pct);
          return (
            <g key={pct}>
              <line
                x1={padding.left} y1={y} x2={w - padding.right} y2={y}
                stroke="currentColor" strokeOpacity={0.1}
              />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize={10} fill="currentColor" fillOpacity={0.5}>
                {Math.round(maxVal * pct)}
              </text>
            </g>
          );
        })}

      {/* Bars */}
      {datasets.map((ds, di) =>
        ds.values.map((val, li) => {
          const barH = (val / maxVal) * chartH;
          const x = padding.left + groupPad + li * barGroupWidth + di * barWidth;
          const y = padding.top + chartH - barH;
          const color = resolveColor(ds.color, di, palette);

          return (
            <rect
              key={`${di}-${li}`}
              x={x} y={y} width={barWidth} height={barH}
              rx={2} fill={color}
              className={config.animate !== false ? 'transition-all duration-500' : ''}
              onMouseEnter={(e) =>
                config.showTooltip !== false &&
                setTooltip({ x: e.clientX, y: e.clientY, text: `${ds.label}: ${val}` })
              }
              onMouseLeave={() => setTooltip(null)}
            />
          );
        }),
      )}

      {/* X-axis labels */}
      {labels.map((label, i) => (
        <text
          key={i}
          x={padding.left + i * barGroupWidth + barGroupWidth / 2}
          y={h - 10}
          textAnchor="middle" fontSize={11} fill="currentColor" fillOpacity={0.6}
        >
          {label}
        </text>
      ))}

      {/* Tooltip */}
      {tooltip && (
        <foreignObject x={0} y={0} width={w} height={h} style={{ pointerEvents: 'none' }}>
          <div
            className="fixed z-50 px-2 py-1 text-xs bg-surface border border-border rounded shadow-lg text-foreground"
            style={{ left: tooltip.x + 10, top: tooltip.y - 30 }}
          >
            {tooltip.text}
          </div>
        </foreignObject>
      )}
    </svg>
  );
}

// -- Line / Area Chart --------------------------------------------------------

function LineAreaChart({
  config,
  palette,
  w,
  h,
  filled,
}: {
  config: DataVizConfig;
  palette: string[];
  w: number;
  h: number;
  filled: boolean;
}) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const { labels, datasets } = config.data;

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const allValues = datasets.flatMap((d) => d.values);
  const maxVal = Math.max(...allValues, 1);
  const stepX = labels.length > 1 ? chartW / (labels.length - 1) : chartW;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`}>
      {/* Grid */}
      {config.showGrid !== false &&
        [0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = padding.top + chartH * (1 - pct);
          return (
            <g key={pct}>
              <line x1={padding.left} y1={y} x2={w - padding.right} y2={y} stroke="currentColor" strokeOpacity={0.1} />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize={10} fill="currentColor" fillOpacity={0.5}>
                {Math.round(maxVal * pct)}
              </text>
            </g>
          );
        })}

      {datasets.map((ds, di) => {
        const color = resolveColor(ds.color, di, palette);
        const points = ds.values.map((val, i) => ({
          x: padding.left + i * stepX,
          y: padding.top + chartH - (val / maxVal) * chartH,
        }));
        const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ');

        return (
          <g key={di}>
            {filled && (
              <polygon
                points={`${padding.left},${padding.top + chartH} ${pointsStr} ${points[points.length - 1]?.x ?? padding.left},${padding.top + chartH}`}
                fill={color} fillOpacity={0.15}
              />
            )}
            <polyline points={pointsStr} fill="none" stroke={color} strokeWidth={2} />
            {points.map((p, i) => (
              <circle
                key={i} cx={p.x} cy={p.y} r={3} fill={color}
                onMouseEnter={(e) =>
                  config.showTooltip !== false &&
                  setTooltip({ x: e.clientX, y: e.clientY, text: `${ds.label}: ${ds.values[i]}` })
                }
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </g>
        );
      })}

      {/* X-axis labels */}
      {labels.map((label, i) => (
        <text key={i} x={padding.left + i * stepX} y={h - 10} textAnchor="middle" fontSize={11} fill="currentColor" fillOpacity={0.6}>
          {label}
        </text>
      ))}

      {tooltip && (
        <foreignObject x={0} y={0} width={w} height={h} style={{ pointerEvents: 'none' }}>
          <div className="fixed z-50 px-2 py-1 text-xs bg-surface border border-border rounded shadow-lg text-foreground" style={{ left: tooltip.x + 10, top: tooltip.y - 30 }}>
            {tooltip.text}
          </div>
        </foreignObject>
      )}
    </svg>
  );
}

// -- Pie / Donut Chart --------------------------------------------------------

function PieDonutChart({
  config,
  palette,
  w,
  h,
  donut,
}: {
  config: DataVizConfig;
  palette: string[];
  w: number;
  h: number;
  donut: boolean;
}) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const values = config.data.datasets[0]?.values ?? [];
  const labels = config.data.labels;
  const total = values.reduce((a, b) => a + b, 0) || 1;

  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(cx, cy) - 20;
  const innerR = donut ? r * 0.55 : 0;

  const segments = useMemo(() => {
    let startAngle = -Math.PI / 2;
    return values.map((val, i) => {
      const angle = (val / total) * 2 * Math.PI;
      const endAngle = startAngle + angle;
      const largeArc = angle > Math.PI ? 1 : 0;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const ix1 = cx + innerR * Math.cos(startAngle);
      const iy1 = cy + innerR * Math.sin(startAngle);
      const ix2 = cx + innerR * Math.cos(endAngle);
      const iy2 = cy + innerR * Math.sin(endAngle);

      const d = donut
        ? `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      startAngle = endAngle;
      return { d, color: resolveColor(config.data.datasets[0]?.color, i, palette), label: labels[i], value: val };
    });
  }, [values, labels, total, cx, cy, r, innerR, donut, palette, config.data.datasets]);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`}>
      {segments.map((seg, i) => (
        <path
          key={i} d={seg.d} fill={seg.color}
          stroke="currentColor" strokeOpacity={0.1} strokeWidth={1}
          onMouseEnter={(e) =>
            config.showTooltip !== false &&
            setTooltip({ x: e.clientX, y: e.clientY, text: `${seg.label}: ${seg.value}` })
          }
          onMouseLeave={() => setTooltip(null)}
        />
      ))}
      {tooltip && (
        <foreignObject x={0} y={0} width={w} height={h} style={{ pointerEvents: 'none' }}>
          <div className="fixed z-50 px-2 py-1 text-xs bg-surface border border-border rounded shadow-lg text-foreground" style={{ left: tooltip.x + 10, top: tooltip.y - 30 }}>
            {tooltip.text}
          </div>
        </foreignObject>
      )}
    </svg>
  );
}

// -- Sparkline ----------------------------------------------------------------

function Sparkline({
  values,
  color,
  w,
  h,
}: {
  values: number[];
  color: string;
  w: number;
  h: number;
}) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = w / (values.length - 1);

  const points = values
    .map((v, i) => `${i * stepX},${h - ((v - min) / range) * h}`)
    .join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

// -- Legend --------------------------------------------------------------------

function Legend({
  datasets,
  palette,
  labels,
  isPie,
}: {
  datasets: DataVizDataset[];
  palette: string[];
  labels?: string[];
  isPie?: boolean;
}) {
  const items = isPie
    ? (labels ?? []).map((l, i) => ({ label: l, color: resolveColor(undefined, i, palette) }))
    : datasets.map((ds, i) => ({ label: ds.label, color: resolveColor(ds.color, i, palette) }));

  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-sm text-muted">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

// -- Main Component -----------------------------------------------------------

export default function DataViz({ config }: { config: DataVizConfig }) {
  const { theme } = useTheme();

  const palette = [
    theme.colors.primary,
    theme.colors.accent,
    theme.colors.secondary,
    theme.colors.muted,
  ];

  const w = 500;
  const h = parseInt(config.height ?? '300', 10) || 300;

  const isPie = config.type === 'pie' || config.type === 'donut';

  return (
    <div style={{ width: config.width || '100%' }}>
      {config.title && (
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
          {config.title}
        </h3>
      )}

      <div style={{ height: `${h}px` }} className="relative">
        {config.type === 'bar' && (
          <BarChart config={config} palette={palette} w={w} h={h} />
        )}
        {config.type === 'line' && (
          <LineAreaChart config={config} palette={palette} w={w} h={h} filled={false} />
        )}
        {config.type === 'area' && (
          <LineAreaChart config={config} palette={palette} w={w} h={h} filled />
        )}
        {config.type === 'pie' && (
          <PieDonutChart config={config} palette={palette} w={w} h={h} donut={false} />
        )}
        {config.type === 'donut' && (
          <PieDonutChart config={config} palette={palette} w={w} h={h} donut />
        )}
        {config.type === 'sparkline' && config.data.datasets[0] && (
          <Sparkline
            values={config.data.datasets[0].values}
            color={resolveColor(config.data.datasets[0].color, 0, palette)}
            w={w}
            h={h}
          />
        )}
      </div>

      {config.showLegend && (
        <Legend datasets={config.data.datasets} palette={palette} labels={isPie ? config.data.labels : undefined} isPie={isPie} />
      )}
    </div>
  );
}

// Re-export Sparkline for DashboardGrid KPI widgets
export { Sparkline };
export type { DataVizConfig, DataVizData, DataVizDataset } from './types';
