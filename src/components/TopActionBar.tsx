import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Copy,
  Eye,
  List,
  Maximize2,
  Menu,
  MoreHorizontal,
  Play,
  Redo2,
  RotateCcw,
  Square,
  Trash2,
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
}: TopActionBarProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        <TouchableOpacity style={styles.brandButton} activeOpacity={0.75} onPress={onOpenVariables}>
          <Menu size={25} color={iconColor} strokeWidth={2.2} />
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <Text style={styles.title}>EasyCLP</Text>
          <Text style={styles.subtitle}>Ladder mobile</Text>
        </View>

        <TouchableOpacity
          style={[styles.topRunButton, isSimulating && styles.topStopButton]}
          activeOpacity={0.78}
          onPress={onToggleSimulation}
        >
          {isSimulating ? <Square size={18} color="#FFFFFF" fill="#FFFFFF" /> : <Play size={18} color="#FFFFFF" fill="#FFFFFF" />}
          <Text style={styles.topRunText}>{isSimulating ? 'Parar' : 'Iniciar'}</Text>
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

      <ScrollView
        horizontal
        bounces
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.actions}
      >
        <ToolbarButton icon={<Undo2 size={21} color={iconColor} strokeWidth={2} />} />
        <ToolbarButton icon={<Redo2 size={21} color={iconColor} strokeWidth={2} />} />
        <ToolbarButton icon={<Maximize2 size={20} color={iconColor} strokeWidth={2} />} onPress={onCenterView} />
        <ToolbarButton icon={<RotateCcw size={20} color={iconColor} strokeWidth={2} />} onPress={onResetZoom} />
        <ToolbarButton icon={<Eye size={21} color={iconColor} strokeWidth={2} />} />
        <ToolbarButton icon={<Trash2 size={21} color={iconColor} strokeWidth={2} />} />
        <ToolbarButton icon={<Copy size={21} color={iconColor} strokeWidth={2} />} />
        <ToolbarButton icon={<List size={21} color={iconColor} strokeWidth={2} />} onPress={onOpenVariables} />
        <ToolbarButton icon={<MoreHorizontal size={22} color={iconColor} strokeWidth={2} />} />
      </ScrollView>
    </View>
  );
});

const ToolbarButton = React.memo(({ icon, onPress }: { icon: React.ReactNode; onPress?: () => void }) => (
  <TouchableOpacity style={styles.iconButton} activeOpacity={0.72} onPress={onPress}>
    {icon}
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: 'rgba(252, 253, 251, 0.985)',
    ...THEME_TOKENS.shadow.soft,
  },
  mainRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: THEME_TOKENS.color.surface,
    ...THEME_TOKENS.shadow.soft,
  },
  titleWrap: {
    flex: 1,
    gap: 1,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '800',
  },
  topRunButton: {
    minWidth: 116,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: 19,
    backgroundColor: THEME_TOKENS.color.railLeft,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 5,
  },
  topStopButton: {
    backgroundColor: '#DC4A4A',
    shadowColor: '#7F1D1D',
  },
  topRunText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  modeSwitch: {
    minHeight: 46,
    flexDirection: 'row',
    gap: 6,
    padding: 5,
    borderRadius: 19,
    backgroundColor: THEME_TOKENS.color.surfaceMuted,
  },
  modeButton: {
    flex: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  modeButtonActive: {
    backgroundColor: THEME_TOKENS.color.surface,
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
  actions: {
    flexDirection: 'row',
    gap: 9,
    paddingRight: 2,
  },
  iconButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: THEME_TOKENS.color.surface,
    ...THEME_TOKENS.shadow.soft,
  },
});
