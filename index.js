// Object destructuring from javascript, takes the electron 
// module export and extracts the app BrowserWindow properties
// from it
import { app, BrowserWindow, ipcMain } from 'electron';

// Store filesystem module in var
import fs from 'node:fs/promises';
import path from 'path';

import {fileURLToPath } from 'node:url';

import { convertArrayToCSV } from 'convert-array-to-csv';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = () => path.join(app.getPath('userData'),'dataFolder', 'data.csv');

const header=['abs-error'];

// create csv file if it doesnt exist
async function ensureCsvFile(filepath){
    //create filepath, async method so can await OS operation to complete
    await fs.mkdir(path.dirname(filepath), { recursive: true}); // create directory, wont if already exists

    try{
        await fs.writeFile(filepath, 'abs-error,percentage-error,overshot-undershot,trueval,guessval\n', 
                            {flag: 'wx', encoding: 'utf8'});
    }catch(error){
        if(error.code !== 'EEXIST'){
            throw error;
        }
    }
}


ipcMain.handle('read-file', async () => {
    const filepath = filePath();

    await ensureCsvFile(filepath);
    // should read the csv file as a string
    const readcsv = await fs.readFile(filepath, 'utf8');
    
    // trim the white space and /../ syntax denotes a regular expression to be passed as a 
    // parameter to split the string into rows, and filtering out empty rows
    const rows = readcsv.trim().split(/\r?\n/).filter(row => row.trim() !== '');
    const values = rows.slice(1).map(row => row.split(',').map(Number)); // remove header and split each row
    // and apply a function to each column to convert the string values into numbers.
    return values;
});

ipcMain.handle('write-file', async (event, values) => {
    console.log("Write file main handler started");
    const filepath = filePath();

    await ensureCsvFile(filepath);
    
    const csv = convertArrayToCSV(values, {separator: ','}); 

    await fs.appendFile(filepath, csv, 'utf8');

    console.log("Written to file at: " + filePath());

    return true;
});


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
            contextIsolation: true,

            preload: path.join(__dirname, 'preload.js')
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
