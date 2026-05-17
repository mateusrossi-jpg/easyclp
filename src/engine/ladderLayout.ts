import { LadderElement, Rung } from '../types';

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
}

export interface LayoutWire {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface RungLayout {
  width: number;
  height: number;
  nodes: LayoutNode[];
  wires: LayoutWire[];
}

const TOUCH_TARGET_SIZE = 44;
const RUNG_GAP = 32;
const COLUMN_GAP = 28;
const BRANCH_GAP = 56;
const LEFT_RAIL_X = 0;

export const calculateRungLayout = (
  rung: Rung,
  elements: Record<string, LadderElement>
): RungLayout => {
  const rungElements = rung.elementIds
    .map(id => elements[id])
    .filter((element): element is LadderElement => Boolean(element));

  const maxColumn = Math.max(0, ...rungElements.map(element => element.column));
  const maxBranch = Math.max(0, ...rungElements.map(element => element.branchIndex));
  const columnPitch = TOUCH_TARGET_SIZE + COLUMN_GAP;
  const rowPitch = TOUCH_TARGET_SIZE + BRANCH_GAP;
  const rightRailX = LEFT_RAIL_X + (maxColumn + 1) * columnPitch + TOUCH_TARGET_SIZE;

  const nodes = rungElements.map(element => ({
    id: element.id,
    x: LEFT_RAIL_X + element.column * columnPitch + COLUMN_GAP,
    y: element.branchIndex * rowPitch,
  }));

  const rowCount = maxBranch + 1;
  const wires: LayoutWire[] = Array.from({ length: rowCount }, (_, row) => {
    const centerY = row * rowPitch + TOUCH_TARGET_SIZE / 2;
    return {
      startX: LEFT_RAIL_X,
      startY: centerY,
      endX: rightRailX,
      endY: centerY,
    };
  });

  return {
    width: rightRailX,
    height: rowCount * TOUCH_TARGET_SIZE + maxBranch * BRANCH_GAP + RUNG_GAP,
    nodes,
    wires,
  };
};
