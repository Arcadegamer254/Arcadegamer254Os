import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Modal, Alert, Platform } from 'react-native';
import { WebView } from '../WebView';
import { Folder, File, ChevronRight, ChevronLeft, Home, HardDrive, FileText, Image as ImageIcon, Music, Video, Archive, Code, Search, RefreshCw, AlertCircle, Plus, Trash2, Edit2, Save, Download, Clock, Terminal } from 'lucide-react';
import { format } from 'date-fns';
import { vfs, FileInfo } from '../../services/vfs';

export function FileExplorer() {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [contextMenu, setContextMenu] = useState<{ file: FileInfo | null } | null>(null);
  const [showNewDialog, setShowNewDialog] = useState<'file' | 'folder' | null>(null);
  const [showRenameDialog, setShowRenameDialog] = useState<FileInfo | null>(null);
  const [dialogInput, setDialogInput] = useState('');

  useEffect(() => {
    loadFiles(''); // Load home directory initially
  }, []);

  const loadFiles = async (path: string, addToHistory = true) => {
    setLoading(true);
    setError(null);
    setFileContent(null);
    setSelectedFile(null);
    setIsEditing(false);
    try {
      const data = await vfs.list(path);
      setFiles(data.files);
      setCurrentPath(data.path);
      
      if (addToHistory) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(data.path);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      loadFiles(history[newIndex], false);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      loadFiles(history[newIndex], false);
    }
  };

  const goUp = () => {
    if (currentPath === '/') return;
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    loadFiles(parentPath);
  };

  const isMediaFile = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'mp4', 'webm', 'mp3', 'wav', 'ogg', 'pdf'].includes(ext || '');
  };

  const handleItemClick = async (item: FileInfo) => {
    if (item.isDirectory) {
      loadFiles(item.path);
    } else {
      setSelectedFile(item);
      setIsEditing(false);
      
      if (isMediaFile(item.name)) {
        setFileContent('media');
        return;
      }
      
      setLoading(true);
      try {
        const content = await vfs.read(item.path);
        setFileContent(content);
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  const handleLongPress = (file: FileInfo | null) => {
    setContextMenu({ file });
  };

  const handleAction = async (action: string, path: string, newPath?: string, isDir?: boolean, content?: string) => {
    try {
      await vfs.action(action, path, newPath, isDir, content);
      if (action !== 'write') loadFiles(currentPath, false);
    } catch (err: any) {
      if (Platform.OS === 'web') {
        window.alert(err.message);
      } else {
        Alert.alert('Error', err.message);
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg': return <ImageIcon color="#60a5fa" size={20} />;
      case 'mp3': case 'wav': case 'ogg': return <Music color="#c084fc" size={20} />;
      case 'mp4': case 'webm': case 'mkv': return <Video color="#f87171" size={20} />;
      case 'zip': case 'tar': case 'gz': case 'rar': return <Archive color="#facc15" size={20} />;
      case 'js': case 'ts': case 'jsx': case 'tsx': case 'json': case 'html': case 'css': return <Code color="#4ade80" size={20} />;
      case 'txt': case 'md': case 'csv': return <FileText color="#9ca3af" size={20} />;
      default: return <File color="#9ca3af" size={20} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Content Area */}
      <View style={styles.mainArea}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <ScrollView>
            <Text style={styles.sidebarSectionTitle}>Quick Access</Text>
            <TouchableOpacity style={styles.sidebarItem} onPress={() => loadFiles('~/Recent')}>
              <Clock color="#d1d5db" size={16} />
              <Text style={styles.sidebarItemText}>Recent</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sidebarItem} onPress={() => loadFiles('~/Audio')}>
              <Music color="#d1d5db" size={16} />
              <Text style={styles.sidebarItemText}>Audio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sidebarItem} onPress={() => loadFiles('~/Images')}>
              <ImageIcon color="#d1d5db" size={16} />
              <Text style={styles.sidebarItemText}>Images</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sidebarItem} onPress={() => loadFiles('~/Videos')}>
              <Video color="#d1d5db" size={16} />
              <Text style={styles.sidebarItemText}>Videos</Text>
            </TouchableOpacity>
            
            <Text style={[styles.sidebarSectionTitle, { marginTop: 16 }]}>Files</Text>
            <TouchableOpacity style={styles.sidebarItem} onPress={() => loadFiles('~')}>
              <Folder color="#d1d5db" size={16} />
              <Text style={styles.sidebarItemText}>My files</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sidebarItem, { paddingLeft: 32 }]} onPress={() => loadFiles('~/Downloads')}>
              <Download color="#d1d5db" size={16} />
              <Text style={styles.sidebarItemText}>Downloads</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sidebarItem, { paddingLeft: 32 }]} onPress={() => loadFiles('/')}>
              <Terminal color="#d1d5db" size={16} />
              <Text style={styles.sidebarItemText}>Linux files</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Right Content */}
        <View style={styles.rightContent}>
          {/* Toolbar */}
          <View style={styles.toolbar}>
            <View style={styles.navButtons}>
              <TouchableOpacity onPress={goBack} disabled={historyIndex <= 0} style={[styles.iconButton, historyIndex <= 0 && styles.disabled]}>
                <ChevronLeft color="#d1d5db" size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={goForward} disabled={historyIndex >= history.length - 1} style={[styles.iconButton, historyIndex >= history.length - 1 && styles.disabled]}>
                <ChevronRight color="#d1d5db" size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={goUp} disabled={currentPath === '/'} style={[styles.iconButton, currentPath === '/' && styles.disabled]}>
                <ChevronLeft color="#d1d5db" size={20} style={{ transform: 'rotate(90deg)' }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => loadFiles('')} style={styles.iconButton}>
                <Home color="#d1d5db" size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => loadFiles(currentPath, false)} style={styles.iconButton}>
                <RefreshCw color="#d1d5db" size={20} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.pathContainer}>
              <HardDrive color="#9ca3af" size={16} />
              <TextInput 
                style={styles.pathInput}
                value={currentPath}
                onChangeText={setCurrentPath}
                onSubmitEditing={() => loadFiles(currentPath)}
              />
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={() => { setDialogInput(''); setShowNewDialog('file'); }} style={styles.iconButton}>
                <File color="#d1d5db" size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setDialogInput(''); setShowNewDialog('folder'); }} style={styles.iconButton}>
                <Folder color="#d1d5db" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          {/* File List or File Viewer */}
          <View style={styles.fileArea}>
            {error ? (
              <View style={styles.centerContainer}>
                <AlertCircle color="#f87171" size={48} style={{ marginBottom: 8 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : fileContent !== null ? (
              <View style={styles.viewerContainer}>
                <View style={styles.viewerHeader}>
                  <View style={styles.viewerTitleContainer}>
                    {getFileIcon(selectedFile?.name || '')}
                    <Text style={styles.viewerTitle}>{selectedFile?.name}</Text>
                  </View>
                  <View style={styles.viewerActions}>
                    {fileContent !== 'media' && (
                      <TouchableOpacity 
                        onPress={() => {
                          if (isEditing && selectedFile) handleAction('write', selectedFile.path, undefined, false, fileContent);
                          setIsEditing(!isEditing);
                        }} 
                        style={[styles.button, isEditing ? styles.buttonSuccess : styles.buttonSecondary]}
                      >
                        {isEditing ? <Save color="#fff" size={16} /> : <Edit2 color="#fff" size={16} />}
                        <Text style={styles.buttonText}>{isEditing ? 'Save' : 'Edit'}</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => setFileContent(null)} style={styles.buttonSecondary}>
                      <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {fileContent === 'media' ? (
                  <View style={styles.mediaContainer}>
                    {selectedFile?.name.match(/\.(pdf)$/i) ? (
                      <WebView source={{ uri: `/api/system/files/serve?path=${encodeURIComponent(selectedFile?.path)}` }} style={{ flex: 1, backgroundColor: 'white' }} />
                    ) : (
                      <WebView source={{ uri: `/api/system/files/serve?path=${encodeURIComponent(selectedFile?.path)}` }} style={{ flex: 1, backgroundColor: 'transparent' }} />
                    )}
                  </View>
                ) : isEditing ? (
                  <TextInput 
                    style={styles.editorInput}
                    value={fileContent} 
                    onChangeText={setFileContent}
                    multiline
                    textAlignVertical="top"
                  />
                ) : (
                  <ScrollView style={styles.codeViewer}>
                    <Text style={styles.codeText}>{fileContent}</Text>
                  </ScrollView>
                )}
              </View>
            ) : (
              <ScrollView style={styles.fileList}>
                <View style={styles.listHeader}>
                  <Text style={[styles.listHeaderText, { flex: 1 }]}>Name</Text>
                  <Text style={[styles.listHeaderText, { width: 100 }]}>Size</Text>
                  <Text style={[styles.listHeaderText, { width: 150 }]}>Modified</Text>
                </View>
                
                {loading ? (
                  <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
                ) : files.length === 0 ? (
                  <Text style={styles.emptyText}>This folder is empty</Text>
                ) : (
                  files.map((file, i) => (
                    <TouchableOpacity 
                      key={i} 
                      style={styles.fileItem}
                      onPress={() => handleItemClick(file)}
                      onLongPress={() => handleLongPress(file)}
                    >
                      <View style={styles.fileNameContainer}>
                        {file.isDirectory ? <Folder color="#60a5fa" size={20} /> : getFileIcon(file.name)}
                        <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                      </View>
                      <Text style={styles.fileSize}>{file.isDirectory ? '--' : formatSize(file.size)}</Text>
                      <Text style={styles.fileDate}>{format(new Date(file.modified), 'MMM d, yyyy HH:mm')}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
      
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>{files.length} items</Text>
        <Text style={styles.statusText}>{selectedFile ? formatSize(selectedFile.size) : ''}</Text>
      </View>

      {/* Context Menu Modal */}
      <Modal visible={contextMenu !== null} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setContextMenu(null)}>
          <View style={styles.contextMenu}>
            {contextMenu?.file ? (
              <>
                <TouchableOpacity style={styles.contextMenuItem} onPress={() => { handleItemClick(contextMenu.file!); setContextMenu(null); }}>
                  <Folder color="#d1d5db" size={16} />
                  <Text style={styles.contextMenuText}>Open</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contextMenuItem} onPress={() => { setDialogInput(contextMenu.file!.name); setShowRenameDialog(contextMenu.file); setContextMenu(null); }}>
                  <Edit2 color="#d1d5db" size={16} />
                  <Text style={styles.contextMenuText}>Rename</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contextMenuItem} onPress={() => {
                  if (Platform.OS === 'web') {
                    if (window.confirm(`Are you sure you want to delete ${contextMenu.file!.name}?`)) {
                      handleAction('delete', contextMenu.file!.path);
                    }
                  } else {
                    Alert.alert('Delete', `Are you sure you want to delete ${contextMenu.file!.name}?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => handleAction('delete', contextMenu.file!.path) }
                    ]);
                  }
                  setContextMenu(null);
                }}>
                  <Trash2 color="#f87171" size={16} />
                  <Text style={[styles.contextMenuText, { color: '#f87171' }]}>Delete</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.contextMenuItem} onPress={() => { setDialogInput(''); setShowNewDialog('folder'); setContextMenu(null); }}>
                  <Folder color="#d1d5db" size={16} />
                  <Text style={styles.contextMenuText}>New Folder</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contextMenuItem} onPress={() => { setDialogInput(''); setShowNewDialog('file'); setContextMenu(null); }}>
                  <File color="#d1d5db" size={16} />
                  <Text style={styles.contextMenuText}>New File</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Dialogs */}
      <Modal visible={showNewDialog !== null || showRenameDialog !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>
              {showNewDialog === 'folder' ? 'New Folder' : showNewDialog === 'file' ? 'New File' : 'Rename'}
            </Text>
            <TextInput 
              style={styles.dialogInput}
              autoFocus
              value={dialogInput}
              onChangeText={setDialogInput}
              placeholder="Name..."
              placeholderTextColor="#9ca3af"
            />
            <View style={styles.dialogActions}>
              <TouchableOpacity onPress={() => { setShowNewDialog(null); setShowRenameDialog(null); }} style={styles.buttonSecondary}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                if (showNewDialog) {
                  handleAction('create', `${currentPath}/${dialogInput}`, undefined, showNewDialog === 'folder');
                  setShowNewDialog(null);
                } else if (showRenameDialog) {
                  const newPath = showRenameDialog.path.replace(showRenameDialog.name, dialogInput);
                  handleAction('rename', showRenameDialog.path, newPath);
                  setShowRenameDialog(null);
                }
              }} style={styles.buttonPrimary}>
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827', // gray-900
  },
  mainArea: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 192,
    backgroundColor: 'rgba(31, 41, 55, 0.5)', // gray-800/50
    borderRightWidth: 1,
    borderRightColor: '#374151', // gray-700
    paddingVertical: 8,
  },
  sidebarSectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  sidebarItemText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  rightContent: {
    flex: 1,
    flexDirection: 'column',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#1f2937', // gray-800
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    gap: 8,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    padding: 6,
    borderRadius: 4,
  },
  disabled: {
    opacity: 0.5,
  },
  pathContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#030712', // gray-950
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#374151',
  },
  pathInput: {
    flex: 1,
    color: '#e5e7eb',
    fontSize: 14,
    marginLeft: 8,
    outlineWidth: 0,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  fileArea: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#f87171',
    fontSize: 16,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 40,
  },
  viewerContainer: {
    flex: 1,
  },
  viewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f3f4f6',
  },
  viewerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 4,
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonSecondary: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonSuccess: {
    backgroundColor: '#16a34a',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  mediaContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1f2937',
    overflow: 'hidden',
  },
  editorInput: {
    flex: 1,
    backgroundColor: '#030712',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 4,
    padding: 16,
    color: '#d1d5db',
    fontFamily: 'monospace',
    fontSize: 14,
    outlineWidth: 0,
  },
  codeViewer: {
    flex: 1,
    backgroundColor: '#030712',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 4,
    padding: 16,
  },
  codeText: {
    color: '#d1d5db',
    fontFamily: 'monospace',
    fontSize: 14,
  },
  fileList: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
    paddingBottom: 8,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  listHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
  },
  fileNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 16,
  },
  fileName: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  fileSize: {
    width: 100,
    color: '#6b7280',
    fontSize: 12,
  },
  fileDate: {
    width: 150,
    color: '#6b7280',
    fontSize: 12,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1f2937',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextMenu: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 4,
    paddingVertical: 4,
    minWidth: 160,
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  contextMenuText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  dialog: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    padding: 16,
    width: 320,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  dialogInput: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    marginBottom: 16,
    outlineWidth: 0,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
