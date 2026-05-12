import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Play, Square } from 'lucide-react-native';
import { WorkspaceMode } from '../types';
import { THEME_TOKENS } from '../consts/themeTokens';

interface SimulationControlsProps {
  isSimulating: boolean;
  mode: WorkspaceMode;
  onToggle: () => void;
}

export const SimulationControls = React.memo(({ isSimulating, mode, onToggle }: SimulationControlsProps) => {
  const isSimulationMode = mode === 'simulate';

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.statusPill}>
        <View style={[styles.statusDot, isSimulating && styles.statusDotRunning]} />
        <Text style={styles.statusText}>
          {isSimulationMode ? `Simulação: ${isSimulating ? 'Rodando' : 'Parada'}` : 'Modo: Edição'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.runButton, isSimulating && styles.stopButton]}
        activeOpacity={0.78}
        onPress={onToggle}
      >
        {isSimulating ? <Square size={20} color="#FFFFFF" fill="#FFFFFF" /> : <Play size={20} color="#FFFFFF" fill="#FFFFFF" />}
        <Text style={styles.runText}>{isSimulating ? 'Parar' : 'Iniciar'}</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 22,
    minHeight: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 17,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    ...THEME_TOKENS.shadow.soft,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#D1D5DB',
  },
  statusDotRunning: {
    backgroundColor: '#2EAD5B',
  },
  statusText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '900',
  },
  runButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    minWidth: 140,
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 23,
    backgroundColor: THEME_TOKENS.color.railLeft,
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 5,
  },
  stopButton: {
    backgroundColor: '#E14D4D',
    shadowColor: '#7F1D1D',
  },
  runText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
