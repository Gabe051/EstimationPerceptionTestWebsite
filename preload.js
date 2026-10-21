const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron',{
    readFile: () => ipcRenderer.invoke('read-file'),
    appendValue: (values) => ipcRenderer.invoke('write-file', values),
});