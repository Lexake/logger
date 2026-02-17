
import { ConsoleOutputConfig, ILogOutput, LogLevel, LogPayload } from "../types";

// Couleurs ANSI sans dépendance chalk — portable partout
const ANSI = {
    reset:   "\x1b[0m",
    bold:    "\x1b[1m",
    dim:     "\x1b[2m",
    // Couleurs texte
    gray:    "\x1b[90m",
    white:   "\x1b[97m",
    cyan:    "\x1b[96m",
    green:   "\x1b[92m",
    yellow:  "\x1b[93m",
    red:     "\x1b[91m",
    magenta: "\x1b[95m",
    blue:    "\x1b[94m",
} as const;

const LEVEL_STYLE: Record<LogLevel, { color: string; symbol: string; label: string }> = {
    [LogLevel.Debug]:       { color: ANSI.magenta, symbol: "◆", label: "DEBUG"   },
    [LogLevel.Information]: { color: ANSI.blue,    symbol: "●", label: "INFO"    },
    [LogLevel.Success]:     { color: ANSI.green,   symbol: "✔", label: "SUCCESS" },
    [LogLevel.Warning]:     { color: ANSI.yellow,  symbol: "▲", label: "WARN"    },
    [LogLevel.Error]:       { color: ANSI.red,     symbol: "✖", label: "ERROR"   },
    [LogLevel.Fatal]:       { color: ANSI.red,     symbol: "☠", label: "FATAL"   },
};

export class ConsoleOutput implements ILogOutput {
    private config: ConsoleOutputConfig;

    constructor(config: ConsoleOutputConfig = {}) {
        this.config = {
            enabled:   true,
            showInfos: true,
            ...config,
        };
    }

    log({ level, message, tag, infos }: LogPayload): void {
        if (!this.config.enabled) return;
        if (this.config.minLevel !== undefined && level < this.config.minLevel) return;
        if (tag && this.config.allowTags && !this.config.allowTags.includes(tag)) return;

        const style     = LEVEL_STYLE[level];
        const timestamp = new Date().toLocaleString("fr-FR", { hour12: false });
        const sep       = `${ANSI.gray}${"─".repeat(70)}${ANSI.reset}`;

        const header =
            `${style.color}${ANSI.bold}${style.symbol}  ${style.label.padEnd(7)}${ANSI.reset}` +
            `${ANSI.gray}  ${timestamp}${ANSI.reset}`;

        const tagLine     = tag     ? `\n${ANSI.gray}│ Tag    : ${ANSI.reset}${ANSI.dim}${tag}${ANSI.reset}` : "";
        const messageLine = `\n${ANSI.gray}│ ${ANSI.reset}${ANSI.white}${message}${ANSI.reset}`;

        let output = `${sep}\n${header}${tagLine}${messageLine}`;

        if (this.config.showInfos !== false && infos && Object.keys(infos).length > 0) {
            const formatted = JSON.stringify(infos, null, 2)
                .split("\n")
                .map(line => `${ANSI.gray}│ ${ANSI.reset}${ANSI.cyan}${line}${ANSI.reset}`)
                .join("\n");
            output += `\n${ANSI.gray}│ Infos :${ANSI.reset}\n${formatted}`;
        }

        output += `\n${sep}`;
        console.log(output);
    }
}