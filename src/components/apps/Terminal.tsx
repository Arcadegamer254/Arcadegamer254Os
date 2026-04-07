import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Terminal as TerminalIcon, Plus, X } from 'lucide-react';

export function Terminal() {
  const [history, setHistory] = useState<{ type: 'input' | 'output', text: string }[]>([
    { type: 'output', text: 'Welcome to Penguin (Linux container)' },
    { type: 'output', text: 'Type "help" for a list of available commands.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleCommand = async () => {
    if (!input.trim()) return;

    const cmd = input.trim();
    setInput('');
    setHistory(prev => [...prev, { type: 'input', text: `arcadegamer254@penguin:~$ ${cmd}` }]);

    if (cmd === 'clear') {
      setHistory([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/system/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
      const data = await res.json();
      setHistory(prev => [...prev, { type: 'output', text: data.output || '' }]);
    } catch (err: any) {
      setHistory(prev => [...prev, { type: 'output', text: `Error: ${err.message}` }]);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Chrome OS Terminal Tab Bar */}
      <View style={styles.tabBar}>
        <View style={styles.tab}>
          <TerminalIcon color="#60a5fa" size={16} style={{ marginRight: 8 }} />
          <Text style={styles.tabText} numberOfLines={1}>penguin</Text>
          <TouchableOpacity style={styles.closeButton}>
            <X color="#9ca3af" size={12} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Plus color="#9ca3af" size={16} />
        </TouchableOpacity>
      </View>

      {/* Terminal Content */}
      <View style={styles.content}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.historyContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {history.map((line, i) => (
            <Text 
              key={i} 
              style={[
                styles.lineText, 
                line.type === 'input' ? styles.textInput : styles.textOutput
              ]}
            >
              {line.text}
            </Text>
          ))}
          {loading && <Text style={styles.textLoading}>Executing...</Text>}
        </ScrollView>
        <View style={styles.inputContainer}>
          <Text style={styles.promptText}>arcadegamer254@penguin:~$ </Text>
          <TextInput
            style={styles.textInputBox}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleCommand}
            autoFocus
            editable={!loading}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            blurOnSubmit={false}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#202124',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#292a2d',
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3c4043',
    height: 32,
    paddingHorizontal: 16,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minWidth: 150,
    maxWidth: 200,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tabText: {
    fontSize: 14,
    color: '#e5e7eb',
    flex: 1,
  },
  closeButton: {
    padding: 4,
    borderRadius: 12,
  },
  addButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    borderRadius: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  historyContainer: {
    flex: 1,
  },
  lineText: {
    fontFamily: 'monospace',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 2,
  },
  textInput: {
    color: '#f3f4f6',
  },
  textOutput: {
    color: '#d1d5db',
  },
  textLoading: {
    fontFamily: 'monospace',
    fontSize: 15,
    color: '#6b7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  promptText: {
    fontFamily: 'monospace',
    fontSize: 15,
    color: '#4ade80',
    fontWeight: 'bold',
  },
  textInputBox: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 15,
    color: '#f3f4f6',
    padding: 0,
    margin: 0,
    outlineWidth: 0,
  },
});
