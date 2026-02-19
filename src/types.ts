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

/** Payload passé à chaque output */
export interface LogPayload {
    level:   LogLevel;
    message: string;
    tag?:    string;
    infos?:  Record<string, unknown> | null;
}

/** Interface minimale que tout output doit respecter */
export interface ILogOutput {
    log(payload: LogPayload): void | Promise<void>;
}

// ─────────────────────────────────────────────
//  CONFIG — Console
// ─────────────────────────────────────────────

export interface ConsoleOutputConfig {
    /** Activer la sortie console (défaut: true) */
    enabled?:   boolean;
    /** Niveau minimum à afficher */
    minLevel?:  LogLevel;
    /** Si défini, seuls ces tags seront affichés */
    allowTags?: string[];
    /** Afficher le bloc "Infos" (défaut: true) */
    showInfos?: boolean;
}

// ─────────────────────────────────────────────
//  CONFIG — File
// ─────────────────────────────────────────────

export interface FileOutputConfig {
    /** Activer la sortie fichier */
    enabled?:     boolean;
    /** Dossier racine des logs (ex: "./logs") */
    folderPath:   string;
    /** Niveau minimum à écrire */
    minLevel?:    LogLevel;
    /** Si défini, seuls ces tags seront écrits */
    allowTags?:   string[];
    /** Taille max d'un fichier avant rotation (défaut: 5 MB) */
    maxFileSize?: number;
    /** Nombre de jours de rétention (défaut: 14) */
    maxDays?:     number;
    /** Grouper les logs par niveau dans des sous-dossiers (défaut: true) */
    groupByLevel?: boolean;
}

// ─────────────────────────────────────────────
//  CONFIG — Discord
// ─────────────────────────────────────────────

export interface IDiscordGuild {
    id: string;
    channels: {
        cache: Map<string, {
            name: string;
            type: number;
            isTextBased(): boolean;
            isSendable(): boolean;
            send(payload: unknown): Promise<unknown>;
        }>;
        create(options: unknown): Promise<{
            name: string;
            type: number;
            isTextBased(): boolean;
            isSendable(): boolean;
            send(payload: unknown): Promise<unknown>;
        }>;
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

/** Config pour envoyer en DM */
export interface DiscordDMConfig {
    dmUserId: string;
}

/** Config pour envoyer dans un channel de guilde */
export interface DiscordGuildConfig {
    guildId:   string;
    /** ID d'un channel fixe */
    channel?:  string;
    /** ID d'une catégorie pour créer des channels dynamiques par tag */
    category?: string;
}

export type DiscordDestination = DiscordDMConfig | DiscordGuildConfig;

export interface DiscordOutputConfig {
    /** Activer la sortie Discord */
    enabled?:    boolean;
    /** Niveau minimum */
    minLevel?:   LogLevel;
    /** Tags autorisés */
    allowTags?:  string[];
    /** Destination : DM ou guilde */
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
    level:    LogLevel,
    message:  string,
    tag?:     string,
    infos?:   Record<string, unknown> | null
) => Promise<void>;

export interface LogProxy extends LogFn {
    /** Envoie uniquement sur la console */
    console: LogFn;
    /** Envoie uniquement dans les fichiers */
    file:    LogFn;
    /** Envoie uniquement sur Discord */
    discord: LogFn;
}