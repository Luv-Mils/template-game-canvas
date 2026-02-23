/**
 * DocumentHandler — AI & Integration Component (AII-07)
 *
 * Upload, preview, and process documents (PDF, DOCX, images, text).
 * Supports grid, list, and dropzone variants.
 */

import React, { useState, useRef, useCallback } from 'react';
import { useTheme } from '../../foundation';
import type { DocumentHandlerConfig, DocumentItem } from './types';

// -- File type icons ----------------------------------------------------------

function FileIcon({ type }: { type: string }) {
  const labels: Record<string, { text: string; color: string }> = {
    pdf: { text: 'PDF', color: 'text-red-500' },
    docx: { text: 'DOC', color: 'text-blue-500' },
    image: { text: 'IMG', color: 'text-green-500' },
    text: { text: 'TXT', color: 'text-muted' },
  };
  const info = labels[type] ?? labels.text;

  return (
    <div className="w-full h-full flex items-center justify-center bg-surface rounded-lg">
      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
        <rect x="8" y="4" width="24" height="32" rx="2" className="stroke-border" strokeWidth="1.5" fill="none" />
        <path d="M24 4v8h8" className="stroke-border" strokeWidth="1.5" fill="none" />
        <text x="20" y="28" textAnchor="middle" className={`text-[8px] font-bold ${info.color}`} fill="currentColor">
          {info.text}
        </text>
      </svg>
    </div>
  );
}

// -- Format size --------------------------------------------------------------

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// -- Upload area icons --------------------------------------------------------

