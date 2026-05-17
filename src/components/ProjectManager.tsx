import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  FileCode,
  FileDown,
  FolderOpen,
  Plus,
  Trash2,
  X,
  Calendar,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLadderStore } from '../store/useLadderStore';
import { ProjectMetadata } from '../types';
import { THEME_TOKENS } from '../consts/themeTokens';

interface ProjectManagerProps {
  visible: boolean;
  onClose: () => void;
}

export const ProjectManager = React.memo(({ visible, onClose }: ProjectManagerProps) => {
  const projects = useLadderStore(state => state.projects);
  const currentProjectId = useLadderStore(state => state.currentProjectId);
  const listProjects = useLadderStore(state => state.listProjects);
  const saveToStorage = useLadderStore(state => state.saveToStorage);
  const loadFromStorage = useLadderStore(state => state.loadFromStorage);
  const deleteProject = useLadderStore(state => state.deleteProject);
  const resetWorkspace = useLadderStore(state => state.resetWorkspace);

  const [isNamingNew, setIsNamingNew] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    if (visible) {
      listProjects();
    }
  }, [visible, listProjects]);

  const handleCreateNew = useCallback(() => {
    setIsNamingNew(true);
    setNewProjectName(`Projeto ${projects.length + 1}`);
  }, [projects.length]);

  const confirmCreate = useCallback(async () => {
    resetWorkspace();
    await saveToStorage(newProjectName);
    setIsNamingNew(false);
    onClose();
  }, [newProjectName, resetWorkspace, saveToStorage, onClose]);

  const handleLoad = useCallback(async (id: string) => {
    await loadFromStorage(id);
    onClose();
  }, [loadFromStorage, onClose]);

  const handleExport = useCallback(async (project: ProjectMetadata) => {
    try {
      const data = await AsyncStorage.getItem(`@easyclp_project_${project.id}`);
      if (data) {
        if (Platform.OS === 'web') {
          console.log('Project Data:', data);
          alert('Dados do projeto copiados para o console (F12). Em breve suporte a download de arquivo!');
        } else {
          Alert.alert('Exportar Projeto', 'A funcionalidade de compartilhamento nativo será implementada na próxima versão. Por enquanto, os dados estão seguros no dispositivo.');
        }
      }
    } catch (e) {
      console.error('Export failed', e);
    }
  }, []);

  const handleDelete = useCallback((project: ProjectMetadata) => {
    const performDelete = () => deleteProject(project.id);

    if (Platform.OS !== 'web') {
      Alert.alert(
        'Excluir Projeto',
        `Tem certeza que deseja excluir "${project.name}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: performDelete },
        ]
      );
    } else if (confirm(`Excluir "${project.name}"?`)) {
      performDelete();
    }
  }, [deleteProject]);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderProjectItem = ({ item }: { item: ProjectMetadata }) => {
    const isActive = item.id === currentProjectId;
    return (
      <View style={[styles.projectCard, isActive && styles.projectCardActive]}>
        <TouchableOpacity 
          style={styles.projectMain} 
          onPress={() => handleLoad(item.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.projectIcon, isActive && styles.projectIconActive]}>
            <FileCode size={20} color={isActive ? '#FFFFFF' : '#6B7280'} />
          </View>
          <View style={styles.projectInfo}>
            <Text style={styles.projectName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.projectMeta}>
              <Calendar size={12} color="#9CA3AF" />
              <Text style={styles.projectDate}>{formatDate(item.lastModified)}</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleExport(item)}
          activeOpacity={0.6}
        >
          <FileDown size={18} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => handleDelete(item)}
          activeOpacity={0.6}
        >
          <Trash2 size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Meus Projetos</Text>
            <Text style={styles.subtitle}>{projects.length} arquivos salvos</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.72}>
            <X size={22} color="#111827" />
          </TouchableOpacity>
        </View>

        {isNamingNew ? (
          <View style={styles.namingSection}>
            <Text style={styles.namingLabel}>NOME DO NOVO PROJETO</Text>
            <TextInput
              style={styles.nameInput}
              value={newProjectName}
              onChangeText={setNewProjectName}
              placeholder="Digite o nome..."
              autoFocus
            />
            <View style={styles.namingActions}>
              <TouchableOpacity 
                style={[styles.namingBtn, styles.namingBtnCancel]} 
                onPress={() => setIsNamingNew(false)}
              >
                <Text style={styles.namingBtnTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.namingBtn, styles.namingBtnConfirm]} 
                onPress={confirmCreate}
              >
                <Text style={styles.namingBtnTextConfirm}>Criar Projeto</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <FlatList
              data={projects.sort((a, b) => b.lastModified - a.lastModified)}
              renderItem={renderProjectItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <FolderOpen size={48} color="#D1D5DB" strokeWidth={1.5} />
                  <Text style={styles.emptyTitle}>Nenhum projeto salvo</Text>
                  <Text style={styles.emptyCopy}>Seus diagramas aparecerão aqui depois que você salvá-los.</Text>
                </View>
              }
            />

            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.createBtn} 
                activeOpacity={0.8}
                onPress={handleCreateNew}
              >
                <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.createBtnText}>Novo Projeto</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '80%',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#F9FAFB',
    ...THEME_TOKENS.shadow.floating,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '600',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listContent: {
    paddingBottom: 100,
    gap: 12,
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...THEME_TOKENS.shadow.soft,
  },
  projectCardActive: {
    borderColor: THEME_TOKENS.color.energy,
    backgroundColor: '#F0FDF4',
  },
  projectMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  projectIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectIconActive: {
    backgroundColor: THEME_TOKENS.color.energy,
  },
  projectInfo: {
    flex: 1,
    gap: 2,
  },
  projectName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  projectDate: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#374151',
  },
  emptyCopy: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: 'rgba(249, 250, 251, 0.9)',
  },
  createBtn: {
    height: 56,
    backgroundColor: THEME_TOKENS.color.charcoal,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...THEME_TOKENS.shadow.floating,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  namingSection: {
    gap: 16,
    paddingVertical: 10,
  },
  namingLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6B7280',
    letterSpacing: 1,
  },
  nameInput: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  namingActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  namingBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  namingBtnCancel: {
    backgroundColor: '#F3F4F6',
  },
  namingBtnConfirm: {
    backgroundColor: THEME_TOKENS.color.energy,
  },
  namingBtnTextCancel: {
    color: '#4B5563',
    fontWeight: '800',
  },
  namingBtnTextConfirm: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
