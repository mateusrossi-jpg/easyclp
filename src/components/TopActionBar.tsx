import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import {
  List,
  Maximize2,
  Menu,
  Play,
  Redo2,
  RotateCcw,
  Square,
  Undo2,
} from 'lucide-react-native';
import { WorkspaceMode } from '../types';
import { THEME_TOKENS } from '../consts/themeTokens';

interface TopActionBarProps {
  onOpenVariables: () => void;
  onCenterView: () => void;
  onResetZoom: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  mode: WorkspaceMode;
  onModeChange: (mode: WorkspaceMode) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  rungCount: number;
  activeSignalCount: number;
  totalSignalCount: number;
  projectName?: string;
}

const iconColor = '#1F2937';

export const TopActionBar = React.memo(({
  onOpenVariables,
  onCenterView,
  onResetZoom,
  isSimulating,
  onToggleSimulation,
  mode,
  onModeChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  rungCount,
  activeSignalCount,
  totalSignalCount,
  projectName,
}: TopActionBarProps) => {
  const { width } = useWindowDimensions();
  const compact = width < 390;
  const subtitle = mode === 'simulate'
    ? isSimulating ? 'Simulação em execução' : 'Simulação pausada'
    : projectName || 'Editor Ladder';

  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        <TouchableOpacity style={[styles.brandButton, compact && styles.brandButtonCompact]} activeOpacity={0.75} onPress={onOpenVariables}>
          <Menu size={compact ? 22 : 25} color={iconColor} strokeWidth={2.2} />
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <Text style={[styles.title, compact && styles.titleCompact]}>EasyCLP</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        </View>

        <TouchableOpacity
          style={[styles.topRunButton, compact && styles.topRunButtonCompact, isSimulating && styles.topStopButton]}
          activeOpacity={0.78}
          onPress={onToggleSimulation}
        >
          {isSimulating ? <Square size={compact ? 16 : 18} color="#FFFFFF" fill="#FFFFFF" /> : <Play size={compact ? 16 : 18} color="#FFFFFF" fill="#FFFFFF" />}
          <Text style={[styles.topRunText, compact && styles.topRunTextCompact]}>{isSimulating ? 'Parar' : 'Iniciar'}</Text>
        </TouchableOpacity>
      </View>

      {mode === 'simulate' && isSimulating && (
        <View style={styles.simHintBanner}>
          <View style={styles.simHintDot} />
          <Text style={styles.simHintText}>Toque em contatos BOOL para alternar entradas</Text>
        </View>
      )}

      <View style={styles.modeSwitch}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'edit' && styles.modeButtonActive]}
          activeOpacity={0.76}
          onPress={() => onModeChange('edit')}
        >
          <Text style={[styles.modeText, mode === 'edit' && styles.modeTextActive]}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'simulate' && styles.modeButtonActive]}
          activeOpacity={0.76}
          onPress={() => onModeChange('simulate')}
        >
          <Text style={[styles.modeText, mode === 'simulate' && styles.modeTextActive]}>Simular</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metricStrip}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Rungs</Text>
          <Text style={styles.metricValue}>{rungCount}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Sinais</Text>
          <Text style={styles.metricValue}>{activeSignalCount}/{totalSignalCount}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Modo</Text>
          <Text style={styles.metricValue}>{mode === 'simulate' ? 'SIM' : 'EDIT'}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        bounces
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.actions}
      >
        <View style={styles.actionGroup}>
          <ToolbarButton compact={compact} icon={<Undo2 size={compact ? 19 : 21} color={canUndo && !isSimulating ? iconColor : '#9CA3AF'} strokeWidth={2} />} onPress={onUndo} disabled={!canUndo || isSimulating} />
          <ToolbarButton compact={compact} icon={<Redo2 size={compact ? 19 : 21} color={canRedo && !isSimulating ? iconColor : '#9CA3AF'} strokeWidth={2} />} onPress={onRedo} disabled={!canRedo || isSimulating} />
        </View>
        <View style={styles.actionGroup}>
          <ToolbarButton compact={compact} icon={<Maximize2 size={compact ? 18 : 20} color={iconColor} strokeWidth={2} />} onPress={onCenterView} />
          <ToolbarButton compact={compact} icon={<RotateCcw size={compact ? 18 : 20} color={iconColor} strokeWidth={2} />} onPress={onResetZoom} />
        </View>
        <View style={styles.actionGroup}>
          <ToolbarButton compact={compact} icon={<List size={compact ? 19 : 21} color={iconColor} strokeWidth={2} />} onPress={onOpenVariables} />
        </View>
      </ScrollView>
    </View>
  );
});

const ToolbarButton = React.memo(({ icon, onPress, disabled, compact }: { icon: React.ReactNode; onPress?: () => void; disabled?: boolean; compact?: boolean }) => (
  <TouchableOpacity style={[styles.iconButton, compact && styles.iconButtonCompact, disabled && styles.iconButtonDisabled]} activeOpacity={0.72} onPress={onPress} disabled={disabled}>
    {icon}
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    ...THEME_TOKENS.shadow.soft,
  },
  mainRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...THEME_TOKENS.shadow.soft,
  },
  brandButtonCompact: {
    width: 44,
    height: 44,
    borderRadius: 13,
  },
  titleWrap: {
    flex: 1,
    gap: 0,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  titleCompact: {
    fontSize: 18,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '700',
    marginTop: -2,
  },
  topRunButton: {
    minWidth: 104,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: THEME_TOKENS.color.railLeft,
    shadowColor: '#1D5D38',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  topRunButtonCompact: {
    minWidth: 90,
    height: 44,
    paddingHorizontal: 10,
    gap: 4,
  },
  topStopButton: {
    backgroundColor: THEME_TOKENS.color.danger,
    shadowColor: '#7F1D1D',
  },
  topRunText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  topRunTextCompact: {
    fontSize: 13,
  },
  simHintBanner: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.15)',
  },
  simHintDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  simHintText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '800',
  },
  modeSwitch: {
    minHeight: 40,
    flexDirection: 'row',
    gap: 4,
    padding: 3,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modeButton: {
    flex: 1,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  modeButtonActive: {
    backgroundColor: '#FFFFFF',
    ...THEME_TOKENS.shadow.soft,
  },
  modeText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '900',
  },
  modeTextActive: {
    color: '#111827',
  },
  metricStrip: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  metricDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
  },
  metricLabel: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '900',
  },
  metricValue: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 2,
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 4,
    padding: 3,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...THEME_TOKENS.shadow.soft,
  },
  iconButtonCompact: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  iconButtonDisabled: {
    backgroundColor: '#F9FAFB',
    shadowOpacity: 0.02,
    opacity: 0.5,
  },
});
