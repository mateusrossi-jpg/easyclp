import React from 'react';
import { Animated } from 'react-native';
import Svg, { Circle, Line, G, Text as SvgText, Rect } from 'react-native-svg';
import { getBranchY, getRungHeight, getRungRowCount, LADDER_GEOMETRY as GEO } from '../consts/ladderGeometry';
import { useLadderStore } from '../store/useLadderStore';
import { LadderContactNO, LadderContactNC, LadderCoil, CompareContactSvg } from './LadderSymbols';
import { LadderBlockSvg } from './LadderBlocks';
import { ActiveTool, EditorInteractionMode, ElementType, LadderElement, WorkspaceMode, DropZone } from '../types';

const COIL_TYPES: ElementType[] = ['OTE', 'OTL', 'OTU'];
export const LADDER_INTERNAL_WIDTH = 920;

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const AnimatedRungGroup = React.memo(({ targetY, children }: { targetY: number, children: React.ReactNode }) => {
  const translateY = React.useRef(new Animated.Value(targetY)).current;

  React.useEffect(() => {
    Animated.spring(translateY, {
      toValue: targetY,
      damping: 26,
      stiffness: 170,
      useNativeDriver: false
    }).start();
  }, [targetY]);

  return <AnimatedG y={translateY as any}>{children}</AnimatedG>;
});

const HighlightOverlay = React.memo(({ isHighlighted, width, height, y = 0 }: { isHighlighted: boolean, width: number, height: number, y?: number }) => {
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isHighlighted) {
      opacity.setValue(0.5);
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: false
      }).start();
    }
  }, [isHighlighted]);

  return (
    <AnimatedRect
      x={GEO.leftRailX}
      y={y}
      width={width}
      height={height}
      fill={GEO.colorSelection}
      fillOpacity={opacity as any}
      pointerEvents="none"
    />
  );
});

interface LadderRendererProps {
  mode: WorkspaceMode;
  selectedElementId: string | null;
  selectedRungId: string | null;
  interactionMode: EditorInteractionMode;
  branchStartColumn: number | null;
  activeTool: ActiveTool;
  scale?: number;
  onContentSizeChange?: (size: { width: number; height: number }) => void;
  onElementPress: (elementId: string) => void;
  onRungPress: (rungId: string) => void;
  onBranchPointPress: (column: number) => void;
}

