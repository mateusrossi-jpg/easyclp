import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLadderStore } from '../store/useLadderStore';
import { ElementType } from '../types';

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
                <Text style={styles.title}>Editar instrucao</Text>
              </View>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{localType}</Text>
              </View>
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

            <Text style={styles.label}>Endereco / Tag</Text>
            <TextInput
              style={styles.input}
              value={localAddress}
              onChangeText={setLocalAddress}
              placeholder="ex: I0.0 ou Motor_A"
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 999,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 24,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 12,
  },
  eyebrow: {
    color: '#6C757D',
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'monospace',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  title: {
    color: '#212529',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
  },
  typeBadge: {
    minWidth: 48,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    backgroundColor: '#F8F9FA',
  },
  typeBadgeText: {
    color: '#0D6EFD',
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  label: {
    color: '#6C757D',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#E7F1FF',
    borderColor: '#0D6EFD',
  },
  typeBtnText: {
    color: '#495057',
    fontWeight: '800',
    fontSize: 11,
  },
  typeBtnTextActive: {
    color: '#0D6EFD',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 6,
    color: '#212529',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'monospace',
    marginBottom: 28,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerRight: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  deleteBtn: {
    paddingVertical: 10,
  },
  deleteBtnText: {
    color: '#F87171',
    fontWeight: '800',
    fontSize: 13,
  },
  branchBtn: {
    paddingVertical: 10,
  },
  branchBtnText: {
    color: '#00E5FF',
    fontWeight: '800',
    fontSize: 13,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelBtnText: {
    color: '#9CA3AF',
    fontWeight: '800',
    fontSize: 13,
  },
  saveBtn: {
    backgroundColor: '#111111',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});