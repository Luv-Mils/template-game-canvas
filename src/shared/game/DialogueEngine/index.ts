/**
 * DialogueEngine — Game Engine Component (GME-15)
 *
 * Branching dialogue trees with character definitions, variable tracking,
 * conditional choices, effect application, and history.
 */

import type { DialogueConfig, DialogueNode, DialogueEffect } from './types';

export class DialogueEngine {
  private nodes: Map<string, DialogueNode> = new Map();
  private currentNodeId: string | null = null;
  private variables: Record<string, unknown> = {};
  private history: string[] = [];
  private config: DialogueConfig;

  constructor(config: DialogueConfig) {
    this.config = config;
  }

  // -- Tree management --------------------------------------------------------

  loadTree(nodes: DialogueNode[]): void {
    this.nodes.clear();
    for (const node of nodes) {
      this.nodes.set(node.id, node);
    }
  }

  start(nodeId: string): DialogueNode | null {
    const node = this.nodes.get(nodeId);
    if (!node) return null;

    this.currentNodeId = nodeId;
    this.history.push(nodeId);
    this.applyEffects(node.effects);
    node.onEnter?.();
    return { ...node };
  }

  // -- Navigation -------------------------------------------------------------

  getCurrentNode(): DialogueNode | null {
    if (!this.currentNodeId) return null;
    const node = this.nodes.get(this.currentNodeId);
    return node ? { ...node } : null;
  }

  advance(choiceIndex?: number): DialogueNode | null {
    if (!this.currentNodeId) return null;
    const current = this.nodes.get(this.currentNodeId);
    if (!current) return null;

    let nextId: string | undefined;

    if (current.choices && current.choices.length > 0) {
      // Choice-based advancement
      if (choiceIndex === undefined) return null; // must choose
      const available = this.getAvailableChoices();
      const choice = available[choiceIndex];
      if (!choice) return null;

      // Find the actual choice from the original choices array
      const originalChoice = current.choices[choice.originalIndex];
      if (!originalChoice) return null;

      this.applyEffects(originalChoice.effects);
      nextId = originalChoice.nextNodeId;
    } else {
      // Auto-advance
      nextId = current.nextNodeId;
    }

    if (!nextId) {
      // Dialogue is complete
      this.currentNodeId = null;
      return null;
    }

    return this.start(nextId);
  }

  isComplete(): boolean {
    if (!this.currentNodeId) return true;
    const current = this.nodes.get(this.currentNodeId);
    if (!current) return true;
    return (!current.choices || current.choices.length === 0) && !current.nextNodeId;
  }

  // -- Variables --------------------------------------------------------------

  setVariable(key: string, value: unknown): void {
    this.variables[key] = value;
  }

  getVariable<T>(key: string): T | undefined {
    return this.variables[key] as T | undefined;
  }

  getVariables(): Record<string, unknown> {
    return { ...this.variables };
  }

  // -- Choice filtering -------------------------------------------------------

  getAvailableChoices(): Array<{ text: string; index: number; originalIndex: number }> {
    if (!this.currentNodeId) return [];
    const current = this.nodes.get(this.currentNodeId);
    if (!current?.choices) return [];

    const available: Array<{ text: string; index: number; originalIndex: number }> = [];
    let visibleIndex = 0;

    for (let i = 0; i < current.choices.length; i++) {
      const choice = current.choices[i];
      if (choice.condition) {
        try {
          if (!choice.condition(this.variables)) continue;
        } catch {
          continue; // condition failed, skip
        }
      }
      available.push({ text: choice.text, index: visibleIndex, originalIndex: i });
      visibleIndex++;
    }

    return available;
  }

  // -- History ----------------------------------------------------------------

  getHistory(): string[] {
    return [...this.history];
  }

  hasVisited(nodeId: string): boolean {
    return this.history.includes(nodeId);
  }

  // -- Characters -------------------------------------------------------------

  getCharacter(key: string): { name: string; portrait?: string; color?: string } | undefined {
    return this.config.characters?.[key];
  }

  getTextSpeed(): number {
    return this.config.textSpeed ?? 30;
  }

  // -- Effect application -----------------------------------------------------

  private applyEffects(effects?: DialogueEffect[]): void {
    if (!effects) return;
    for (const effect of effects) {
      const current = this.variables[effect.variable];
      switch (effect.operation) {
        case 'set':
          this.variables[effect.variable] = effect.value;
          break;
        case 'add':
          this.variables[effect.variable] = (typeof current === 'number' ? current : 0) + (effect.value as number);
          break;
        case 'subtract':
          this.variables[effect.variable] = (typeof current === 'number' ? current : 0) - (effect.value as number);
          break;
      }
    }
  }

  // -- Serialization ----------------------------------------------------------

  save(): string {
    return JSON.stringify({
      currentNodeId: this.currentNodeId,
      variables: this.variables,
      history: this.history,
    });
  }

  load(json: string): void {
    try {
      const data = JSON.parse(json);
      if (typeof data.currentNodeId === 'string' || data.currentNodeId === null) {
        this.currentNodeId = data.currentNodeId;
      }
      if (data.variables && typeof data.variables === 'object') {
        this.variables = data.variables;
      }
      if (Array.isArray(data.history)) {
        this.history = data.history;
      }
    } catch {
      // corrupted data
    }
  }

  reset(): void {
    this.currentNodeId = null;
    this.variables = {};
    this.history = [];
  }
}

export type { DialogueConfig, DialogueNode, DialogueChoice, DialogueEffect, DialogueCharacter } from './types';
