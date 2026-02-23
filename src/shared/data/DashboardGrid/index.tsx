/**
 * DashboardGrid -- Data Component (DAT-07)
 *
 * Responsive dashboard layout rendering KPI cards, chart widgets,
 * table widgets, activity feeds, and custom widgets.
 * Uses CSS Grid. Imports DataViz Sparkline for KPI sparklines.
 */

import React from 'react';
import { useTheme } from '../../foundation';
import { Sparkline } from '../DataViz';
import type {
  DashboardGridConfig,
  DashboardWidget,
  KPIWidget,
  ActivityWidget,
  ActivityWidgetItem,
} from './types';

// -- KPI Card -----------------------------------------------------------------

function KPICard({ data, palette }: { data: KPIWidget; palette: string[] }) {
  const changeColor = data.change?.direction === 'up' ? 'text-green-500' : 'text-red-500';
  const changeArrow = data.change?.direction === 'up' ? '↑' : '↓';

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          {data.icon && <span className="text-lg">{data.icon}</span>}
          <span className="text-sm text-muted">{data.label}</span>
        </div>
        <div className="text-2xl font-heading font-bold text-foreground">{data.value}</div>
        {data.change && (
          <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${changeColor}`}>
            <span>{changeArrow}</span>
            <span>{Math.abs(data.change.value)}%</span>
          </div>
        )}
      </div>
      {data.sparkline && data.sparkline.length > 1 && (
        <div className="flex-shrink-0 ml-4">
          <Sparkline
            values={data.sparkline}
            color={palette[0]}
            w={80}
            h={32}
          />
        </div>
      )}
    </div>
  );
}

// -- Activity Feed ------------------------------------------------------------

function ActivityFeed({ data }: { data: ActivityWidget }) {
  return (
    <div className="space-y-3 max-h-64 overflow-auto">
      {data.items.map((item: ActivityWidgetItem, i: number) => (
        <div key={i} className="flex items-start gap-3">
          {item.icon && <span className="text-sm flex-shrink-0 mt-0.5">{item.icon}</span>}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-foreground">
              {item.user && <span className="font-medium">{item.user} </span>}
              {item.text}
            </div>
            <div className="text-xs text-muted mt-0.5">{item.time}</div>
          </div>
        </div>
      ))}
      {data.items.length === 0 && (
        <div className="text-sm text-muted text-center py-4">No recent activity</div>
      )}
    </div>
  );
}

// -- Generic widget wrapper ---------------------------------------------------

function WidgetCard({
  widget,
  children,
}: {
  widget: DashboardWidget;
  children: React.ReactNode;
}) {
  const colSpan = widget.span?.cols ?? 1;
  const rowSpan = widget.span?.rows ?? 1;

  return (
    <div
      className="bg-background border border-border rounded-xl p-4 overflow-hidden"
      style={{
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
      }}
    >
      {widget.title && (
        <h3 className="text-sm font-semibold text-foreground mb-3">{widget.title}</h3>
      )}
      {children}
    </div>
  );
}

// -- Chart widget (uses DataViz inline) ---------------------------------------

function ChartWidget({ config: chartConfig, palette }: { config: unknown; palette: string[] }) {
  // chartConfig should be a DataVizConfig - render inline SVG bar chart as a simple default
  const cfg = chartConfig as {
    type?: string;
    data?: { labels: string[]; datasets: Array<{ label: string; values: number[]; color?: string }> };
  };

  if (!cfg?.data?.datasets?.[0]) {
    return <div className="text-sm text-muted text-center py-8">No chart data</div>;
  }

  const { labels, datasets } = cfg.data;
  const allValues = datasets.flatMap((d) => d.values);
  const maxVal = Math.max(...allValues, 1);
  const w = 400;
  const h = 200;
  const padding = { top: 10, right: 10, bottom: 30, left: 40 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  if (cfg.type === 'line' || cfg.type === 'area') {
    const stepX = labels.length > 1 ? chartW / (labels.length - 1) : chartW;
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`}>
        {datasets.map((ds, di) => {
          const color = ds.color || palette[di % palette.length];
          const points = ds.values.map((val, i) => ({
            x: padding.left + i * stepX,
            y: padding.top + chartH - (val / maxVal) * chartH,
          }));
          const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ');
          return (
            <g key={di}>
              {cfg.type === 'area' && (
                <polygon
                  points={`${padding.left},${padding.top + chartH} ${pointsStr} ${points[points.length - 1]?.x ?? padding.left},${padding.top + chartH}`}
                  fill={color} fillOpacity={0.15}
                />
              )}
              <polyline points={pointsStr} fill="none" stroke={color} strokeWidth={2} />
            </g>
          );
        })}
      </svg>
    );
  }

  // Default: bar chart
  const barGroupWidth = chartW / labels.length;
  const barWidth = Math.max(4, (barGroupWidth * 0.7) / datasets.length);
  const groupPad = barGroupWidth * 0.15;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`}>
      {datasets.map((ds, di) =>
        ds.values.map((val, li) => {
          const barH = (val / maxVal) * chartH;
          const x = padding.left + groupPad + li * barGroupWidth + di * barWidth;
          const y = padding.top + chartH - barH;
          const color = ds.color || palette[di % palette.length];
          return (
            <rect key={`${di}-${li}`} x={x} y={y} width={barWidth} height={barH} rx={2} fill={color} />
          );
        }),
      )}
      {labels.map((label, i) => (
        <text key={i} x={padding.left + i * barGroupWidth + barGroupWidth / 2} y={h - 5} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.5}>
          {label}
        </text>
      ))}
    </svg>
  );
}

// -- Table widget -------------------------------------------------------------

function TableWidget({ config: tableConfig }: { config: unknown }) {
  const cfg = tableConfig as {
    headers?: string[];
    rows?: (string | number)[][];
  };

  if (!cfg?.rows?.length) {
    return <div className="text-sm text-muted text-center py-4">No data</div>;
  }

  return (
    <div className="overflow-auto max-h-48">
      <table className="w-full text-sm border-collapse">
        {cfg.headers && (
          <thead className="sticky top-0 bg-surface">
            <tr>
              {cfg.headers.map((h, i) => (
                <th key={i} className="px-3 py-1.5 text-left text-xs font-semibold text-muted uppercase border-b border-border">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {cfg.rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-1.5 text-foreground">{String(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// -- Main Component -----------------------------------------------------------

export default function DashboardGrid({ config }: { config: DashboardGridConfig }) {
  const { theme } = useTheme();

  const palette = [
    theme.colors.primary,
    theme.colors.accent,
    theme.colors.secondary,
    theme.colors.muted,
  ];

  const columns = config.columns ?? 4;
  const gap = config.gap ?? '1rem';

  return (
    <div
      className="w-full"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap,
      }}
    >
      {config.widgets.map((widget) => (
        <WidgetCard key={widget.id} widget={widget}>
          {widget.type === 'kpi' && (
            <KPICard data={widget.config as KPIWidget} palette={palette} />
          )}
          {widget.type === 'chart' && (
            <ChartWidget config={widget.config} palette={palette} />
          )}
          {widget.type === 'table' && (
            <TableWidget config={widget.config} />
          )}
          {widget.type === 'activity' && (
            <ActivityFeed data={widget.config as ActivityWidget} />
          )}
          {widget.type === 'custom' && (
            <div className="text-sm text-muted">Custom widget</div>
          )}
        </WidgetCard>
      ))}
    </div>
  );
}

export type { DashboardGridConfig, DashboardWidget, KPIWidget, ActivityWidget } from './types';
