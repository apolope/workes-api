const fs = require('fs');

const regexSlash = /\//;
class JsonManager {
    constructor(path, file, enableLog) {
        this.logCount = 0        
        this.fileUpdated = false
        this.toInit(path, file, enableLog)
    }

    async toInit(path, file, enableLog) {
        if(typeof enableLog == 'boolean') {
            this.logEnabled = enableLog
        } else if(enableLog === undefined) {
            this.logEnabled = false            
        } else if(typeof enableLog === 'string') {
            this.logEnabled = enableLog === 'true' ? true : false
        } else {
            this.logEnabled = false
        }        
        this.file = file
        this.pathExists = this.isExistsPath(path)
        if(this.pathExists) {
            path += regexSlash.test(path) ? '/' : '\\'
        }
        this.path = path
        this.fileWithPath = this.path + this.file
        this.readingFile = false
        await this.fileIsRead();
    }

    async readFile() {
        if(!this.readingFile) {
            this.readingFile = true
            try {
                this.log(`Init to read file (${this.fileWithPath})`, LOGTYPE.LOG)
                var data = fs.readFileSync(this.fileWithPath, 'utf8')
                this.log('Init to parse file', LOGTYPE.LOG)
                this.json = await JSON.parse(data.toString())
                this.log('File has been read and parsed', LOGTYPE.LOG)
            } catch(e) {
                this.log(e.stack, LOGTYPE.ERROR)
            }
            this.readingFile = this.fileUpdated = false;
        }
    }

    async saveFile(jsonStringfied) {
        if(this.pathExists){
            try {
                this.log('Init file save update', LOGTYPE.LOG)
                this.isExistsFile()
                await fs.promises.writeFile(this.fileWithPath, jsonStringfied, {
                    encoding: 'utf8'
                });
                this.log('File has been saved', LOGTYPE.LOG)
            } catch(e) {
                this.log(e.stack, LOGTYPE.ERROR)
            }
        } else {
            this.log(`Path (${this.path} is not exists)`, LOGTYPE.ERROR)
        }
        this.fileUpdated = true
    }

    async updateFile(jsonObject) {
        if(typeof jsonObject === 'object' && jsonObject !== null) {
            this.log('Init file update', LOGTYPE.LOG)
            try {
                await this.saveFile(JSON.stringify(jsonObject))
                this.log('File updated', LOGTYPE.LOG)
            } catch(e) {
                this.log(e.stack, LOGTYPE.ERROR)
            }
        } else {
            this.log(`The jsonObject need be an object, but is ${typeof jsonObject}`, LOGTYPE.ERROR)
        }
    }

    fileIsRead() {
        if(!this.readingFile) {            
            return this.json === undefined ? false : true
        }
    }

    async isNeedReadFile() {
        if((!this.fileIsRead() || this.fileUpdated) && !this.readingFile) {
            this.log(`It is necessary to read and parse the file because ${this.fileUpdated ? 'have update': 'still not read'}`, LOGTYPE.LOG)
            await this.readFile()
        }
    }

    isExistsPath(path) {
        if(fs.existsSync(path)) {
            this.log(`This folder (${path}) is valid!`, LOGTYPE.LOG)
            return true
        } else {
            this.log('This folder is invalid!', LOGTYPE.ERROR)
            return false
        }
    }

    isExistsFile() {
        if(fs.existsSync(this.fileWithPath)) {
            this.log(`This file (${this.fileWithPath}) exists!`, LOGTYPE.WARN)
            return true
        } else {
            this.log(`This file (${this.fileWithPath}) is invalid!`, LOGTYPE.ERROR)
            return false
        }
    }

    async getObject() {
        await this.isNeedReadFile()
        return this.json
    }

    async getKeys() {
        await this.isNeedReadFile()
        if(typeof this.json === 'object' && this.json !== null) {
            return getDeepKeys(this.json)
        } else {
            this.log('The JSON in file is not valid', LOGTYPE.ERROR)
        }
    }

