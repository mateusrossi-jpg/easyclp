import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Play, Square } from 'lucide-react-native';
import { WorkspaceMode } from '../types';
import { THEME_TOKENS } from '../consts/themeTokens';

interface SimulationControlsProps {
  isSimulating: boolean;
  mode: WorkspaceMode;
  onToggle: () => void;
  activeSignalCount: number;
  totalSignalCount: number;
}

export const SimulationControls = React.memo(({ isSimulating, mode, onToggle, activeSignalCount, totalSignalCount }: SimulationControlsProps) => {
  const { width } = useWindowDimensions();
  const compact = width < 390;
  const isSimulationMode = mode === 'simulate';

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={[styles.statusPill, compact && styles.statusPillCompact]}>
        <View style={[styles.statusDot, isSimulating && styles.statusDotRunning]} />
        <View style={styles.statusCopy}>
          <Text style={[styles.statusText, compact && styles.statusTextCompact]} numberOfLines={1}>
            {isSimulationMode ? `Simulação: ${isSimulating ? 'Rodando' : 'Parada'}` : 'Modo: Edição'}
          </Text>
          <Text style={styles.statusMeta} numberOfLines={1}>{activeSignalCount}/{totalSignalCount} sinais ativos</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.runButton, compact && styles.runButtonCompact, isSimulating && styles.stopButton]}
        activeOpacity={0.78}
        onPress={onToggle}
      >
        {isSimulating ? <Square size={compact ? 17 : 20} color="#FFFFFF" fill="#FFFFFF" /> : <Play size={compact ? 17 : 20} color="#FFFFFF" fill="#FFFFFF" />}
        <Text style={[styles.runText, compact && styles.runTextCompact]}>{isSimulating ? 'Parar' : 'Iniciar'}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusPill: {
    minHeight: 50,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
    ...THEME_TOKENS.shadow.soft,
  },
  statusPillCompact: {
    paddingHorizontal: 12,
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
  statusCopy: {
    flex: 1,
  },
  statusText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '900',
  },
  statusTextCompact: {
    fontSize: 12,
  },
  statusMeta: {
    marginTop: 2,
    color: THEME_TOKENS.color.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  runButton: {
    minWidth: 132,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 19,
    backgroundColor: THEME_TOKENS.color.railLeft,
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 5,
  },
  runButtonCompact: {
    minWidth: 108,
    height: 54,
    paddingHorizontal: 12,
    gap: 6,
  },
  stopButton: {
    backgroundColor: THEME_TOKENS.color.danger,
    shadowColor: '#7F1D1D',
  },
  runText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  runTextCompact: {
    fontSize: 14,
  },
});
