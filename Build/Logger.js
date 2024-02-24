"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const fs_1 = require("fs");
const path_1 = require("path");
class Logger {
    constructor() { }
    ;
    formatDate() {
        const date = new Date();
        const Year = date.getFullYear();
        const Month = (date.getMonth() + 1).toString().padStart(2, '0');
        const Day = date.getDate().toString().padStart(2, '0');
        const Hour = date.getHours().toString().padStart(2, '0');
        const Minutes = date.getMinutes().toString().padStart(2, '0');
        const Seconds = date.getSeconds().toString().padStart(2, '0');
        const Milliseconds = date.getMilliseconds().toString().padStart(3, '0');
        return {
            fullDate: `[${Day}-${Month}-${Year} ${Hour}:${Minutes}:${Seconds}:${Milliseconds}]`,
            date: `${Day}-${Month}-${Year}`,
            hour: `${Hour}:${Minutes}:${Seconds}:${Milliseconds}`
        };
    }
    logInConsole(type, message, tag) {
        let logMessage = '';
        switch (type) {
            case 'Success':
                logMessage += chalk_1.default.bgGreen(chalk_1.default.black("| Success").padEnd(25, " ")) + chalk_1.default.bgBlack.white(this.formatDate().fullDate) + chalk_1.default.bgGreen(" ") + " " + chalk_1.default.green(tag ? `${this.formatTag(tag)}${message}` : message);
                break;
            case 'Information':
                logMessage += chalk_1.default.bgBlue(chalk_1.default.white("| Information").padEnd(25, " ")) + chalk_1.default.bgBlack.white(this.formatDate().fullDate) + chalk_1.default.bgBlue(" ") + " " + chalk_1.default.blue(tag ? `${this.formatTag(tag)}${message}` : message);
                break;
            case 'Error':
                logMessage += chalk_1.default.bgRed(chalk_1.default.white("| Error").padEnd(25, " ")) + chalk_1.default.bgBlack.white(this.formatDate().fullDate) + chalk_1.default.bgRed(" ") + " " + chalk_1.default.red(tag ? `${this.formatTag(tag)}${message}` : message);
                break;
            case 'Warning':
                logMessage += chalk_1.default.bgYellow(chalk_1.default.white("| Warning").padEnd(25, " ")) + chalk_1.default.bgBlack(chalk_1.default.white(this.formatDate().fullDate) + chalk_1.default.bgYellow(" ")) + " " + chalk_1.default.yellow(tag ? `${this.formatTag(tag)}${message}` : message);
                break;
            case 'Debug':
                logMessage += chalk_1.default.bgHex('#5000FA')(chalk_1.default.white("| Debug").padEnd(25, " ")) + chalk_1.default.bgBlack.white(this.formatDate().fullDate) + chalk_1.default.bgHex('#5000FA')(" ") + " " + chalk_1.default.hex('#5000FA')(tag ? `${this.formatTag(tag)}${message}` : message);
                break;
            case 'Fatal':
                logMessage += chalk_1.default.bgHex("#FF0000")(chalk_1.default.black("| Fatal").padEnd(25, " ")) + chalk_1.default.bgBlack.white(this.formatDate().fullDate) + chalk_1.default.bgHex('#FF0000')(" ") + " " + chalk_1.default.hex('#FF0000')(tag ? `${this.formatTag(tag)}${message}` : message);
        }
        console.log(logMessage);
    }
    formatTag(tag) {
        if (tag && tag.includes('\n')) {
            return `${tag.replace(/\n/g, ':\n')}`;
        }
        return `${tag}: `;
    }
    logInFile(type, message, guildId) {
        // Établissement de la date du jour
        const currentDate = new Date();
        const day = ('0' + currentDate.getDate()).slice(-2); //Jour et limite à 2 le nombre de caractères
        const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
        const year = currentDate.getFullYear();
        const hours = ('0' + currentDate.getHours()).slice(-2);
        const minutes = ('0' + currentDate.getMinutes()).slice(-2);
        const seconds = ('0' + currentDate.getSeconds()).slice(-2);
        const milliseconds = ('0' + currentDate.getMilliseconds()).slice(-3);
        // Identification du dossier ./Logs sinon création
        if (!(0, fs_1.existsSync)(`./Logs`))
            (0, fs_1.mkdirSync)(`./Logs`);
        if (!(0, fs_1.existsSync)(`./Logs/${type}`))
            (0, fs_1.mkdirSync)(`./Logs/${type}`);
        // Établissement du nom de fichier en fonction de la présence ou non d'un guildId
        let fileName;
        if (guildId) {
            if (!(0, fs_1.existsSync)(`./Logs/${type}/${guildId}`))
                (0, fs_1.mkdirSync)(`./Logs/${type}/${guildId}`);
            fileName = `./Logs/${type}/${guildId}/${day}-${month}-${year}.log`;
        }
        else {
            fileName = `./Logs/${type}/${day}-${month}-${year}.log`;
        }
        // Suppression des fichiers ayant été créés 14 jours plus tôt
        const directory = (0, path_1.dirname)(fileName);
        (0, fs_1.readdirSync)(directory).forEach((file) => {
            const filePath = (0, path_1.join)(directory, file);
            const stat = (0, fs_1.statSync)(filePath);
            if (stat.isFile()) {
                const fileDate = new Date(file.split('.')[0] ?? "0");
                const daysDifference = Math.ceil((currentDate.getTime() - fileDate.getTime()) / (1000 * 3600 * 24));
                if (daysDifference >= 14) {
                    (0, fs_1.unlink)(filePath, () => { });
                }
            }
        });
        const logLine = `[${type.toUpperCase()} | ${day}-${month}-${year} | ${hours}:${minutes}:${seconds}:${milliseconds}]\n${message}\n${"-".repeat(114)}\n`;
        (0, fs_1.appendFile)(fileName, logLine, (err) => {
            if (err) {
                throw err;
            }
        });
    }
}
exports.default = Logger;
