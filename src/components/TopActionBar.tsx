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
    ? isSimulating ? 'Simulação rodando' : 'Simulação parada'
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
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: 'rgba(248, 250, 246, 0.985)',
    borderBottomWidth: 1,
    borderBottomColor: THEME_TOKENS.color.borderSubtle,
    ...THEME_TOKENS.shadow.soft,
  },
  mainRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  brandButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: THEME_TOKENS.color.surface,
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
    ...THEME_TOKENS.shadow.soft,
  },
  brandButtonCompact: {
    width: 46,
    height: 46,
    borderRadius: 15,
  },
  titleWrap: {
    flex: 1,
    gap: 1,
  },
  title: {
    color: '#111827',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 0,
  },
  titleCompact: {
    fontSize: 19,
  },
  subtitle: {
    color: THEME_TOKENS.color.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  topRunButton: {
    minWidth: 110,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: 17,
    backgroundColor: THEME_TOKENS.color.railLeft,
    shadowColor: '#1D5D38',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 5,
  },
  topRunButtonCompact: {
    minWidth: 96,
    height: 48,
    paddingHorizontal: 12,
    gap: 6,
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
  modeSwitch: {
    minHeight: 44,
    flexDirection: 'row',
    gap: 5,
    padding: 4,
    borderRadius: 16,
    backgroundColor: THEME_TOKENS.color.surfaceMuted,
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
  },
  modeButton: {
    flex: 1,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  modeButtonActive: {
    backgroundColor: THEME_TOKENS.color.surface,
    ...THEME_TOKENS.shadow.soft,
  },
  modeText: {
    color: THEME_TOKENS.color.textMuted,
    fontSize: 13,
    fontWeight: '900',
  },
  modeTextActive: {
    color: '#111827',
  },
  metricStrip: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
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
    height: 18,
    backgroundColor: THEME_TOKENS.color.borderSubtle,
  },
  metricLabel: {
    color: THEME_TOKENS.color.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  metricValue: {
    color: THEME_TOKENS.color.charcoal,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 2,
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 6,
    padding: 3,
    borderRadius: 17,
    backgroundColor: THEME_TOKENS.color.surfaceMuted,
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
  },
  iconButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: THEME_TOKENS.color.surface,
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
    ...THEME_TOKENS.shadow.soft,
  },
  iconButtonCompact: {
    width: 42,
    height: 42,
    borderRadius: 14,
  },
  iconButtonDisabled: {
    backgroundColor: THEME_TOKENS.color.surfaceMuted,
    shadowOpacity: 0.02,
  },
});