    async changeFile(path, file, enableLog) {
        this.log(`File changed to (${file})`, LOGTYPE.WARN)
        await this.toInit(path, file, enableLog)
        this.fileUpdated = true
    }

    log(text, erroType) {
        let num = `#${this.logCount++}`
        if(this.logEnabled) {
            switch (erroType) {
                case LOGTYPE.WARN:
                    console.warn(
                        consoleParams.color(CONSOLECOLORS.FgYellow),
                        `${num} LOG WARN:`,
                        consoleParams.comands(CONSOLECOMMANDS.Reset),
                        text
                    )
                    break;
                case LOGTYPE.ERROR:
                    console.error(
                        consoleParams.color(CONSOLECOLORS.FgRed),
                        `${num} LOG ERROR:`,
                        consoleParams.comands(CONSOLECOMMANDS.Reset),
                        text
                    )
                    break;
                case LOGTYPE.LOG:
                    console.log(
                        consoleParams.color(CONSOLECOLORS.FgRed),
                        `${num} LOG:`,
                        consoleParams.comands(CONSOLECOMMANDS.Reset),
                        text
                    )
                    // console.log(`${num} LOG:`, text)
                    break;
                default:
                    console.log(text)
                    break;
            }
        }
    }

    async testPrintValues() {
        await this.isNeedReadFile()
        this.log('printValues ' + this.json)
    }

}

// Enums
const LOGTYPE = {
    WARN: 'warn',
    ERROR: 'error',
    LOG: 'log'
}

const CONSOLECOLORS = {
    FgBlack: 'FgBlack',
    FgRed: 'FgRed',
    FgGreen: 'FgGreen',
    FgYellow: 'FgYellow',
    FgBlue: 'FgBlue',
    FgMagenta: 'FgMagenta',
    FgCyan: 'FgCyan',
    FgWhite: 'FgWhite',
    FgBrightBlack: 'FgBrightBlack',
    FgBrightRed: 'FgBrightRed',
    FgBrightGreen: 'FgBrightGreen',
    FgBrightYello: 'FgBrightYello',
    FgBrightBlue: 'FgBrightBlue',
    FgBrightMagen: 'FgBrightMagen',
    FgBrightCyan: 'FgBrightCyan',
    FgBrightWhite: 'FgBrightWhite',
    BgBlack: 'BgBlack',
    BgRed: 'BgRed',
    BgGreen: 'BgGreen',
    BgYellow: 'BgYellow',
    BgBlue: 'BgBlue',
    BgMagenta: 'BgMagenta',
    BgCyan: 'BgCyan',
    BgWhite: 'BgWhite',
    BgBrightBlack: 'BgBrightBlack',
    BgBrightRed: 'BgBrightRed',
    BgBrightGreen: 'BgBrightGreen',
    BgBrightYello: 'BgBrightYello',
    BgBrightBlue: 'BgBrightBlue',
    BgBrightMagen: 'BgBrightMagen',
    BgBrightCyan: 'BgBrightCyan',
    BgBrightWhite: 'BgBrightWhite',
}

const CONSOLECOMMANDS = {
    Reset: 'Reset',
    Bright: 'Bright',
    Dim: 'Dim',
    Underscore: 'Underscore',
    Blink: 'Blink',
    Reverse: 'Reverse',
    Hidden: 'Hidden',
}

// Privates function
/**
 * @function getDeepKeys
 * @param obj Object
 * @access private
 */
 function getDeepKeys(obj) {
    var keys = [];
    for(var key in obj) {
        keys.push(key);
        if(typeof obj[key] === "object") {
            var subkeys = getDeepKeys(obj[key]);
            keys = keys.concat(subkeys.map(function(subkey) {
                return key + "." + subkey;
            }));
        }
    }
    return keys;
}

