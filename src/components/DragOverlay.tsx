import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useLadderStore } from '../store/useLadderStore';
import { ActiveTool } from '../types';

// Você pode substituir este componente interno pelos seus SVGs reais depois
const ToolPreview = ({ tool }: { tool: ActiveTool }) => {
  if (tool === 'RESIZE_BRANCH_START' || tool === 'RESIZE_BRANCH_END') {
    return (
      <View style={[styles.toolPreview, { borderRadius: 30, width: 24, height: 24, borderWidth: 1.5 }]}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#0D6EFD' }} />
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

  // Dimensões estimadas da peça.
  // Subtraímos metade para que a peça fique exatamente centralizada sob a ponta do dedo.
  const ELEMENT_WIDTH = 60;
  const ELEMENT_HEIGHT = 60;

  const x = dragState.x - ELEMENT_WIDTH / 2;
  const y = dragState.y - ELEMENT_HEIGHT / 2;

  return (
    <View
      pointerEvents="none" // Essencial: impede que o overlay roube o evento do dedo
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
    opacity: 0.7, // Deixa a peça semi-transparente
  },
  toolPreview: {
    width: 60,
    height: 60,
    backgroundColor: '#E7F1FF',
    borderWidth: 2,
    borderColor: '#0D6EFD',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolText: {
    color: '#0D6EFD',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});