function UploadIcon() {
  return (
    <svg className="w-10 h-10 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

// -- Preview modal ------------------------------------------------------------

function PreviewModal({ doc, onClose }: { doc: DocumentItem; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-background border border-border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <h3 className="text-sm font-semibold text-foreground truncate">{doc.name}</h3>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {doc.type === 'image' && doc.url && (
            <img src={doc.url} alt={doc.name} className="max-w-full h-auto rounded-lg mx-auto" />
          )}
          {doc.type === 'pdf' && doc.url && (
            <iframe src={doc.url} className="w-full h-[60vh] border-0 rounded-lg" title={doc.name} />
          )}
          {doc.type === 'text' && doc.url && (
            <div className="bg-surface rounded-lg p-4">
              <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-words">
                {doc.metadata?.content ?? 'Preview not available. Download the file to view its contents.'}
              </pre>
            </div>
          )}
          {(doc.type === 'docx' || (!doc.url && doc.type !== 'text')) && (
            <div className="text-center py-12 text-sm text-muted">
              <div className="mb-4">
                <FileIcon type={doc.type} />
              </div>
              Preview not available for this file type.
              {doc.url && (
                <a href={doc.url} download className="block mt-3 text-primary hover:text-primary-hover transition-colors">
                  Download file
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// -- Main Component -----------------------------------------------------------

export default function DocumentHandler({ config }: { config: DocumentHandlerConfig }) {
  useTheme();

  const variant = config.variant ?? 'grid';
  const maxSizeMB = config.maxSizeMB ?? 25;
  const showPreview = config.showPreview ?? true;
  const multiple = config.multiple ?? true;
  const documents = config.documents ?? [];

  const [dragOver, setDragOver] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = config.acceptedTypes ?? [
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png', 'image/jpeg', 'image/gif', 'image/webp',
    'text/plain',
  ];

  const validateAndUpload = useCallback(
    (file: File) => {
      if (file.size > maxSizeMB * 1024 * 1024) return;
      if (acceptedTypes.length > 0 && !acceptedTypes.some((t) => file.type.startsWith(t.split('/')[0]) || file.type === t)) return;
      config.onUpload(file);
    },
    [config, maxSizeMB, acceptedTypes],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (!multiple) {
        if (files[0]) validateAndUpload(files[0]);
      } else {
        files.forEach(validateAndUpload);
      }
    },
    [multiple, validateAndUpload],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      files.forEach(validateAndUpload);
      if (inputRef.current) inputRef.current.value = '';
    },
    [validateAndUpload],
  );

  // Dropzone area (used for 'dropzone' variant or when no documents)
  const dropzone = (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <UploadIcon />
      <p className="mt-3 text-sm font-medium text-foreground">
        Drop files here or click to browse
      </p>
      <p className="mt-1 text-xs text-muted">
        Max {maxSizeMB} MB per file
      </p>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={acceptedTypes.join(',')}
        multiple={multiple}
        onChange={handleFileInput}
      />
    </div>
  );

  // Dropzone-only variant
  if (variant === 'dropzone') {
    return (
      <div className="space-y-4">
        {dropzone}
        {documents.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {documents.map((doc) => (
              <div key={doc.id} className="border border-border rounded-lg p-2 bg-surface group relative">
                <div className="aspect-square mb-2 overflow-hidden rounded">
                  {doc.type === 'image' && doc.thumbnail ? (
                    <img src={doc.thumbnail} alt={doc.name} className="w-full h-full object-cover" />
                  ) : (
                    <FileIcon type={doc.type} />
                  )}
                </div>
                <div className="text-xs font-medium text-foreground truncate">{doc.name}</div>
                <div className="text-[10px] text-muted">{formatSize(doc.size)}</div>
                <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                  {showPreview && (
                    <button onClick={() => setPreviewDoc(doc)} className="p-1 bg-surface border border-border rounded text-xs text-muted hover:text-foreground">
                      View
                    </button>
                  )}
                  {config.onDelete && (
                    <button onClick={() => config.onDelete!(doc.id)} className="p-1 bg-surface border border-border rounded text-xs text-muted hover:text-red-500">
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {previewDoc && <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
      </div>
    );
  }

  // Grid variant
  if (variant === 'grid') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Documents ({documents.length})</span>
          <button
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Upload
          </button>
          <input ref={inputRef} type="file" className="hidden" accept={acceptedTypes.join(',')} multiple={multiple} onChange={handleFileInput} />
        </div>

        {documents.length === 0 ? dropzone : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border border-border rounded-xl bg-surface hover:border-primary/30 transition-colors group relative cursor-pointer"
                onClick={() => showPreview && setPreviewDoc(doc)}
              >
                <div className="aspect-[4/3] overflow-hidden rounded-t-xl">
                  {doc.type === 'image' && (doc.thumbnail || doc.url) ? (
                    <img src={doc.thumbnail ?? doc.url} alt={doc.name} className="w-full h-full object-cover" />
                  ) : (
                    <FileIcon type={doc.type} />
                  )}
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium text-foreground truncate">{doc.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted">{formatSize(doc.size)}</span>
                    {doc.uploadedAt && (
                      <span className="text-[10px] text-muted">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
                  {config.onProcess && (
                    <button
                      onClick={(e) => { e.stopPropagation(); config.onProcess!(doc.id); }}
                      className="px-2 py-1 text-[10px] bg-surface border border-border rounded text-primary hover:bg-primary/10"
                    >
                      Process
                    </button>
                  )}
                  {config.onDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); config.onDelete!(doc.id); }}
                      className="px-2 py-1 text-[10px] bg-surface border border-border rounded text-muted hover:text-red-500"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {previewDoc && <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
      </div>
    );
  }

  // List variant
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Documents ({documents.length})</span>
        <button
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          Upload
        </button>
        <input ref={inputRef} type="file" className="hidden" accept={acceptedTypes.join(',')} multiple={multiple} onChange={handleFileInput} />
      </div>

      {documents.length === 0 ? dropzone : (
        <div className="border border-border rounded-xl overflow-hidden bg-background divide-y divide-border">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-4 px-4 py-3 hover:bg-surface/30 transition-colors">
              <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden">
                {doc.type === 'image' && (doc.thumbnail || doc.url) ? (
                  <img src={doc.thumbnail ?? doc.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <FileIcon type={doc.type} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{doc.name}</div>
                <div className="flex items-center gap-2 text-[10px] text-muted">
                  <span className="uppercase font-semibold">{doc.type}</span>
                  <span>{formatSize(doc.size)}</span>
                  {doc.uploadedAt && <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {showPreview && (
                  <button onClick={() => setPreviewDoc(doc)} className="text-xs text-primary hover:text-primary-hover transition-colors">
                    View
                  </button>
                )}
                {config.onProcess && (
                  <button onClick={() => config.onProcess!(doc.id)} className="text-xs text-muted hover:text-foreground transition-colors">
                    Process
                  </button>
                )}
                {config.onDelete && (
                  <button onClick={() => config.onDelete!(doc.id)} className="text-xs text-muted hover:text-red-500 transition-colors">
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {previewDoc && <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
    </div>
  );
}

export type { DocumentHandlerConfig, DocumentItem } from './types';