// reference codes on https://en.wikipedia.org/wiki/ANSI_escape_code#Colors
const consoleParams = {    
    color(data) {
        let toReturn = '\x1b['
        switch (data) {
            case CONSOLECOLORS.FgBlack:
                toReturn += '30'
                break;
            case CONSOLECOLORS.FgRed:
                toReturn += '31'
                break;
            case CONSOLECOLORS.FgGreen:
                toReturn += '32'
                break;
            case CONSOLECOLORS.FgYellow:
                toReturn += '33'
                break;
            case CONSOLECOLORS.FgBlue:
                toReturn += '34'
                break;
            case CONSOLECOLORS.FgMagenta:
                toReturn += '35'
                break;
            case CONSOLECOLORS.FgCyan:
                toReturn += '36'
                break;
            case CONSOLECOLORS.FgWhite:
                toReturn += '37'
                break;
            case CONSOLECOLORS.FgBrightBlack:
                toReturn += '90'
                break;
            case CONSOLECOLORS.FgBrightRed:
                toReturn += '91'
                break;
            case CONSOLECOLORS.FgBrightGreen:
                toReturn += '92'
                break;
            case CONSOLECOLORS.FgBrightYellow:
                toReturn += '93'
                break;
            case CONSOLECOLORS.FgBrightBlue:
                toReturn += '94'
                break;
            case CONSOLECOLORS.FgBrightMagenta:
                toReturn += '95'
                break;
            case CONSOLECOLORS.FgBrightCyan:
                toReturn += '96'
                break;
            case CONSOLECOLORS.FgBrightWhite:
                toReturn += '97'
                break;
            case CONSOLECOLORS.BgBlack:
                toReturn = '40'
                break;
            case CONSOLECOLORS.BgRed:
                toReturn = '41'
                break;
            case CONSOLECOLORS.BgGreen:
                toReturn = '42'
                break;
            case CONSOLECOLORS.BgYellow:
                toReturn = '43'
                break;
            case CONSOLECOLORS.BgBlue:
                toReturn = '44'
                break;
            case CONSOLECOLORS.BgMagenta:
                toReturn = '45'
                break;
            case CONSOLECOLORS.BgCyan:
                toReturn = '46'
                break;
            case CONSOLECOLORS.BgWhite:
                toReturn = '47'
                break;
            case CONSOLECOLORS.BgBrightBlack:
                toReturn = '100'
                break;
            case CONSOLECOLORS.BgBrightRed:
                toReturn = '101'
                break;
            case CONSOLECOLORS.BgBrightGreen:
                toReturn = '102'
                break;
            case CONSOLECOLORS.BgBrightYellow:
                toReturn = '103'
                break;
            case CONSOLECOLORS.BgBrightBlue:
                toReturn = '104'
                break;
            case CONSOLECOLORS.BgBrightMagenta:
                toReturn = '105'
                break;
            case CONSOLECOLORS.BgBrightCyan:
                toReturn = '106'
                break;
            case CONSOLECOLORS.BgBrightWhite:
                toReturn = '107'
                break;
            default:
                break;
        }

        return toReturn += 'm'
    },
    comands(data) {
        let toReturn = '\x1b['
        switch (data) {
            case CONSOLECOMMANDS.Reset:
                toReturn += '0'
                break;
            case CONSOLECOMMANDS.Bright:
                toReturn += '1'
                break;
            case CONSOLECOMMANDS.Dim:
                toReturn += '2'
                break;
            case CONSOLECOMMANDS.Underscore:
                toReturn += '4'
                break;
            case CONSOLECOMMANDS.Blink:
                toReturn += '5'
                break;
            case CONSOLECOMMANDS.Reverse:
                toReturn += '7'
                break;
            case CONSOLECOMMANDS.Hidden:
                toReturn += '8'
                break;
            default:
                break;
        }
        return toReturn += 'm'
    }
}

module.exports = {
    JsonManager
};
