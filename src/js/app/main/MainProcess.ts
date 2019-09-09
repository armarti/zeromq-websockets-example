import { BrowserWindow, App } from 'electron';
import installExtension, {
    REACT_DEVELOPER_TOOLS,
    REDUX_DEVTOOLS,
} from 'electron-devtools-installer';

interface IBrowserWindowType { new (...args: any[]): BrowserWindow; }

export default class MainProcess {

    // where the entry index.html will be after webpack compilation
    static COMPILED_ENTRYPOINT: string = './renderer/index.html';
    static mainWindow: Electron.BrowserWindow;
    static application: Electron.App;
    static BrowserWindowClass: IBrowserWindowType;

    private static setupDevtoolExtensions() {
        console.debug('Starting install of third-party developer tools');
        [
            REACT_DEVELOPER_TOOLS,
            REDUX_DEVTOOLS,
        ].forEach((ext) => {
            installExtension(ext)
                .then((name) => console.debug(`Added Extension:  ${name}`))
                .catch((err) => console.error('An error occurred: ', err));

        });
        console.debug('Finished install of third-party developer tools');
    }

    private static onWindowAllClosed() {
        if (process.platform !== 'darwin') {
            MainProcess.application.quit();
        }
    }

    private static onClose() {
        // Dereference the window object.
        // @ts-ignore
        MainProcess.mainWindow = null;
    }

    private static onReady() {
        MainProcess.mainWindow = new MainProcess.BrowserWindowClass({
            width: 800,
            height: 600
        });
        // MainProcess.mainWindow.loadURL(`file://${__dirname}/index.html`)
        MainProcess.mainWindow.loadFile(MainProcess.COMPILED_ENTRYPOINT)
            .then(() => console.debug('loaded index.html'))
            .catch((err) => console.error(`Couldn't load ${MainProcess.COMPILED_ENTRYPOINT}`, err));
        MainProcess.mainWindow.on('closed', MainProcess.onClose);
        if(process.env.NODE_ENV !== 'production') {
            MainProcess.setupDevtoolExtensions();
        }
    }

    static initialize(app: App, browserWindowClass: IBrowserWindowType) {
        // we pass the Electron.App object and the Electron.BrowserWindow into this function
        // so this class has no dependencies. This makes the code easier to write tests for
        MainProcess.BrowserWindowClass = browserWindowClass;
        MainProcess.application = app;
        MainProcess.application.on('window-all-closed', MainProcess.onWindowAllClosed);
        MainProcess.application.on('ready', MainProcess.onReady);
    }
}
