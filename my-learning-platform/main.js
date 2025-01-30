const { app, BrowserWindow } = require('electron')
const url = require('url');
const path = require('path');

let mainWindow

function createWindow () {

    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 1000,
        webPreferences: {
            nodeIntegration: true
        }
    })

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `/dist/angular-electron/browser/index.html`),
            protocol: "file:",
            slashes: true
        })
    );

    // Uncomment below to open the DevTools
    // mainWindow.webContents.openDevTools()

    // Event when the window is closed
    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

// Create window on electron initialization
app.on('ready', createWindow)

// Quit when all windows are closed
app.on('window-all-closed', function () {
    // On macOS specific close process
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    // macOS specific close process
    if (mainWindow === null) createWindow()
})
