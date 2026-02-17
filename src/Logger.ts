import { ConsoleOutput }  from "./outputs/ConsoleOutput";
import { DiscordOutput }  from "./outputs/DiscordOutput";
import { FileOutput }     from "./outputs/FileOutput";
import type {
    IDiscordClient,
    ILogOutput,
    LogFn,
    LoggerConfig,
    LogPayload,
    LogProxy,
} from "./types";
import { LogLevel } from "./types";

/**
 * @class Logger
 *
 * Logger multi-sortie (console, fichier, Discord).
 * Portable : ne dépend d'aucun framework spécifique.
 *
 * @example
 * // Sans Discord
 * const logger = new Logger({ console: { enabled: true }, file: { enabled: true, folderPath: "./logs" } });
 * logger.log(LogLevel.Info, "Serveur démarré", "App");
 * logger.log.console(LogLevel.Debug, "Debug local uniquement", "Auth");
 *
 * // Avec Discord
 * const logger = new Logger({ ... }, discordClient);
 * logger.log.discord(LogLevel.Error, "Erreur critique !", "DB");
 */
export class Logger {
    private outputs: {
        console: ConsoleOutput | null;
        file:    FileOutput    | null;
        discord: DiscordOutput | null;
    };

    /** Proxy typé : logger.log(...) ou logger.log.console(...) */
    public log: LogProxy;

    constructor(config: LoggerConfig, discordClient?: IDiscordClient) {
        this.outputs = {
            console: config.console ? new ConsoleOutput(config.console) : null,
            file:    config.file    ? new FileOutput(config.file)       : null,
            discord: (config.discord && discordClient)
                ? new DiscordOutput(config.discord, discordClient)
                : null,
        };

        this.log = this.createProxy();
    }

    /**
     * Injecte le client Discord après la création du logger.
     * Les logs Discord émis avant cet appel sont mis en queue et envoyés automatiquement
     * dès que le client est ready.
     *
     * @example
     * const logger = new Logger({ console: {...}, discord: {...} });
     *
     * const client = new Client({ intents: [...] });
     * client.once("ready", () => logger.setDiscordClient(client));
     * client.login(token);
     */
    setDiscordClient(client: IDiscordClient): void {
        if (!this.outputs.discord) {
            console.warn("[Logger] setDiscordClient() appelé mais la sortie Discord n'est pas configurée.");
            return;
        }
        this.outputs.discord.setClient(client);
    }

    // ─────────────────────────────────────────────
    //  Proxy
    // ─────────────────────────────────────────────

    private createProxy(): LogProxy {
        const all     = this._logAll.bind(this);
        const proxy   = new Proxy(all as LogFn, {
            get: (_target, prop) => {
                if (prop === "console") return this._logOnly.bind(this, "console");
                if (prop === "file")    return this._logOnly.bind(this, "file");
                if (prop === "discord") return this._logOnly.bind(this, "discord");
                return Reflect.get(all, prop);
            },
        });
        return proxy as LogProxy;
    }

    // ─────────────────────────────────────────────
    //  Méthodes d'envoi
    // ─────────────────────────────────────────────

    /** Envoie vers toutes les sorties actives */
    private async _logAll(
        level:   LogLevel,
        message: string,
        tag?:    string,
        infos?:  Record<string, unknown> | null
    ): Promise<void> {
        const payload = this.buildPayload(level, message, tag, infos);
        await Promise.allSettled([
            this.safeLog(this.outputs.console, payload, "console"),
            this.safeLog(this.outputs.file,    payload, "file"),
            this.safeLog(this.outputs.discord, payload, "discord"),
        ]);
    }

    /** Envoie vers une sortie spécifique uniquement */
    private async _logOnly(
        target:  "console" | "file" | "discord",
        level:   LogLevel,
        message: string,
        tag?:    string,
        infos?:  Record<string, unknown> | null
    ): Promise<void> {
        const payload = this.buildPayload(level, message, tag, infos);
        await this.safeLog(this.outputs[target], payload, target);
    }

    // ─────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────

    private buildPayload(
        level: LogLevel,
        message: string,
        tag?: string,
        infos?: Record<string, unknown> | null
    ): LogPayload {
        const payload: LogPayload = { level, message } as LogPayload;
        if (tag !== undefined) payload.tag = tag;
        if (infos !== undefined) payload.infos = infos;
        return payload;
    }

    private async safeLog(
        output: ILogOutput | null,
        payload: LogPayload,
        name: string
    ): Promise<void> {
        if (!output) return;
        try {
            await output.log(payload);
        } catch (err) {
            console.error(`[Logger:${name}] Erreur lors du log :`, err);
        }
    }
}