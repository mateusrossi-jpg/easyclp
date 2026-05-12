import React, { useCallback, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Copy, GitBranch, PenLine, Plus, Settings2, Trash2, Undo2, Redo2 } from 'lucide-react-native';

import { ComponentMenu } from './ComponentMenu';
import { ElementEditorModal } from './ElementEditorModal';
import { LadderCanvas, LadderCanvasHandle } from './LadderCanvas';
import { DragOverlay } from './DragOverlay';
import { SimulationControls } from './SimulationControls';
import { TopActionBar } from './TopActionBar';
import { useLadderStore } from '../store/useLadderStore';
import { ActiveTool, EditorInteractionMode, ElementType, LadderElement, WorkspaceMode } from '../types';
import { THEME_TOKENS } from '../consts/themeTokens';

const fullViewportHeight = '100dvh' as unknown as number;
const safeAreaTop = 'env(safe-area-inset-top)' as unknown as number;
const safeAreaBottom = 'env(safe-area-inset-bottom)' as unknown as number;

export const MobileLadderWorkspace = React.memo(() => {
  const canvasRef = React.useRef<LadderCanvasHandle>(null);
  const isSimulating = useLadderStore(state => state.isSimulating);
  const selectedTool = useLadderStore(state => state.selectedTool);
  const elements = useLadderStore(state => state.elements);
  const variables = useLadderStore(state => state.variables);
  const dragState = useLadderStore(state => state.dragState);
  const setSelectedTool = useLadderStore(state => state.setSelectedTool);
  const setEditingElementId = useLadderStore(state => state.setEditingElementId);
  const setElement = useLadderStore(state => state.setElement);
  const setSimulating = useLadderStore(state => state.setSimulating);
  const toggleElementValue = useLadderStore(state => state.toggleElementValue);
  const clearElement = useLadderStore(state => state.clearElement);
  const duplicateElement = useLadderStore(state => state.duplicateElement);
  const createBranchBetween = useLadderStore(state => state.createBranchBetween);
  const addRungAfter = useLadderStore(state => state.addRungAfter);
  const removeRung = useLadderStore(state => state.removeRung);
  const updateVariable = useLadderStore(state => state.updateVariable);
  const undo = useLadderStore(state => state.undo);
  const redo = useLadderStore(state => state.redo);
  const canUndo = useLadderStore(state => state.past.length > 0);
  const canRedo = useLadderStore(state => state.future.length > 0);

  const [componentMenuOpen, setComponentMenuOpen] = useState(false);
  const [variableDrawerOpen, setVariableDrawerOpen] = useState(false);
  const [mode, setMode] = useState<WorkspaceMode>('edit');
  const [interactionMode, setInteractionMode] = useState<EditorInteractionMode>('idle');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedRungId, setSelectedRungId] = useState<string | null>(null);
  const [branchStartColumn, setBranchStartColumn] = useState<number | null>(null);

  const variableList = useMemo(() => {
    return Object.values(variables).sort((a, b) => a.id.localeCompare(b.id));
  }, [variables]);

  const activeTool = selectedTool;

  const normalizeElementTool = useCallback((tool: ActiveTool): ElementType | null => {
    if (!tool || tool === 'RUNG' || tool === 'PARALLEL_BRANCH') return null;
    return tool === 'BOX' ? 'BLOCK' : tool;
  }, []);

  const getDefaultAddress = useCallback((tool: ElementType) => {
    if (tool === 'TON') return 'Timer';
    if (tool === 'CTU') return 'Counter';
    if (tool === 'GEQ') return 'Value >= 0';
    if (tool === 'LEQ') return 'Value <= 0';
    return '';
  }, []);

  const getRungElements = useCallback((rungId: string) => {
    const rung = Object.values(elements).filter(element => element.rungId === rungId);
    return rung.sort((a, b) => (a.branchIndex - b.branchIndex) || (a.column - b.column));
  }, [elements]);

  const getInsertionTarget = useCallback((element: LadderElement) => {
    if (element.type === 'EMPTY') return element;
    return getRungElements(element.rungId).find(candidate => (
      candidate.type === 'EMPTY' &&
      candidate.branchIndex === element.branchIndex &&
      candidate.column > element.column
    )) || null;
  }, [getRungElements]);

  const getBranchEndColumn = useCallback((element: LadderElement) => {
    const candidates = getRungElements(element.rungId)
      .filter(candidate => candidate.branchIndex === 0 && candidate.type !== 'EMPTY' && candidate.column > element.column)
      .sort((a, b) => a.column - b.column);
    return candidates[0]?.column ?? Math.min(element.column + 2, 11);
  }, [getRungElements]);

  const insertToolOnElement = useCallback((element: LadderElement, tool: Exclude<ActiveTool, null>) => {
    if (tool === 'RUNG') {
      addRungAfter(element.rungId);
      setSelectedTool(null);
      return;
    }

    if (tool === 'PARALLEL_BRANCH') {
      createBranchBetween(element.rungId, element.column, getBranchEndColumn(element));
      setSelectedTool(null);
      return;
    }

    const elementTool = normalizeElementTool(tool);
    const target = elementTool ? getInsertionTarget(element) : null;
    if (!elementTool || !target) return;

    setElement(target.rungId, target.id, elementTool, getDefaultAddress(elementTool));
    setSelectedElementId(target.id);
    setSelectedRungId(target.rungId);
    setSelectedTool(null);
  }, [addRungAfter, createBranchBetween, getBranchEndColumn, getDefaultAddress, getInsertionTarget, normalizeElementTool, setElement, setSelectedTool]);

  const insertToolOnRung = useCallback((rungId: string, tool: Exclude<ActiveTool, null>) => {
    if (tool === 'RUNG') {
      addRungAfter(rungId);
      setSelectedTool(null);
      return;
    }

    const rungElements = getRungElements(rungId);
    const firstEmpty = rungElements.find(element => element.branchIndex === 0 && element.type === 'EMPTY');
    const firstElement = rungElements.find(element => element.branchIndex === 0 && element.type !== 'EMPTY');

    if (tool === 'PARALLEL_BRANCH') {
      const start = firstElement?.column ?? 0;
      const end = firstElement ? getBranchEndColumn(firstElement) : 2;
      createBranchBetween(rungId, start, end);
      setSelectedTool(null);
      return;
    }

    const elementTool = normalizeElementTool(tool);
    if (!elementTool || !firstEmpty) return;

    setElement(firstEmpty.rungId, firstEmpty.id, elementTool, getDefaultAddress(elementTool));
    setSelectedElementId(firstEmpty.id);
    setSelectedRungId(firstEmpty.rungId);
    setSelectedTool(null);
  }, [addRungAfter, createBranchBetween, getBranchEndColumn, getDefaultAddress, getRungElements, normalizeElementTool, setElement, setSelectedTool]);

  const handleSelectComponent = useCallback((type: Exclude<ActiveTool, null>) => {
    setSelectedTool(type);
    setComponentMenuOpen(false);
    setInteractionMode(type === 'PARALLEL_BRANCH' ? 'choosing-branch-start' : 'choosing-component');
  }, [setSelectedTool]);

  const handleCloseComponentMenu = useCallback(() => {
    setComponentMenuOpen(false);
    if (interactionMode === 'choosing-component') {
      setInteractionMode(selectedRungId ? 'selecting-rung' : 'idle');
    }
  }, [interactionMode, selectedRungId]);

  const handleModeChange = useCallback((nextMode: WorkspaceMode) => {
    setMode(nextMode);
    if (nextMode === 'edit') {
      setSimulating(false);
    }
  }, [setSimulating]);

  const handleToggleSimulation = useCallback(() => {
    const nextSimulating = !isSimulating;
    setMode('simulate');
    setSimulating(nextSimulating);
  }, [isSimulating, setSimulating]);

  const handleOpenComponentMenu = useCallback(() => {
    if (mode !== 'edit') return;
    setInteractionMode('choosing-component');
    setComponentMenuOpen(true);
  }, [mode]);

  const handleRungPress = useCallback((rungId: string) => {
    if (mode !== 'edit') return;
    setSelectedRungId(rungId);
    setSelectedElementId(null);
    setBranchStartColumn(null);
    if (activeTool) {
      insertToolOnRung(rungId, activeTool);
      return;
    }
    setInteractionMode('selecting-rung');
  }, [activeTool, insertToolOnRung, mode]);

  const handleElementPress = useCallback((elementId: string) => {
    const element = elements[elementId];
    if (!element) return;

    if (mode === 'simulate') {
      const variable = variables[element.address];
      if ((element.type === 'XIC' || element.type === 'XIO') && variable?.type === 'BOOL') {
        toggleElementValue(element.id);
      }
      return;
    }

    setSelectedRungId(element.rungId);
    if (activeTool) {
      insertToolOnElement(element, activeTool);
      return;
    }

    if (element.type === 'EMPTY') {
      setSelectedElementId(null);
      if (interactionMode === 'choosing-component') {
        setEditingElementId(element.id);
      }
      return;
    }

    setSelectedElementId(element.id);
    setInteractionMode('idle');
  }, [activeTool, elements, insertToolOnElement, interactionMode, mode, setEditingElementId, toggleElementValue, variables]);

  const handleAddParallel = useCallback(() => {
    if (!selectedRungId) return;
    setSelectedElementId(null);
    setBranchStartColumn(null);
    setInteractionMode('choosing-branch-start');
  }, [selectedRungId]);

  const handleBranchPointPress = useCallback((column: number) => {
    if (!selectedRungId) return;

    if (interactionMode === 'choosing-branch-start') {
      setBranchStartColumn(column);
      setInteractionMode('choosing-branch-end');
      return;
    }

    if (interactionMode === 'choosing-branch-end' && branchStartColumn !== null && column !== branchStartColumn) {
      createBranchBetween(selectedRungId, branchStartColumn, column);
      setInteractionMode('selecting-rung');
      setBranchStartColumn(null);
    }
  }, [branchStartColumn, createBranchBetween, interactionMode, selectedRungId]);

  const handleEditSelected = useCallback(() => {
    if (!selectedElementId) return;
    setEditingElementId(selectedElementId);
  }, [selectedElementId, setEditingElementId]);

  const handleDuplicateSelected = useCallback(() => {
    if (!selectedElementId) return;
    duplicateElement(selectedElementId);
  }, [duplicateElement, selectedElementId]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedElementId) return;
    clearElement(selectedElementId);
    setSelectedElementId(null);
  }, [clearElement, selectedElementId]);

  const handleConfigureRung = useCallback(() => {
    setVariableDrawerOpen(true);
  }, []);

  const handleDeleteRung = useCallback(() => {
    if (!selectedRungId) return;
    removeRung(selectedRungId);
    setSelectedRungId(null);
  }, [selectedRungId, removeRung]);

  const activeToolLabel = activeTool === 'PARALLEL_BRANCH' ? 'Branch' : activeTool;

  const isHoveringTrash = dragState.hoveredDropZoneId === 'TRASH';
  const showTrashZone = dragState.isDragging && dragState.draggedElementId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ElementEditorModal />

      <View style={styles.screen}>
        <TopActionBar
          onOpenVariables={() => setVariableDrawerOpen(true)}
          onCenterView={() => canvasRef.current?.fitToScreen()}
          onResetZoom={() => canvasRef.current?.resetZoom()}
          isSimulating={isSimulating}
          onToggleSimulation={handleToggleSimulation}
          mode={mode}
          onModeChange={handleModeChange}
        />

        <View style={styles.canvasShell}>
          <LadderCanvas
            ref={canvasRef}
            mode={mode}
            selectedElementId={selectedElementId}
            selectedRungId={selectedRungId}
            interactionMode={interactionMode}
            branchStartColumn={branchStartColumn}
            activeTool={activeTool}
            onElementPress={handleElementPress}
            onRungPress={handleRungPress}
            onBranchPointPress={handleBranchPointPress}
          />
        </View>

      {!showTrashZone && (
        <>
          <TouchableOpacity
            style={[styles.componentFab, mode !== 'edit' && styles.componentFabDisabled]}
            activeOpacity={0.78}
            onPress={handleOpenComponentMenu}
          >
            <Plus size={22} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.componentFabText}>
              {mode !== 'edit' ? 'Simulando' : activeToolLabel ? `Usar ${activeToolLabel}` : 'Componentes'}
            </Text>
          </TouchableOpacity>

          <SimulationControls
            isSimulating={isSimulating}
            mode={mode}
            onToggle={handleToggleSimulation}
          />

          {!isSimulating && mode === 'edit' && (
            <View style={styles.historyControls}>
              <TouchableOpacity style={[styles.historyBtn, !canUndo && styles.historyBtnDisabled]} onPress={undo} disabled={!canUndo} activeOpacity={0.7}>
                <Undo2 size={20} color={canUndo ? '#111827' : '#9CA3AF'} strokeWidth={2.4} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.historyBtn, !canRedo && styles.historyBtnDisabled]} onPress={redo} disabled={!canRedo} activeOpacity={0.7}>
                <Redo2 size={20} color={canRedo ? '#111827' : '#9CA3AF'} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

        {mode === 'edit' && !activeTool && selectedRungId && !selectedElementId && (
          <View style={styles.rungMenu} pointerEvents="box-none">
            <TouchableOpacity style={styles.rungAction} activeOpacity={0.76} onPress={handleOpenComponentMenu}>
              <Plus size={17} color="#111827" strokeWidth={2.2} />
              <Text style={styles.rungActionText}>Inserir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rungAction, interactionMode.startsWith('choosing-branch') && styles.rungActionActive]} activeOpacity={0.76} onPress={handleAddParallel}>
              <GitBranch size={17} color={interactionMode.startsWith('choosing-branch') ? '#247A3D' : '#111827'} strokeWidth={2.2} />
              <Text style={[styles.rungActionText, interactionMode.startsWith('choosing-branch') && styles.rungActionTextActive]}>
                {interactionMode === 'choosing-branch-end' ? 'Fim do paralelo' : 'Paralelo'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rungAction} activeOpacity={0.76} onPress={handleConfigureRung}>
              <Settings2 size={17} color="#111827" strokeWidth={2.2} />
              <Text style={styles.rungActionText}>Configurar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rungAction, styles.contextButtonDanger]} activeOpacity={0.76} onPress={handleDeleteRung}>
              <Trash2 size={17} color="#B42318" strokeWidth={2.2} />
              <Text style={[styles.rungActionText, styles.contextTextDanger]}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'edit' && !activeTool && selectedElementId && (
          <View style={styles.contextMenu} pointerEvents="box-none">
            <TouchableOpacity style={styles.contextButton} activeOpacity={0.76} onPress={handleEditSelected}>
              <PenLine size={17} color="#111827" strokeWidth={2.2} />
              <Text style={styles.contextText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contextButton} activeOpacity={0.76} onPress={handleEditSelected}>
              <Settings2 size={17} color="#111827" strokeWidth={2.2} />
              <Text style={styles.contextText}>Configurar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contextButton} activeOpacity={0.76} onPress={handleDuplicateSelected}>
              <Copy size={17} color="#111827" strokeWidth={2.2} />
              <Text style={styles.contextText}>Duplicar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contextButton, styles.contextButtonDanger]} activeOpacity={0.76} onPress={handleDeleteSelected}>
              <Trash2 size={17} color="#B42318" strokeWidth={2.2} />
              <Text style={[styles.contextText, styles.contextTextDanger]}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}

        {showTrashZone && (
          <View style={[styles.trashZone, isHoveringTrash && styles.trashZoneActive]}>
            <Trash2 size={24} color={isHoveringTrash ? '#FFFFFF' : '#EF4444'} strokeWidth={2} />
            <Text style={[styles.trashText, isHoveringTrash && styles.trashTextActive]}>Solte para Excluir</Text>
          </View>
        )}
      </View>

      <DragOverlay />

      <ComponentMenu
        selectedTool={selectedTool}
        visible={componentMenuOpen}
        onClose={handleCloseComponentMenu}
        onSelect={handleSelectComponent}
      />

      <Modal transparent visible={variableDrawerOpen} animationType="fade" onRequestClose={() => setVariableDrawerOpen(false)}>
        <Pressable style={styles.drawerBackdrop} onPress={() => setVariableDrawerOpen(false)} />
        <View style={styles.variableDrawer}>
          <Text style={styles.drawerTitle}>Variáveis</Text>
          <Text style={styles.drawerSubtitle}>Toque em BOOL para alternar durante testes</Text>
          <ScrollView style={styles.variableList} contentContainerStyle={styles.variableListContent}>
            {variableList.map(variable => {
              const value = variable.value;
              const active = value === true || value?.dn === true;
              return (
                <TouchableOpacity
                  key={variable.id}
                  style={styles.variableRow}
                  activeOpacity={0.72}
                  onPress={() => variable.type === 'BOOL' && updateVariable(variable.id, { value: !variable.value })}
                >
                  <View style={[styles.variableDot, active && styles.variableDotActive]} />
                  <View style={styles.variableInfo}>
                    <Text style={styles.variableName} numberOfLines={1}>{variable.id}</Text>
                    <Text style={styles.variableType}>{variable.type}</Text>
                  </View>
                  <Text style={styles.variableValue} numberOfLines={1}>
                    {typeof value === 'object' ? String(value.acc ?? value.dn) : String(value)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    height: Platform.OS === 'web' ? fullViewportHeight : undefined,
    minHeight: Platform.OS === 'web' ? fullViewportHeight : undefined,
    paddingTop: Platform.OS === 'web' ? safeAreaTop : undefined,
    paddingBottom: Platform.OS === 'web' ? safeAreaBottom : undefined,
    backgroundColor: THEME_TOKENS.color.appBackground,
  },
  screen: {
    flex: 1,
    backgroundColor: THEME_TOKENS.color.appBackground,
    overflow: 'hidden',
  },
  canvasShell: {
    flex: 1,
    marginHorizontal: 0,
    marginBottom: 0,
    backgroundColor: THEME_TOKENS.color.canvas,
  },
  componentFab: {
    position: 'absolute',
    left: 16,
    bottom: 22,
    minWidth: 166,
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 24,
    backgroundColor: THEME_TOKENS.color.text,
    ...THEME_TOKENS.shadow.floating,
  },
  componentFabDisabled: {
    backgroundColor: '#4B5563',
    shadowOpacity: 0.1,
  },
  componentFabText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  contextMenu: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 96,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    ...THEME_TOKENS.shadow.floating,
  },
  rungMenu: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 96,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    ...THEME_TOKENS.shadow.floating,
  },
  rungAction: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: 16,
    backgroundColor: THEME_TOKENS.color.surfaceMuted,
  },
  rungActionActive: {
    backgroundColor: '#E7F7EC',
  },
  rungActionText: {
    color: '#111827',
    fontSize: 11,
    fontWeight: '900',
  },
  rungActionTextActive: {
    color: '#247A3D',
  },
  contextButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: 16,
    backgroundColor: THEME_TOKENS.color.surfaceMuted,
  },
  contextButtonDanger: {
    backgroundColor: '#FFF1F0',
  },
  contextText: {
    color: '#111827',
    fontSize: 10,
    fontWeight: '900',
  },
  contextTextDanger: {
    color: '#B42318',
  },
  trashZone: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 22,
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#EF4444',
    borderStyle: 'dashed',
    zIndex: 50,
  },
  trashZoneActive: {
    backgroundColor: '#EF4444',
    borderStyle: 'solid',
  },
  trashText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '900',
  },
  trashTextActive: {
    color: '#FFFFFF',
  },
  historyControls: {
    position: 'absolute',
    right: 16,
    bottom: 22,
    flexDirection: 'row',
    gap: 8,
  },
  historyBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME_TOKENS.shadow.floating,
  },
  historyBtnDisabled: {
    backgroundColor: '#F3F4F6',
    shadowOpacity: 0.05,
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.22)',
  },
  variableDrawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '86%',
    maxWidth: 390,
    paddingTop: 28,
    paddingHorizontal: 18,
    paddingBottom: 24,
    backgroundColor: THEME_TOKENS.color.surface,
    shadowColor: '#111827',
    shadowOffset: { width: -12, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 12,
  },
  drawerTitle: {
    color: '#111827',
    fontSize: 23,
    fontWeight: '900',
  },
  drawerSubtitle: {
    marginTop: 4,
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
  },
  variableList: {
    flex: 1,
    marginTop: 18,
  },
  variableListContent: {
    paddingBottom: 28,
    gap: 8,
  },
  variableRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: THEME_TOKENS.color.surfaceMuted,
  },
  variableDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#D1D5DB',
  },
  variableDotActive: {
    backgroundColor: '#2EAD5B',
  },
  variableInfo: {
    flex: 1,
  },
  variableName: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  variableType: {
    marginTop: 2,
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '800',
  },
  variableValue: {
    maxWidth: 92,
    color: '#374151',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
    textAlign: 'right',
  },
});
