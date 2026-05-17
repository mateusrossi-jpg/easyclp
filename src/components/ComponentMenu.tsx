import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Search, X } from 'lucide-react-native';

import { ActiveTool } from '../types';
import { THEME_TOKENS } from '../consts/themeTokens';

const COMPONENT_GROUPS: Array<{
  title: string;
  items: Array<{ type: Exclude<ActiveTool, null>; title: string; description: string; symbol: string }>;
}> = [
  {
    title: 'Contatos',
    items: [
      { type: 'XIC', title: 'XIC', description: 'Contato normalmente aberto', symbol: '-| |-' },
      { type: 'XIO', title: 'XIO', description: 'Contato normalmente fechado', symbol: '-|/|-' },
    ],
  },
  {
    title: 'Bobinas',
    items: [
      { type: 'OTE', title: 'OTE', description: 'Saída energizada', symbol: '-( )-' },
      { type: 'OTL', title: 'OTL', description: 'Set / trava saída', symbol: '-(S)-' },
      { type: 'OTU', title: 'OTU', description: 'Reset / destrava saída', symbol: '-(R)-' },
    ],
  },
  {
    title: 'Temporizadores',
    items: [
      { type: 'TON', title: 'TON', description: 'Timer on-delay', symbol: 'TON' },
    ],
  },
  {
    title: 'Contadores',
    items: [
      { type: 'CTU', title: 'CTU', description: 'Contador crescente', symbol: 'CTU' },
    ],
  },
  {
    title: 'Comparadores',
    items: [
      { type: 'GEQ', title: 'GEQ', description: 'Maior ou igual', symbol: '>=' },
      { type: 'LEQ', title: 'LEQ', description: 'Menor ou igual', symbol: '<=' },
      { type: 'BOX', title: 'BOX', description: 'Bloco livre', symbol: '[ ]' },
    ],
  },
  {
    title: 'Estrutura',
    items: [
      { type: 'RUNG', title: 'RUNG', description: 'Nova linha Ladder', symbol: '---' },
      { type: 'PARALLEL_BRANCH', title: 'BRANCH', description: 'Ramo paralelo', symbol: '[||]' },
    ],
  },
];

interface ComponentMenuProps {
  selectedTool: ActiveTool;
  visible: boolean;
  onClose: () => void;
  onSelect: (type: Exclude<ActiveTool, null>) => void;
}

export const ComponentMenu = React.memo(({ selectedTool, visible, onClose, onSelect }: ComponentMenuProps) => {
  const { width } = useWindowDimensions();
  const [query, setQuery] = React.useState('');
  const useWideGrid = width >= 720;
  const normalizedQuery = query.trim().toLowerCase();
  const groups = React.useMemo(() => {
    if (!normalizedQuery) return COMPONENT_GROUPS;
    return COMPONENT_GROUPS
      .map(group => ({
        ...group,
        items: group.items.filter(item => {
          const haystack = `${item.title} ${item.description} ${group.title}`.toLowerCase();
          return haystack.includes(normalizedQuery);
        }),
      }))
      .filter(group => group.items.length > 0);
  }, [normalizedQuery]);

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Componentes</Text>
            <Text style={styles.subtitle}>Escolha e toque em um ponto da Ladder</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.72}>
            <X size={22} color="#111827" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Search size={18} color="#6B7280" strokeWidth={2.1} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar componente"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <ScrollView style={styles.groupScroll} contentContainerStyle={styles.groupContent} showsVerticalScrollIndicator={false}>
          {groups.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nenhum componente encontrado</Text>
              <Text style={styles.emptyCopy}>Tente buscar por contato, bobina, timer, contador ou comparador.</Text>
            </View>
          )}
          {groups.map(group => (
            <View key={group.title} style={styles.group}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <View style={[styles.grid, useWideGrid && styles.gridWide]}>
                {group.items.map(item => {
                  const active = selectedTool === item.type;
                  return (
                    <TouchableOpacity
                      key={item.type}
                      style={[styles.componentButton, useWideGrid && styles.componentButtonWide, active && styles.componentButtonActive]}
                      activeOpacity={0.78}
                      onPress={() => onSelect(item.type)}
                    >
                      <View style={[styles.symbolPlate, active && styles.symbolPlateActive]}>
                        <Text style={[styles.symbol, active && styles.activeText]}>{item.symbol}</Text>
                      </View>
                      <View style={styles.componentCopy}>
                        <Text style={[styles.componentTitle, active && styles.activeText]}>{item.title}</Text>
                        <Text style={styles.componentDescription}>{item.description}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.26)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 10,
    maxHeight: '86%',
    paddingBottom: 26,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#F8FAF6',
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
    shadowColor: '#24352C',
    shadowOffset: { width: 0, height: -16 },
    shadowOpacity: 0.16,
    shadowRadius: 34,
    elevation: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    marginBottom: 14,
    backgroundColor: '#CBD7CD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 3,
    color: THEME_TOKENS.color.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  closeButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: THEME_TOKENS.color.surface,
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
  },
  searchBox: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
  },
  searchInput: {
    flex: 1,
    color: THEME_TOKENS.color.text,
    fontSize: 15,
    fontWeight: '800',
    paddingVertical: 10,
  },
  groupScroll: {
    maxHeight: 488,
  },
  groupContent: {
    paddingBottom: 10,
    gap: 16,
  },
  emptyState: {
    minHeight: 128,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: THEME_TOKENS.color.surface,
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
  },
  emptyTitle: {
    color: THEME_TOKENS.color.text,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyCopy: {
    maxWidth: 260,
    marginTop: 6,
    color: THEME_TOKENS.color.textMuted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    textAlign: 'center',
  },
  group: {
    gap: 10,
  },
  groupTitle: {
    color: THEME_TOKENS.color.charcoal,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    paddingHorizontal: 2,
  },
  grid: {
    gap: 10,
  },
  gridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  componentButton: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
    shadowColor: '#24352C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.035,
    shadowRadius: 12,
    elevation: 1,
  },
  componentButtonWide: {
    width: '48.5%',
  },
  componentButtonActive: {
    borderColor: THEME_TOKENS.color.energy,
    backgroundColor: '#EEF8F1',
  },
  symbolPlate: {
    width: 52,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: THEME_TOKENS.color.surfaceMuted,
  },
  symbolPlateActive: {
    backgroundColor: '#DDEFE4',
  },
  symbol: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  componentCopy: {
    flex: 1,
  },
  componentTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  componentDescription: {
    marginTop: 4,
    color: THEME_TOKENS.color.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  activeText: {
    color: '#247A3D',
  },
});
