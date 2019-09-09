import { app, BrowserWindow } from 'electron';
import MainProcess from './MainProcess';

MainProcess.initialize(app, BrowserWindow);
