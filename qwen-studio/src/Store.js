import create from 'zustand';

const useStore = create(set => ({
  files: {
    'main.py': 'def hello(name):\n    print(f"Hello {name}")\n\nhello("World")',
    'utils.py': ''
  },
  activeFile: 'main.py',
  openFiles: ['main.py'],
  logs: '',
  terminalOutput: '',
  
  // File operations
  createFile: (name, content = '') => set(state => {
    if (state.files[name]) return state;
    
    return {
      files: { ...state.files, [name]: content },
      activeFile: name,
      openFiles: [...new Set([...state.openFiles, name])]
    };
  }),
  
  deleteFile: (name) => set(state => {
    if (Object.keys(state.files).length <= 1) return state;
    
    const newFiles = { ...state.files };
    delete newFiles[name];
    
    let newActiveFile = state.activeFile;
    if (state.activeFile === name) {
      newActiveFile = Object.keys(newFiles)[0];
    }
    
    return {
      files: newFiles,
      activeFile: newActiveFile,
      openFiles: state.openFiles.filter(f => f !== name)
    };
  }),
  
  updateFile: (name, content) => set(state => ({
    files: { ...state.files, [name]: content },
    logs: `${state.logs}\n💾 Saved ${name}`
  })),
  
  setActiveFile: (name) => set(state => ({
    activeFile: name,
    openFiles: [...new Set([...state.openFiles, name])]
  })),
  
  addLog: (message) => set(state => ({
    logs: `${state.logs}\n${message}`
  })),
  
  addTerminalOutput: (output) => set(state => ({
    terminalOutput: `${state.terminalOutput}\n$ ${output}`
  }))
}));

export default useStore;
