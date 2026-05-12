export type ElementType = 'XIC' | 'XIO' | 'OTE' | 'OTL' | 'OTU' | 'TON' | 'CTU' | 'GEQ' | 'LEQ' | 'BOX' | 'BLOCK' | 'EMPTY';

export type ActiveTool =eport ty | { typ | { typ | { typ | { typ | { typ | { typeport ineport typ

  | 'selecting-rung'
  | 'choosing-component'
  | 'choosing-branch-start'
  | 'choosing-branch-end'
  | 'dragging';

export type DragState = {
  tool: ActiveTool;
  pointerId: number;
  startPoint: Point;
  currentPoint: Point;
  dropTarget: LadderDropTarget | null;
};

export interface DropZone {
  id: string; // Pode ser o ID de um elemento Vazio ou da Rung inteira
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ELEMEN
ble {
  id: string;
  value: any;  powerOut: boolean;
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
