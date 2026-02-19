// ─────────────────────────────────────────────
//  Classe principale
// ─────────────────────────────────────────────
export { Logger } from "./Logger";

// ─────────────────────────────────────────────
//  Outputs (si besoin d'extension externe)
// ─────────────────────────────────────────────
export { ConsoleOutput } from "./outputs/ConsoleOutput";
export { FileOutput }    from "./outputs/FileOutput";
export { DiscordOutput } from "./outputs/DiscordOutput";

// ─────────────────────────────────────────────
//  Types & interfaces — tout ce qu'un consommateur peut avoir besoin
// ─────────────────────────────────────────────
export {
    LogLevel,
    // Config
    type LoggerConfig,
    type ConsoleOutputConfig,
    type FileOutputConfig,
    type DiscordOutputConfig,
    type DiscordDMConfig,
    type DiscordGuildConfig,
    type DiscordDestination,
    // Interfaces
    type ILogOutput,
    type IDiscordGuild,
    // Payload & Proxy
    type LogPayload,
    type LogFn,
    type LogProxy,
} from "./types";