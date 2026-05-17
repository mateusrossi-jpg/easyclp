import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLadderStore } from '../store/useLadderStore';
import { ElementType } from '../types';
import { THEME_TOKENS } from '../consts/themeTokens';

const INSTRUCTION_TYPES: { type: ElementType; label: string }[] = [
  { type: 'XIC', label: 'NO / XIC' },
  { type: 'XIO', label: 'NC / XIO' },
  { type: 'OTE', label: 'COIL / OTE' },
  { type: 'TON', label: 'TIMER / TON' },
  { type: 'CTU', label: 'COUNTER / CTU' },
  { type: 'OTL', label: 'LATCH / OTL' },
  { type: 'OTU', label: 'UNLATCH / OTU' },
  { type: 'GEQ', label: 'COMPARE / GEQ' },
  { type: 'LEQ', label: 'COMPARE / LEQ' },
  { type: 'BOX', label: 'FUNCTION / BOX' },
];

const isElementTool = (tool: unknown): tool is ElementType => {
  return typeof tool === 'string' && INSTRUCTION_TYPES.some(inst => inst.type === tool);
};

const getInstructionHint = (type: ElementType) => {
  if (type === 'XIC') return 'Lê verdadeiro quando a tag está ON.';
  if (type === 'XIO') return 'Lê verdadeiro quando a tag está OFF.';
  if (type === 'OTE') return 'Escreve a saída conforme a energia da rung.';
  if (type === 'OTL') return 'Trava a saída em ON quando energizado.';
  if (type === 'OTU') return 'Destrava a saída quando energizado.';
  if (type === 'TON') return 'Temporizador retentivo enquanto a entrada está ON.';
  if (type === 'CTU') return 'Conta bordas de subida até o preset.';
  if (type === 'GEQ') return 'Compara se o valor à esquerda é maior ou igual.';
  if (type === 'LEQ') return 'Compara se o valor à esquerda é menor ou igual.';
  return 'Bloco livre para função auxiliar.';
};

export const ElementEditorModal = () => {
  const editingElementId = useLadderStore(state => state.editingElementId);
  const elements = useLadderStore(state => state.elements);
  const selectedTool = useLadderStore(state => state.selectedTool);
  const setEditingElementId = useLadderStore(state => state.setEditingElementId);
  const setElement = useLadderStore(state => state.setElement);
  const createBranch = useLadderStore(state => state.createBranch);

  const [localType, setLocalType] = useState<ElementType>('EMPTY');
  const [localAddress, setLocalAddress] = useState('');
  const [cachedElementId, setCachedElementId] = useState<string | null>(null);

  useEffect(() => {
    if (editingElementId) {
      setCachedElementId(editingElementId);
      if (elements[editingElementId]) {
        const el = elements[editingElementId];
        setLocalType(el.type === 'EMPTY' ? (isElementTool(selectedTool) ? selectedTool : 'XIC') : el.type);
        setLocalAddress(el.address || '');
      }
    }
  }, [editingElementId, elements, selectedTool]);

  const activeElementId = editingElementId || cachedElementId;
  const element = activeElementId ? elements[activeElementId] : null;

  const handleSave = () => {
    if (!element) return;
    setElement(element.rungId, element.id, localType, localAddress.trim());
    setEditingElementId(null);
  };

  const handleDelete = () => {
    if (!element) return;
    setElement(element.rungId, element.id, 'EMPTY', '');
    setEditingElementId(null);
  };

  const handleCreateBranch = () => {
    if (!element) return;
    createBranch(element.id);
    setEditingElementId(null);
  };

  return (
    <Modal transparent animationType="fade" visible={!!editingElementId}>
      {element && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.overlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>Coluna {element.column + 1}</Text>
                <Text style={styles.title}>Editar instrução</Text>
              </View>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{localType}</Text>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryType}>{localType}</Text>
              <Text style={styles.summaryAddress} numberOfLines={1}>{localAddress.trim() || 'Sem tag definida'}</Text>
              <Text style={styles.summaryHint}>{getInstructionHint(localType)}</Text>
            </View>

            <Text style={styles.label}>Tipo</Text>
            <View style={styles.typeGrid}>
              {INSTRUCTION_TYPES.map(inst => (
                <TouchableOpacity
                  key={inst.type}
                  style={[styles.typeBtn, localType === inst.type && styles.typeBtnActive]}
                  onPress={() => setLocalType(inst.type)}
                >
                  <Text style={[styles.typeBtnText, localType === inst.type && styles.typeBtnTextActive]}>
                    {inst.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Endereço / tag</Text>
            <TextInput
              style={styles.input}
              value={localAddress}
              onChangeText={setLocalAddress}
              placeholder="ex: X0 ou Motor_A"
              placeholderTextColor="#666"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.footer}>
              <View style={styles.footerLeft}>
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                  <Text style={styles.deleteBtnText}>Limpar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.branchBtn} onPress={handleCreateBranch}>
                  <Text style={styles.branchBtnText}>+ Ramo</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.footerRight}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingElementId(null)}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#F8FAF6',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
    shadowColor: '#24352C',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 34,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  eyebrow: {
    color: THEME_TOKENS.color.textMuted,
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'monospace',
    marginBottom: 3,
  },
  title: {
    color: THEME_TOKENS.color.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
  },
  typeBadge: {
    minWidth: 48,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
    backgroundColor: THEME_TOKENS.color.surface,
  },
  typeBadgeText: {
    color: THEME_TOKENS.color.railLeft,
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  label: {
    color: THEME_TOKENS.color.textMuted,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 10,
    letterSpacing: 0,
  },
  summaryCard: {
    gap: 5,
    padding: 13,
    marginBottom: 18,
    borderRadius: 15,
    backgroundColor: THEME_TOKENS.color.surface,
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
  },
  summaryType: {
    color: THEME_TOKENS.color.railLeft,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  summaryAddress: {
    color: THEME_TOKENS.color.text,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  summaryHint: {
    color: THEME_TOKENS.color.textMuted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 22,
  },
  typeBtn: {
    width: '48%',
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: THEME_TOKENS.color.surface,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#EAF6EE',
    borderColor: THEME_TOKENS.color.energy,
  },
  typeBtnText: {
    color: THEME_TOKENS.color.charcoal,
    fontWeight: '800',
    fontSize: 11,
  },
  typeBtnTextActive: {
    color: THEME_TOKENS.color.railLeft,
  },
  input: {
    backgroundColor: THEME_TOKENS.color.surface,
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
    borderRadius: 14,
    color: THEME_TOKENS.color.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'monospace',
    marginBottom: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footerRight: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  deleteBtn: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  deleteBtnText: {
    color: THEME_TOKENS.color.danger,
    fontWeight: '800',
    fontSize: 13,
  },
  branchBtn: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  branchBtnText: {
    color: THEME_TOKENS.color.railLeft,
    fontWeight: '800',
    fontSize: 13,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  cancelBtnText: {
    color: THEME_TOKENS.color.textMuted,
    fontWeight: '800',
    fontSize: 13,
  },
  saveBtn: {
    backgroundColor: THEME_TOKENS.color.charcoal,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 13,
    shadowColor: '#24352C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
