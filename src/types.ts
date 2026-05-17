export type ElementType =
  | 'XIC'
  | 'XIO'
  | 'OTE'
  | 'OTL'
  | 'OTU'
  | 'TON'
  | 'CTU'
  | 'GEQ'
  | 'LEQ'
  | 'EQU'
  | 'NEQ'
  | 'GRT'
  | 'LSS'
  | 'BOX'
  | 'BLOCK'
  | 'EMPTY';

export type ActiveTool =
  | ElementType
  | 'RUNG'
  | 'PARALLEL_BRANCH'
  | 'RESIZE_BRANCH_START'
  | 'RESIZE_BRANCH_END'
  | null;

export type WorkspaceMode = 'edit' | 'simulate';

export type EditorInteractionMode =
  | 'idle'
  | 'selecting-rung'
  | 'choosing-component'
  | 'choosing-branch-start'
  | 'choosing-branch-end'
  | 'dragging';

export type VariableType = 'BOOL' | 'NUMBER' | 'TIMER' | 'COUNTER' | 'STRING';

export interface TimerValue {
  acc: number;
  pre: number;
  dn: boolean;
  tt?: boolean;
}

export interface CounterValue {
  acc: number;
  pre: number;
  dn: boolean;
}

export interface Variable {
  id: string;
  type: VariableType;
  value: boolean | number | string | TimerValue | CounterValue;
}

export interface LadderElement {
  id: string;
  type: ElementType;
  address: string;
  powerIn: boolean;
  powerOut: boolean;
  column: number;
  branchIndex: number;
  rungId: string;
}

export interface Rung {
  id: string;
  elementIds: string[];
  isPowered: boolean;
  order: number;
}

export interface NormalizedState {
  rungs: Record<string, Rung>;
  elements: Record<string, LadderElement>;
  variables: Record<string, Variable>;
}

export interface DragState {
  isDragging: boolean;
  tool: ActiveTool;
  x: number;
  y: number;
  hoveredDropZoneId: string | null;
  draggedBranch?: { rungId: string; branchIndex: number };
  draggedElementId?: string;
}

export interface DropZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ELEMENT' | 'RUNG';
}
