/**
 * KanbanBoard -- Data Component (DAT-02)
 *
 * Drag-and-drop Kanban via HTML5 DnD API (no libraries).
 * WIP limits, priority badges, card tags, assignee avatars.
 */

import React, { useState, useCallback, useRef } from 'react';
import { useTheme } from '../../foundation';
import type { KanbanBoardConfig, KanbanCard, KanbanColumn } from './types';

// -- Priority badge -----------------------------------------------------------

const PRIORITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  urgent: { bg: 'bg-red-500/15', text: 'text-red-500', label: 'Urgent' },
  high: { bg: 'bg-orange-500/15', text: 'text-orange-500', label: 'High' },
  medium: { bg: 'bg-yellow-500/15', text: 'text-yellow-500', label: 'Med' },
  low: { bg: 'bg-green-500/15', text: 'text-green-500', label: 'Low' },
};

function PriorityBadge({ priority }: { priority: string }) {
  const style = PRIORITY_STYLES[priority];
  if (!style) return null;
  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

// -- Card Component -----------------------------------------------------------

function CardItem({
  card,
  onCardClick,
  onDragStart,
}: {
  card: KanbanCard;
  onCardClick?: (card: KanbanCard) => void;
  onDragStart: (cardId: string, columnId: string) => void;
}) {
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.id);
        onDragStart(card.id, card.columnId);
      }}
      onClick={() => onCardClick?.(card)}
      className="bg-background border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors shadow-sm"
    >
      {/* Tags */}
      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.tags.map((tag, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 text-[10px] font-medium rounded"
              style={{
                backgroundColor: tag.color ? `${tag.color}20` : undefined,
                color: tag.color || undefined,
              }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <div className="text-sm font-medium text-foreground mb-1">{card.title}</div>

      {/* Description */}
      {card.description && (
        <div className="text-xs text-muted mb-2 line-clamp-2">{card.description}</div>
      )}

      {/* Footer: priority + due date + assignee */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {card.priority && <PriorityBadge priority={card.priority} />}
          {card.dueDate && (
            <span className={`text-[10px] ${isOverdue ? 'text-red-500 font-semibold' : 'text-muted'}`}>
              {new Date(card.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
        {card.assignee && (
          card.assignee.avatar ? (
            <img
              src={card.assignee.avatar}
              alt={card.assignee.name}
              className="w-6 h-6 rounded-full border border-border"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">
              {card.assignee.name.charAt(0).toUpperCase()}
            </div>
          )
        )}
      </div>
    </div>
  );
}

// -- Column Component ---------------------------------------------------------

function ColumnContainer({
  column,
  cards,
  onCardClick,
  onAddCard,
  onDragStart,
  onDrop,
  isDragOver,
  onDragOver,
  onDragLeave,
}: {
  column: KanbanColumn;
  cards: KanbanCard[];
  onCardClick?: (card: KanbanCard) => void;
  onAddCard?: (columnId: string) => void;
  onDragStart: (cardId: string, columnId: string) => void;
  onDrop: (columnId: string, position: number) => void;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
}) {
  const overWip = column.wipLimit != null && cards.length >= column.wipLimit;

  return (
    <div
      className={`flex flex-col min-w-[280px] max-w-[320px] bg-surface rounded-xl ${
        isDragOver ? 'ring-2 ring-primary/40' : ''
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(column.id, cards.length);
      }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          {column.color && (
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
          )}
          <span className="text-sm font-semibold text-foreground">{column.title}</span>
          <span className="text-xs text-muted bg-background px-1.5 py-0.5 rounded-full">
            {cards.length}
          </span>
        </div>
        {column.wipLimit != null && (
          <span className={`text-[10px] font-medium ${overWip ? 'text-red-500' : 'text-muted'}`}>
            WIP: {cards.length}/{column.wipLimit}
          </span>
        )}
      </div>

      {/* WIP warning */}
      {overWip && (
        <div className="mx-3 mb-2 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-500">
          WIP limit exceeded
        </div>
      )}

      {/* Cards */}
      <div className="flex-1 overflow-auto px-2 pb-2 space-y-2 min-h-[100px]">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            onCardClick={onCardClick}
            onDragStart={onDragStart}
          />
        ))}
        {isDragOver && (
          <div className="border-2 border-dashed border-primary/30 rounded-lg h-16" />
        )}
      </div>

      {/* Add card button */}
      {onAddCard && (
        <button
          onClick={() => onAddCard(column.id)}
          className="mx-2 mb-2 px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-background rounded-lg transition-colors text-center"
        >
          + Add card
        </button>
      )}
    </div>
  );
}

// -- Main Component -----------------------------------------------------------

export default function KanbanBoard({ config }: { config: KanbanBoardConfig }) {
  useTheme();

  const [dragState, setDragState] = useState<{ cardId: string; fromColumn: string } | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const cardsByColumn = useCallback((columnId: string): KanbanCard[] => {
    return config.cards.filter((c) => c.columnId === columnId);
  }, [config.cards]);

  const handleDragStart = useCallback((cardId: string, columnId: string) => {
    setDragState({ cardId, fromColumn: columnId });
  }, []);

  const handleDrop = useCallback((toColumn: string, position: number) => {
    if (dragState && dragState.fromColumn !== toColumn) {
      config.onCardMove?.(dragState.cardId, dragState.fromColumn, toColumn, position);
    }
    setDragState(null);
    setDragOverColumn(null);
  }, [dragState, config]);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  }, []);

  return (
    <div className="flex gap-4 overflow-x-auto p-4 min-h-[400px]">
      {config.columns.map((column) => (
        <ColumnContainer
          key={column.id}
          column={column}
          cards={cardsByColumn(column.id)}
          onCardClick={config.onCardClick}
          onAddCard={config.onAddCard}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          isDragOver={dragOverColumn === column.id && dragState?.fromColumn !== column.id}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDragLeave={() => setDragOverColumn(null)}
        />
      ))}
    </div>
  );
}

export type { KanbanBoardConfig, KanbanCard, KanbanColumn, KanbanTag, KanbanAssignee } from './types';
