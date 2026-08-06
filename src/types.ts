// ─────────────────────────────────────────────
//  ENUMS
// ─────────────────────────────────────────────

import { MessageCreateOptions, MessagePayload } from "discord.js";

export enum LogLevel {
    Debug = 0,
    Information = 1,
    Success = 2,
    Warning = 3,
    Error = 4,
    Fatal = 5,
}

// ─────────────────────────────────────────────
//  CORE TYPES
// ─────────────────────────────────────────────

export interface LogPayload {
    level: LogLevel;
    message: string;
    tag?: string;
    infos?: Record<string, unknown> | null;
}

export interface ILogOutput {
    log(payload: LogPayload): void | Promise<void>;
}

// ─────────────────────────────────────────────
//  CONFIG — Console
// ─────────────────────────────────────────────

export interface ConsoleOutputConfig {
    enabled?: boolean;
    minLevel?: LogLevel;
    allowTags?: string[];
    showInfos?: boolean;
}

// ─────────────────────────────────────────────
//  CONFIG — File
// ─────────────────────────────────────────────

export interface FileOutputConfig {
    enabled?: boolean;
    folderPath: string;
    minLevel?: LogLevel;
    allowTags?: string[];
    maxFileSize?: number;
    maxDays?: number;
    groupByLevel?: boolean;
}

// ─────────────────────────────────────────────
//  CONFIG — Discord
// ─────────────────────────────────────────────

/**
 * Channel pouvant recevoir des messages (typé proprement avec d.js sans bloquer)
 */
export interface IDiscordSendableChannel {
    send(
        options: string | MessagePayload | MessageCreateOptions,
    ): Promise<unknown>;
}

export interface IDiscordCacheChannel {
    name?: string;
    isTextBased(): boolean;
    isSendable(): boolean;
    send?: (
        options: string | MessagePayload | MessageCreateOptions,
    ) => Promise<unknown>;
}

export interface IDiscordGuild {
    id: string;
    name: string;
    channels: {
        cache: {
            forEach(
                callback: (value: IDiscordCacheChannel, key: string) => void,
            ): void;
            get(id: string): IDiscordCacheChannel | undefined;
        };
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

/**
 * Client Discord minimal découplé et compatible avec discord.js v14+
 */
export interface IDiscordClient {
    isReady(): boolean;
    once(event: "ready", listener: () => void): void;
    users: {
        fetch(id: string): Promise<IDiscordSendableChannel>;
    };
    channels: {
        cache: {
            forEach(
                callback: (value: IDiscordCacheChannel, key: string) => void,
            ): void;
            get(id: string): IDiscordCacheChannel | undefined;
        };
    };
    guilds: {
        fetch(id: string): Promise<IDiscordGuild>;
        cache: {
            forEach(
                callback: (value: IDiscordGuild, key: string) => void,
            ): void;
            get(id: string): IDiscordGuild | undefined;
        };
    };
}

export interface DiscordDMConfig {
    dmUserId: string;
}

export interface DiscordGuildConfig {
    guildId: string;
    channel?: string;
    category?: string;
}

export interface DiscordWebhookConfig {
    webhookUrl: string;
}

export type DiscordDestination =
    | DiscordDMConfig
    | DiscordGuildConfig
    | DiscordWebhookConfig;

export interface DiscordOutputConfig {
    enabled?: boolean;
    minLevel?: LogLevel;
    allowTags?: string[];
    destination: DiscordDestination;
}

// ─────────────────────────────────────────────
//  CONFIG — Logger global
// ─────────────────────────────────────────────

export interface LoggerConfig {
    console?: ConsoleOutputConfig;
    file?: FileOutputConfig;
    discord?: DiscordOutputConfig;
}

// ─────────────────────────────────────────────
//  PROXY TYPE
// ─────────────────────────────────────────────

export type LogFn = (
    level: LogLevel,
    message: string,
    tag?: string,
    infos?: Record<string, unknown> | null,
) => void;
