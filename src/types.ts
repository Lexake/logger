// ─────────────────────────────────────────────
//  ENUMS
// ─────────────────────────────────────────────

export enum LogLevel {
    Debug       = 0,
    Information = 1,
    Success     = 2,
    Warning     = 3,
    Error       = 4,
    Fatal       = 5,
}

// ─────────────────────────────────────────────
//  CORE TYPES
// ─────────────────────────────────────────────

export interface LogPayload {
    level:   LogLevel;
    message: string;
    tag?:    string;
    infos?:  Record<string, unknown> | null;
}

export interface ILogOutput {
    log(payload: LogPayload): void | Promise<void>;
}

// ─────────────────────────────────────────────
//  CONFIG — Console
// ─────────────────────────────────────────────

export interface ConsoleOutputConfig {
    enabled?:   boolean;
    minLevel?:  LogLevel;
    allowTags?: string[];
    showInfos?: boolean;
}

// ─────────────────────────────────────────────
//  CONFIG — File
// ─────────────────────────────────────────────

export interface FileOutputConfig {
    enabled?:      boolean;
    folderPath:    string;
    minLevel?:     LogLevel;
    allowTags?:    string[];
    maxFileSize?:  number;
    maxDays?:      number;
    groupByLevel?: boolean;
}

// ─────────────────────────────────────────────
//  CONFIG — Discord
// ─────────────────────────────────────────────

/**
 * Channel pouvant recevoir des messages.
 * Utilisé pour les résultats de fetch et les channels sendables.
 */
export interface IDiscordSendableChannel {
    name:          string;
    isTextBased(): boolean;
    isSendable():  boolean;
    send(payload: unknown): Promise<unknown>;
}

/**
 * Channel générique dans le cache — représente TOUS les types
 * (TextChannel, CategoryChannel, VoiceChannel, etc.).
 * send() est optionnel car CategoryChannel & VoiceChannel ne l'ont pas.
 */
export interface IDiscordCacheChannel {
    name:          string;
    isTextBased(): boolean;
    isSendable():  boolean;
    send?:         (payload: unknown) => Promise<unknown>;
}

/**
 * Client Discord minimal — évite de dépendre directement de discord.js.
 * Compatible avec Client<true> et Client<boolean> de discord.js v14+.
 */
export interface IDiscordClient {
    isReady(): boolean;
    once(event: "ready", listener: () => void): void;
    users: {
        fetch(id: string): Promise<{ send(payload: unknown): Promise<unknown> }>;
    };
    channels: {
        cache: Map<string, IDiscordCacheChannel>;
    };
    guilds: {
        fetch(id: string): Promise<IDiscordGuild>;
        cache: Map<string, IDiscordGuild>;
    };
}

export interface IDiscordGuild {
    id: string;
    channels: {
        cache: Map<string, IDiscordSendableChannel>;
        create(options: unknown): Promise<IDiscordSendableChannel>;
    };
    roles: { everyone: { id: string } };
    members: {
        me: {
            permissionsIn(channel: unknown): {
                has(perms: string[]): boolean;
            };
        } | null;
    };
}

export interface DiscordDMConfig {
    dmUserId: string;
}

export interface DiscordGuildConfig {
    guildId:   string;
    channel?:  string;
    category?: string;
}

export type DiscordDestination = DiscordDMConfig | DiscordGuildConfig;

export interface DiscordOutputConfig {
    enabled?:    boolean;
    minLevel?:   LogLevel;
    allowTags?:  string[];
    destination: DiscordDestination;
}

// ─────────────────────────────────────────────
//  CONFIG — Logger global
// ─────────────────────────────────────────────

export interface LoggerConfig {
    console?: ConsoleOutputConfig;
    file?:    FileOutputConfig;
    discord?: DiscordOutputConfig;
}

// ─────────────────────────────────────────────
//  PROXY TYPE
// ─────────────────────────────────────────────

export type LogFn = (
    level:   LogLevel,
    message: string,
    tag?:    string,
    infos?:  Record<string, unknown> | null
) => Promise<void>;

export interface LogProxy extends LogFn {
    console: LogFn;
    file:    LogFn;
    discord: LogFn;
}