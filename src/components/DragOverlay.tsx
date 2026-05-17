import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useLadderStore } from '../store/useLadderStore';
import { ActiveTool } from '../types';
import { THEME_TOKENS } from '../consts/themeTokens';

const ToolPreview = ({ tool }: { tool: ActiveTool }) => {
  if (tool === 'RESIZE_BRANCH_START' || tool === 'RESIZE_BRANCH_END') {
    return (
      <View style={styles.resizePreview}>
        <View style={styles.resizeDot} />
      </View>
    );
  }
  return (
    <View style={styles.toolPreview}>
      <Text style={styles.toolText}>{tool}</Text>
    </View>
  );
};

export const DragOverlay = () => {
  const dragState = useLadderStore((state) => state.dragState);

  if (!dragState.isDragging || !dragState.tool) {
    return null;
  }

  const ELEMENT_WIDTH = 60;
  const ELEMENT_HEIGHT = 60;

  const x = dragState.x - ELEMENT_WIDTH / 2;
  const y = dragState.y - ELEMENT_HEIGHT / 2;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.overlayContainer,
        { transform: [{ translateX: x }, { translateY: y }] },
      ]}
    >
      <ToolPreview tool={dragState.tool} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10000,
    elevation: 10000,
    opacity: 0.82,
  },
  toolPreview: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(248, 250, 246, 0.94)',
    borderWidth: 2,
    borderColor: THEME_TOKENS.color.energy,
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#24352C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  resizePreview: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: THEME_TOKENS.color.energy,
    backgroundColor: 'rgba(248, 250, 246, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resizeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME_TOKENS.color.energy,
  },
  toolText: {
    color: THEME_TOKENS.color.railLeft,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
