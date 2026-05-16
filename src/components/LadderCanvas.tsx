import React from 'react';
import { LayoutChangeEvent, PanResponder, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { LADDER_INTERNAL_WIDTH, LadderRenderer } from './LadderRenderer';
import { Dimensions, LayoutChangeEvent, PanResponder, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { getElementX, LADDER_INTERNAL_WIDTH, LadderRenderer } from './LadderRenderer';
import { getBranchY, getRungHeight, LADDER_GEOMETRY as GEO } from '../consts/ladderGeometry';
import { useLadderStore } from '../store/useLadderStore';
import { ActiveTool, EditorInteractionMode, WorkspaceMode } from '../types';
import { ActiveTool, EditorInteractionMode, LadderElement, WorkspaceMode } from '../types';

const BOTTOM_CONTROL_SPACE = 192;
const MIN_CONTAINER_WIDTH = 1;
const webBottomPadding = 'calc(192px + env(safe-area-inset-bottom))' as unknown as number;
const webTouchPan = 'pan-x pan-y' as unknown as 'auto';

export interface LadderCanvasHandle {
  fitToScreen: () => void;
  resetZoom: () => void;
  resetViewport: () => void;
}

interface LadderCanvasProps {
  mode: WorkspaceMode;
  selectedElementId: string | null;
  selectedRungId: string | null;
  interactionMode: EditorInteractionMode;
  branchStartColumn: number | null;
  activeTool: ActiveTool;
  onElementPress: (elementId: string) => void;
  onRungPress: (rungId: string) => void;
  onBranchPointPress: (column: number) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const calculateHitZone = (moveY: number, canvasX: number, canvasY: number, state: any, scale: number) => {
  // Lixeira / Trash Zone agora é detectada na parte inferior absoluta da tela
  if (state.dragState.draggedElementId && moveY > SCREEN_HEIGHT - 120) {
    return 'TRASH';
  }

  const colWidth = (GEO as any).columnWidth || 60;
  const rHeight = (GEO as any).rungHeight || (GEO as any).rungBaseHeight || 92;

  const rungs = Object.values(state.rungs).sort((a: any, b: any) => a.order - b.order);
  let currentY = GEO.topPadding;
  
  for (const rung of rungs) {
    const rungElements = rung.elementIds.map((id: string) => state.elements[id]).filter(Boolean);
    const height = getRungHeight(rungElements);
    
    const scaledY = currentY * scale;
    const scaledHeight = height * scale;

    if (canvasY >= scaledY && canvasY <= scaledY + scaledHeight) {
      const isResizing = state.dragState.tool === 'RESIZE_BRANCH_START' || state.dragState.tool === 'RESIZE_BRANCH_END';
      
      for (const el of rungElements) {
        if (el.type === 'EMPTY' || isResizing) {
          const elX = getElementX(el as LadderElement);
          const elY = (el.branchIndex || 0) > 0 ? getBranchY(currentY, el.branchIndex) : currentY;
          
          if (canvasX >= elX * scale && canvasX <= (elX + colWidth) * scale && canvasY >= elY * scale && canvasY <= (elY + rHeight) * scale) {
            return el.id;
          }
        }
      }
      
      if (canvasX >= GEO.leftRailX * scale && canvasX <= GEO.rightRailX * scale) {
        return rung.id;
      }
      return null;
    }
    currentY += height;
  }
  return null;
};

export const LadderCanvas = React.memo(React.forwardRef<LadderCanvasHandle, LadderCanvasProps>(({
  mode,
  selectedElementId,
  selectedRungId,
  interactionMode,
  branchStartColumn,
  activeTool,
  onElementPress,
  onRungPress,
  onBranchPointPress,
}, ref) => {
  const verticalScrollRef = React.useRef<ScrollView>(null);
  const horizontalScrollRef = React.useRef<ScrollView>(null);
  const [containerSize, setContainerSize] = React.useState({ width: 0, height: 0 });
  const [contentSize, setContentSize] = React.useState({ width: LADDER_INTERNAL_WIDTH, height: 0 });
  const [zoomMultiplier, setZoomMultiplier] = React.useState(1);
  const lastTapAt = React.useRef(0);

  const isDragging = useLadderStore(state => state.dragState.isDragging);
  const hasSelectedTool = !!useLadderStore(state => state.selectedTool);
  const scrollEnabled = !isDragging && !hasSelectedTool;
  const touchOffset = React.useRef({ x: 0, y: 0 });
  const scaleRef = React.useRef(1);

  const panResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => {
      const state = useLadderStore.getState();
      return !!state.selectedTool || state.dragState.isDragging;
    },
    onMoveShouldSetPanResponder: () => {
      const state = useLadderStore.getState();
      return !!state.selectedTool || state.dragState.isDragging;
    },
    onPanResponderGrant: (evt) => {
      const state = useLadderStore.getState();
      const { pageX, pageY, locationX, locationY } = evt.nativeEvent;
      
      touchOffset.current = {
        x: pageX - locationX,
        y: pageY - locationY
      };

      if (state.selectedTool && !state.dragState.isDragging) {
        state.startDragging(state.selectedTool, pageX, pageY);
        
        const dropZones = state.dropZones;
        let hitId = null;
        for (let i = dropZones.length - 1; i >= 0; i--) {
          const z = dropZones[i];
          if (locationX >= z.x && locationX <= z.x + z.width && locationY >= z.y && locationY <= z.y + z.height) {
            hitId = z.id;
            break;
          }
        }
        const hitId = calculateHitZone(pageY, locationX, locationY, state, scaleRef.current);
        state.setHoveredDropZone(hitId);
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      const { moveX, moveY } = gestureState;
      const state = useLadderStore.getState();
      state.setDragPosition(moveX, moveY);
      
      const canvasX = moveX - touchOffset.current.x;
      const canvasY = moveY - touchOffset.current.y;
      
      const dropZones = state.dropZones;
      let hitId = null;
      for (let i = dropZones.length - 1; i >= 0; i--) {
        const z = dropZones[i];
        if (canvasX >= z.x && canvasX <= z.x + z.width && canvasY >= z.y && canvasY <= z.y + z.height) {
          hitId = z.id;
          break;
        }
      }
      const hitId = calculateHitZone(moveY, canvasX, canvasY, state, scaleRef.current);
      state.setHoveredDropZone(hitId);
    },
    onPanResponderRelease: () => {
      const state = useLadderStore.getState();
      state.endDragging();
      if (state.selectedTool) state.setSelectedTool(null);
    },
    onPanResponderTerminate: () => {
      const state = useLadderStore.getState();
      state.endDragging();
      if (state.selectedTool) state.setSelectedTool(null);
    }
  }), []);

  const handleLayout = React.useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize(prev => {
      if (Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1) return prev;
      return { width, height };
    });
  }, []);

  const fitScale = React.useMemo(() => {
    const availableWidth = Math.max(containerSize.width, MIN_CONTAINER_WIDTH);
    const contentWidth = Math.max(contentSize.width, MIN_CONTAINER_WIDTH);
    return Math.min(availableWidth / contentWidth, 1);
  }, [containerSize.width, contentSize.width]);

  const scale = Math.min(fitScale * zoomMultiplier, 1);

  const scaledContentWidth = contentSize.width * scale;

  React.useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  const resetViewport = React.useCallback(() => {
    horizontalScrollRef.current?.scrollTo({ x: 0, animated: true });
    verticalScrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const fitToScreen = React.useCallback(() => {
    setZoomMultiplier(1);
    requestAnimationFrame(resetViewport);
  }, [resetViewport]);

  const resetZoom = React.useCallback(() => {
    setZoomMultiplier(1);
    requestAnimationFrame(resetViewport);
  }, [resetViewport]);

  React.useImperativeHandle(ref, () => ({ fitToScreen, resetZoom, resetViewport }), [fitToScreen, resetViewport, resetZoom]);

  const handleCanvasTouch = React.useCallback(() => {
    const now = Date.now();
    if (now - lastTapAt.current < 280) {
      fitToScreen();
    }
    lastTapAt.current = now;
  }, [fitToScreen]);

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <ScrollView
        ref={verticalScrollRef}
        style={styles.verticalScroll}
        scrollEnabled={scrollEnabled}
        contentContainerStyle={[
          styles.verticalContent,
          {
            minHeight: Math.max(containerSize.height, contentSize.height * scale + BOTTOM_CONTROL_SPACE),
            paddingBottom: Platform.OS === 'web' ? webBottomPadding : BOTTOM_CONTROL_SPACE,
          },
        ]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <ScrollView
          ref={horizontalScrollRef}
          horizontal
          bounces
          scrollEnabled={scrollEnabled}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.horizontalContent,
            { minWidth: Math.max(containerSize.width, scaledContentWidth) },
          ]}
          style={styles.horizontalScroll}
          onTouchEnd={handleCanvasTouch}
        >
          <View {...panResponder.panHandlers} style={{ flex: 1, minWidth: '100%', minHeight: '100%' }}>
            <LadderRenderer
              mode={mode}
              selectedElementId={selectedElementId}
              selectedRungId={selectedRungId}
              interactionMode={interactionMode}
              branchStartColumn={branchStartColumn}
              activeTool={activeTool}
              scale={scale}
              onContentSizeChange={setContentSize}
              onElementPress={onElementPress}
              onRungPress={onRungPress}
              onBranchPointPress={onBranchPointPress}
            />
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFCFA',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { touchAction: webTouchPan } : {}),
  },
  verticalScroll: {
    flex: 1,
    ...(Platform.OS === 'web' ? { touchAction: webTouchPan } : {}),
  },
  verticalContent: {
    paddingTop: 12,
  },
  horizontalScroll: {
    flexGrow: 0,
    ...(Platform.OS === 'web' ? { touchAction: webTouchPan } : {}),
  },
  horizontalContent: {
    paddingLeft: 0,
    paddingRight: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
});
