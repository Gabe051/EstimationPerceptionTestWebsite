
import { app, BrowserWindow } from 'electron';

// Doesnt handle MacOS window docking processes.

function createWindow() {
    const window = new BrowserWindow({
        autoHideMenuBar : true,
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    window.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    app.quit();
});
