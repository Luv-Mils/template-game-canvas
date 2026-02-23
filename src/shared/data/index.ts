/**
 * Data & Tables Components -- Barrel Export
 *
 * All shared data components for Vibe Engine app templates.
 * Import from 'src/shared/data' in any template.
 *
 * Usage:
 *   import { DataTable, KanbanBoard, DataViz } from '../shared/data';
 */

// DAT-01: DataTable
export { default as DataTable } from './DataTable';
export type { DataTableConfig, DataTableColumn, DataTableAction, DataTableEmptyState } from './DataTable';

// DAT-02: KanbanBoard
export { default as KanbanBoard } from './KanbanBoard';
export type { KanbanBoardConfig, KanbanCard, KanbanColumn, KanbanTag, KanbanAssignee } from './KanbanBoard';

// DAT-03: CalendarView
export { default as CalendarView } from './CalendarView';
export type { CalendarViewConfig, CalendarEvent } from './CalendarView';

// DAT-04: DataViz
export { default as DataViz } from './DataViz';
export type { DataVizConfig, DataVizData, DataVizDataset } from './DataViz';

// DAT-05: FileIngestion
export { default as FileIngestion } from './FileIngestion';
export type { FileIngestionConfig, ParsedData } from './FileIngestion';

// DAT-06: SpreadsheetView
export { default as SpreadsheetView } from './SpreadsheetView';
export type { SpreadsheetViewConfig } from './SpreadsheetView';

// DAT-07: DashboardGrid
export { default as DashboardGrid } from './DashboardGrid';
export type { DashboardGridConfig, DashboardWidget, KPIWidget, ActivityWidget } from './DashboardGrid';

// DAT-08: ExportEngine
export { default as ExportEngine } from './ExportEngine';
export type { ExportEngineConfig, ExportColumn, ExportRenderProps } from './ExportEngine';