export const LadderRenderer: React.FC<LadderRendererProps> = React.memo(({
  mode,
  selectedElementId,
  selectedRungId,
  interactionMode,
  branchStartColumn,
  activeTool,
  scale = 1,
  onContentSizeChange,
  onElementPress,
  onRungPress,
  onBranchPointPress,
}) => {
  const rungs = useLadderStore(state => state.rungs);
  const elements = useLadderStore(state => state.elements);
  const variables = useLadderStore(state => state.variables);
  const isSimulating = useLadderStore(state => state.isSimulating);
  const setDropZones = useLadderStore(state => state.setDropZones);
  const hoveredDropZoneId = useLadderStore(state => state.dragState.hoveredDropZoneId);
  const draggedTool = useLadderStore(state => state.dragState.tool);
  const highlightedRungId = useLadderStore(state => state.highlightedRungId);

  const rungList = Object.values(rungs).sort((a, b) => a.order - b.order);
  const rungLayouts = React.useMemo(() => {
    let cursorY = GEO.topPadding;
    return rungList.reduce<Array<{ rung: typeof rungList[number]; y: number; height: number; rowCount: number }>>((items, rung) => {
      const rungElements = rung.elementIds
        .map(id => elements[id])
        .filter((el): el is LadderElement => !!el);
      const rowCount = getRungRowCount(rungElements);
      const height = getRungHeight(rungElements);
      items.push({ rung, y: cursorY, height, rowCount });
      cursorY += height;
      return items;
    }, []);
  }, [rungList, elements]);

  const canvasHeight = (rungLayouts[rungLayouts.length - 1]?.y || GEO.topPadding) + (rungLayouts[rungLayouts.length - 1]?.height || GEO.rungHeight) + GEO.topPadding;

  React.useEffect(() => {
    onContentSizeChange?.({ width: LADDER_INTERNAL_WIDTH, height: canvasHeight });
  }, [canvasHeight, onContentSizeChange]);

  const getElementX = (el: LadderElement) => {
    if (COIL_TYPES.includes(el.type)) return GEO.rightRailX - GEO.columnWidth;
    if (el.type === 'CTU') return GEO.ctuX;
    if (el.type === 'TON') {
      if (el.address === 'Cycle') return GEO.cycleTonX;
      return GEO.tonX;
    }
    if (el.type === 'GEQ' || el.type === 'LEQ') return GEO.compareX;
    
    // Logic mapping based on columns
    if (el.column === 0) return GEO.firstContactX;
    if (el.column === 1) return GEO.firstContactX + 70;
    return GEO.firstContactX + el.column * 60;
  };

  React.useEffect(() => {
    if (mode !== 'edit' || isSimulating) {
      setDropZones([]);
      return;
    }

    const zones: DropZone[] = [];

    rungLayouts.forEach(({ rung, y: rungY, height: rungHeight }) => {
      // 1. Registra a área da Rung Inteira (para inserir novos ramos ou rungs)
      zones.push({
        id: rung.id,
        x: GEO.leftRailX * scale,
        y: rungY * scale,
        width: (GEO.rightRailX - GEO.leftRailX) * scale,
        height: rungHeight * scale,
        type: 'RUNG'
      });

      // 2. Registra a área de cada célula "EMPTY"
      const isResizing = draggedTool === 'RESIZE_BRANCH_START' || draggedTool === 'RESIZE_BRANCH_END';
      const allRungElements = rung.elementIds.map(id => elements[id]).filter(Boolean);
      allRungElements.forEach(el => {
        if (el.type === 'EMPTY' || isResizing) {
          const elX = getElementX(el);
          // Se a célula estiver em um ramo paralelo, precisamos puxar o Y específico dela
          const elY = (el.branchIndex || 0) > 0 ? getBranchY(rungY, el.branchIndex) : rungY;
          
          zones.push({
            id: el.id,
            x: elX * scale,
            y: elY * scale,
            width: GEO.columnWidth * scale,
            height: GEO.rungHeight * scale,
            type: 'ELEMENT'
          });
        }
      });
    });

    setDropZones(zones);
  }, [rungLayouts, elements, mode, isSimulating, scale, setDropZones]); // Dependência de scale é crucial

  const renderElement = (el: LadderElement, x: number, y: number) => {
    const varValue = variables[el.address]?.value;
    const isPowered = typeof varValue === 'boolean' ? varValue : (varValue as any)?.dn;
    const selected = selectedElementId === el.id;
    const isHovered = hoveredDropZoneId === el.id;
    const toolTarget = isHovered || (!!activeTool && mode === 'edit' && !isSimulating && selectedRungId === el.rungId && selectedElementId === el.id);
    
    let Comp = null;
    const props = { powerIn: el.powerIn, powerOut: el.powerOut, active: isPowered, address: el.address };
    
    if (el.type === 'XIC') Comp = <LadderContactNO {...props} />;
    else if (el.type === 'XIO') Comp = <LadderContactNC {...props} />;
    else if (COIL_TYPES.includes(el.type)) Comp = <LadderCoil {...props} type={el.type as any} />;
    else if (el.type === 'TON' || el.type === 'CTU') {
      const v = variables[el.address]?.value as any;
      Comp = <LadderBlockSvg type={el.type} {...props} accValue={String(v?.acc || 0)} preValue={String(v?.pre || 0)} />;
    } else if (el.type === 'GEQ' || el.type === 'LEQ') {
      const parts = el.address.split(' ');
      Comp = <CompareContactSvg {...props} operator={parts[1] || el.type} label={parts[0]} value={parts[2] || '0'} />;
    }

    if (!Comp) return null;

    const symbolWidth = (el.type === 'TON' || el.type === 'CTU') ? GEO.blockWidth : GEO.columnWidth;

    return (
      <G key={el.id} transform={`translate(${x}, ${y})`}>
        {(selected || toolTarget) && (
          <Rect
            x={2}
            y={8}
            width={symbolWidth - 4}
            height={GEO.rungHeight - 16}
            rx={16}
            fill={toolTarget ? 'rgba(31, 41, 51, 0.055)' : GEO.colorSelection}
            stroke={toolTarget ? '#1F2933' : GEO.colorPowerOn}
            strokeWidth={1.4}
            vectorEffect="non-scaling-stroke"
          />
        )}
        {Comp}
        {/* Label standard */}
        {!['GEQ', 'LEQ', 'TON', 'CTU', 'EMPTY'].includes(el.type) && (
          <SvgText x={GEO.columnWidth / 2} y={18} fontSize={GEO.labelFontSize} fontWeight="800" textAnchor="middle" fill={GEO.colorText} fontFamily="monospace">{el.address}</SvgText>
        )}
        {/* Interaction Hitbox (Layer top) */}
        <Rect
          x={0}
          y={0}
          width={symbolWidth}
          height={GEO.rungHeight}
          fill="transparent"
          onPress={() => onElementPress(el.id)}
          onLongPress={(e) => {
            if (el.type !== 'EMPTY' && mode === 'edit' && !isSimulating) {
              const { pageX, pageY } = e.nativeEvent as any;
              useLadderStore.getState().startDragging(el.type as ActiveTool, pageX, pageY, undefined, el.id);
            }
          }}
          delayLongPress={250}
        />
      </G>
    );
  };

  const renderBranchPoint = (column: number, x: number, y: number, selected: boolean) => (
    <G key={`branch-point-${column}`} transform={`translate(${x}, ${y})`}>
      <Circle
        cx={GEO.columnWidth / 2}
        cy={GEO.centerY}
        r={selected ? 11 : 8}
        fill={selected ? GEO.colorPowerOn : 'rgba(255, 255, 255, 0.92)'}
        stroke="#247A3D"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <Rect x={0} y={0} width={GEO.columnWidth} height={GEO.rungHeight} fill="transparent" onPress={() => onBranchPointPress(column)} />
    </G>
  );

  return (
    <Svg
      width={LADDER_INTERNAL_WIDTH * scale}
      height={canvasHeight * scale}
      viewBox={`0 0 ${LADDER_INTERNAL_WIDTH} ${canvasHeight}`}
    >
        {/* 1. BACKGROUND */}
        <Rect x={0} y={0} width={LADDER_INTERNAL_WIDTH} height={canvasHeight} fill={GEO.colorCanvas} />

        {/* 2. RAILS */}
        <Line x1={GEO.leftRailX} y1={GEO.topPadding} x2={GEO.leftRailX} y2={canvasHeight - 30} stroke={GEO.colorRailLeft} strokeWidth={GEO.railWidth} vectorEffect="non-scaling-stroke" />
        <Line x1={GEO.rightRailX} y1={GEO.topPadding} x2={GEO.rightRailX} y2={canvasHeight - 30} stroke={GEO.colorRailRight} strokeWidth={GEO.railWidth} vectorEffect="non-scaling-stroke" />

        {rungLayouts.map(({ rung, y: rungY, height: rungHeight }, rIdx) => {
          const allRungElements = rung.elementIds
            .map(id => elements[id])
            .filter((el): el is LadderElement => !!el);
          const rungElements = allRungElements.filter(el => el.type !== 'EMPTY');
          const normalElements = rungElements.filter(el => (el.branchIndex || 0) === 0);
          const branchElements = rungElements.filter(el => (el.branchIndex || 0) > 0);
          const branchRows = Array.from(new Set(allRungElements.filter(el => (el.branchIndex || 0) > 0).map(el => el.branchIndex))).sort((a, b) => a - b);
          const selectedRung = selectedRungId === rung.id;
          const toolTargetRung = hoveredDropZoneId === rung.id || (!!activeTool && selectedRung && !selectedElementId && mode === 'edit' && !isSimulating);
          const showBranchPoints = mode === 'edit' && selectedRung && !isSimulating && (
            interactionMode === 'choosing-branch-start' || interactionMode === 'choosing-branch-end'
          );
          const branchPointElements = normalElements
            .filter(el => el.type !== 'EMPTY')
            .sort((a, b) => a.column - b.column)
            .filter(el => interactionMode === 'choosing-branch-start' || branchStartColumn === null || el.column > branchStartColumn);
          
          // Usado como origem relativa para a Rung; o AnimatedRungGroup fará a translação real.
          const localY = 0; 
          const isHighlighted = highlightedRungId === rung.id;

          return (
            <AnimatedRungGroup key={rung.id} targetY={rungY}>
              <HighlightOverlay isHighlighted={isHighlighted} width={GEO.rightRailX - GEO.leftRailX} height={rungHeight} y={localY} />
              {selectedRung && mode === 'edit' && (
                <Rect
                  x={GEO.leftRailX}
                  y={localY + 6}
                  width={GEO.rightRailX - GEO.leftRailX}
                  height={rungHeight - 12}
                  rx={18}
                  fill={toolTargetRung ? 'rgba(31, 41, 51, 0.05)' : GEO.colorSelection}
                />
              )}

              <Rect
                x={GEO.leftRailX}
                y={localY}
                width={GEO.rightRailX - GEO.leftRailX}
                height={rungHeight}
                fill="transparent"
                onPress={() => onRungPress(rung.id)}
              />

              {/* 3. RUNG INDEX */}
              <SvgText x={GEO.leftRailX - 12} y={localY + GEO.centerY + 4} fontSize={10} fontWeight="900" textAnchor="end" fill="#CBD5E1">{rIdx}</SvgText>

              {/* 4. BASE LINE (BLACK) */}
              <Line x1={GEO.leftRailX} y1={localY + GEO.centerY} x2={GEO.rightRailX} y2={localY + GEO.centerY} stroke={GEO.colorPowerOff} strokeWidth={GEO.lineWidth} strokeOpacity={0.9} vectorEffect="non-scaling-stroke" />
              
              {/* 5. ENERGIZED OVERLAY (GREEN) */}
              {rung.isPowered && (
                <Line x1={GEO.leftRailX} y1={localY + GEO.centerY} x2={GEO.rightRailX} y2={localY + GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth} vectorEffect="non-scaling-stroke" />
              )}

              {/* 6. BRANCH WIRES */}
              {branchRows.map(branchIndex => {
                const rowElements = allRungElements.filter(el => el.branchIndex === branchIndex);
                const branchY = getBranchY(localY, branchIndex);
                const branchPowered = rowElements.some(el => el.powerIn || el.powerOut);
                const branchColor = branchPowered ? GEO.colorPowerOn : GEO.colorPowerOff;
                const branchWidth = branchPowered ? GEO.activeLineWidth : GEO.lineWidth;
                const columns = rowElements.map(el => el.column);
                const startColumn = Math.min(...columns);
                const endColumn = Math.max(...columns);
                const bStartX = startColumn <= 0 ? GEO.leftRailX : getElementX({ ...rowElements[0], column: startColumn }) + GEO.columnWidth / 2;
                const bEndX = getElementX({ ...rowElements[0], column: endColumn }) + GEO.columnWidth / 2;
                const showHandles = mode === 'edit' && !isSimulating;

                let parentYStart = localY + GEO.centerY;
                let parentYEnd = localY + GEO.centerY;

                // Varre de trás para frente para encontrar o ramo "Pai" mais próximo acima deste
                for (let prevBranch = branchIndex - 1; prevBranch > 0; prevBranch--) {
                  const prevRowElements = allRungElements.filter(el => el.branchIndex === prevBranch);
                  if (prevRowElements.length > 0) {
                    const pCols = prevRowElements.map(el => el.column);
                    const pStart = Math.min(...pCols);
                    const pEnd = Math.max(...pCols);
                    
                    if (pStart <= startColumn && pEnd >= startColumn && parentYStart === localY + GEO.centerY) {
                      parentYStart = getBranchY(localY, prevBranch) + GEO.centerY;
                    }
                    if (pStart <= endColumn && pEnd >= endColumn && parentYEnd === localY + GEO.centerY) {
                      parentYEnd = getBranchY(localY, prevBranch) + GEO.centerY;
                    }
                  }
                }

                return (
                  <G key={`${rung.id}-branch-${branchIndex}`}>
                    <Line x1={bStartX} y1={parentYStart} x2={bStartX} y2={branchY + GEO.centerY} stroke={branchColor} strokeWidth={branchWidth} vectorEffect="non-scaling-stroke" />
                    <Line x1={bEndX} y1={parentYEnd} x2={bEndX} y2={branchY + GEO.centerY} stroke={branchColor} strokeWidth={branchWidth} vectorEffect="non-scaling-stroke" />
                    <Line x1={bStartX} y1={branchY + GEO.centerY} x2={bEndX} y2={branchY + GEO.centerY} stroke={branchColor} strokeWidth={branchWidth} vectorEffect="non-scaling-stroke" />
                    {showHandles && (
                      <G>
                        <Circle cx={bStartX} cy={parentYStart} r={6} fill="#E7F1FF" stroke="#0D6EFD" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
                        <Rect x={bStartX - 16} y={parentYStart - 16} width={32} height={32} fill="transparent" onPressIn={(e) => {
                          const { pageX, pageY } = e.nativeEvent as any;
                          useLadderStore.getState().startDragging('RESIZE_BRANCH_START', pageX, pageY, { rungId: rung.id, branchIndex });
                        }} />
                        <Circle cx={bEndX} cy={parentYEnd} r={6} fill="#E7F1FF" stroke="#0D6EFD" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
                        <Rect x={bEndX - 16} y={parentYEnd - 16} width={32} height={32} fill="transparent" onPressIn={(e) => {
                          const { pageX, pageY } = e.nativeEvent as any;
                          useLadderStore.getState().startDragging('RESIZE_BRANCH_END', pageX, pageY, { rungId: rung.id, branchIndex });
                        }} />
                      </G>
                    )}
                  </G>
                );
              })}

              {/* 7. SYMBOLS + TEXT + HITBOXES */}
              {normalElements.map(el => renderElement(el, getElementX(el), localY))}
              {branchElements.map(el => {
                const branchY = getBranchY(localY, el.branchIndex || 0);
                return renderElement(el, getElementX(el), branchY);
              })}

              {showBranchPoints && branchPointElements.map(el => {
                return renderBranchPoint(el.column, getElementX(el), localY, branchStartColumn === el.column);
              })}

              {/* 8. RUNG DIVIDER */}
              <Line x1={GEO.leftRailX} y1={localY + rungHeight} x2={GEO.rightRailX} y2={localY + rungHeight} stroke={GEO.colorGuide} strokeWidth={1} strokeOpacity={0.65} vectorEffect="non-scaling-stroke" />
            </AnimatedRungGroup>
          );
        })}
    </Svg>
  );
});
