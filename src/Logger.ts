import chalk from "chalk";
import { appendFile, existsSync, mkdirSync, readdirSync, statSync, unlink } from "fs";
import { dirname, join } from "path";

interface LoggerOptions {
    useConsole?: boolean;
    useFiles?: boolean;
    useColors?: boolean;
    logDirectory: string;
}

/**
 * @author Lexou
 * @version 1.0.0
 */
export default class Logger {
    private options: LoggerOptions;

    constructor(options: LoggerOptions = { logDirectory: './Logs' }) {
        this.options = {
            useConsole: options.useConsole ?? true,
            useFiles: options.useFiles ?? true,
            useColors: options.useColors ?? true,
            logDirectory: options.logDirectory ?? './Logs'
        }
    };

    private getFolder() {
        if(!this.options.useFiles) return;
        try {
            if(!existsSync(this.options.logDirectory)) {
                return mkdirSync(this.options.logDirectory, { recursive: true });
            }
        } catch(error) {
            throw new Error(`Une erreur est survenue durant la création du dossier de log.`)
        }
    }

    private formatLogMessage(type: LogType, message: string, tag?: string) {
        const formatTag = `${tag ? tag?.replace(/\n/g, ':\n') : tag ?? ""}`;
        
        let formatMessage: string;
        
        switch(type) {
            case 'Debug':
                formatMessage = chalk.bgGreen(chalk.black("| Success").padEnd(25, " ")) + chalk.bgBlack.white(this.formatDate().fullDate)
                break;
            case 'Info':
                break;
            case 'Warning':
                break;
            case 'Error':
                break;
            case 'Fatal':
                break;
            case 'Audit':
                break;
            case 'Performance':
                break;
            case 'Network':
                break;
            case 'User':
                break;
            case 'Workflow':
                break;
        }
    }

    public log(type: LogType, message: string, tag?: string) {
        const logMessage = this.formatLogMessage(type, message, tag);
    }

    public logInFile() {
        
    }
}

type LogType = 'Debug' | 'Info' | 'Warning' | 'Error' | 'Fatal' | 'Audit' | 'Performance' | 'Network' | 'User' | 'Workflow';