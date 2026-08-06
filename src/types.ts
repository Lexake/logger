/**
 * @file Types partagés de @lex0u/logger.
 * @author Lex0u
 * @version 2.2.6
 */

/**
 * Niveaux de log disponibles, du plus verbeux au plus critique.
 *
 * @remarks
 * L'ordre des valeurs numériques importe : il permet le filtrage via `minLevel`
 * (ex: `minLevel: LogLevel.Warning` ignore Debug/Information/Success).
 */
export enum LogLevel {
    Debug = 0,
    Information = 1,
    Success = 2,
    Warning = 3,
    Error = 4,
    Fatal = 5,
}

/**
 * Payload interne transmis à chaque output (console, file, discord...).
 * C'est la forme normalisée d'un log, une fois passé à travers `Logger.log()`.
 */
export interface LogPayload {
    level: LogLevel;
    message: string;
    /** Catégorie libre du log (ex: "Commands", "Database"). Sert aussi au filtrage via `allowTags`. */
    tag?: string;
    /** Métadonnées additionnelles (stack trace, contexte...), sérialisées en JSON par les outputs qui les affichent. */
    infos?: Record<string, unknown> | null;
}

/**
 * Contrat que doit respecter n'importe quelle sortie de log (console, fichier, Discord...).
 *
 * @example
 * ```ts
 * class MyCustomOutput implements ILogOutput {
 *   async log(payload: LogPayload) {
 *     // envoyer ailleurs, écrire quelque part, etc.
 *   }
 * }
 * ```
 */
export interface ILogOutput {
    log(payload: LogPayload): void | Promise<void>;
}

/**
 * Configuration de la sortie console.
 */
export interface ConsoleOutputConfig {
    enabled?: boolean;
    /** Niveau minimum affiché. Les logs en dessous sont ignorés par cette sortie uniquement. */
    minLevel?: LogLevel;
    /** Si défini, seuls les logs portant un de ces tags sont affichés. */
    allowTags?: string[];
    /** Affiche ou non le champ `infos` dans la sortie console. */
    showInfos?: boolean;
}

/**
 * Configuration de la sortie fichier.
 */
export interface FileOutputConfig {
    enabled?: boolean;
    /** Dossier où écrire les fichiers de log. Créé automatiquement s'il n'existe pas. */
    folderPath: string;
    minLevel?: LogLevel;
    allowTags?: string[];
    /** Taille max d'un fichier avant rotation, en octets. */
    maxFileSize?: number;
    /** Nombre de jours de rétention avant suppression des anciens fichiers. */
    maxDays?: number;
    /** Si activé, sépare les fichiers par niveau de log plutôt qu'un seul fichier global. */
    groupByLevel?: boolean;
}

/**
 * Représente n'importe quel type de channel discord.js (TextChannel, CategoryChannel,
 * VoiceChannel, ForumChannel, DMChannel, PartialGroupDMChannel...).
 *
 * @remarks
 * Un seul contrat sert pour le cache client ET le cache guild : dans la réalité de discord.js,
 * les mêmes types de channels (catégories, forums, threads...) peuvent apparaître dans les
 * deux, donc les séparer en deux interfaces distinctes forçait une synchro manuelle à chaque
 * nouveau type de channel découvert.
 *
 * `name` / `send` / `isSendable` sont optionnels car aucun type de channel ne les a tous :
 * un `CategoryChannel` n'a pas `send`, un `DMChannel` n'a pas `name`, un `PartialGroupDMChannel`
 * a `name: string | null`.
 *
 * @example
 * ```ts
 * if (channel.isTextBased() && channel.isSendable?.() && channel.send) {
 *   await channel.send("hello");
 * }
 * ```
 *
 * @see {@link IDiscordSendableChannel} — alias, même contrat.
 */
export interface IDiscordCacheChannel {
    name?: string | null;
    isTextBased(): boolean;
    isSendable?(): boolean;
    send?(payload: unknown): Promise<unknown>;
}

/**
 * Alias de {@link IDiscordCacheChannel} — conservé pour la lisibilité selon le contexte
 * d'utilisation (cache d'un client vs cache d'une guild), sans dupliquer le contrat.
 */
export type IDiscordSendableChannel = IDiscordCacheChannel;

/**
 * Client Discord minimal requis par le logger.
 *
 * @remarks
 * Volontairement découplé de `discord.js` : le logger n'importe jamais la lib directement,
 * il attend juste un objet qui respecte cette forme. Un vrai `Client` discord.js v14+ la
 * satisfait nativement (`Client<true>` comme `Client<boolean>`), mais n'importe quel wrapper
 * ou mock de test le peut aussi.
 *
 * @example
 * ```ts
 * const logger = new Logger({ discord: { ... } });
 * client.once("ready", () => logger.setDiscordClient(client));
 * ```
 */
export interface IDiscordClient {
    isReady(): boolean;
    once(event: "ready", listener: () => void): void;
    users: {
        fetch(
            id: string,
        ): Promise<{ send(payload: unknown): Promise<unknown> }>;
    };
    channels: {
        cache: Map<string, IDiscordCacheChannel>;
    };
    guilds: {
        fetch(id: string): Promise<IDiscordGuild>;
        cache: Map<string, IDiscordGuild>;
    };
}

/**
 * Guild Discord minimale requise par le logger, pour la destination `DiscordGuildConfig`.
 */
export interface IDiscordGuild {
    id: string;
    channels: {
        cache: Map<string, IDiscordSendableChannel>;
        create(options: unknown): Promise<IDiscordSendableChannel>;
    };
    roles: { everyone: { id: string } };
    members: {
        /** `null` si le bot n'est pas (ou plus) membre de cette guild. */
        me: {
            permissionsIn(channel: unknown): {
                has(perms: unknown): boolean;
            };
        } | null;
    };
}

/**
 * Destination "message privé" — envoie chaque log en DM à un utilisateur donné.
 */
export interface DiscordDMConfig {
    dmUserId: string;
}

/**
 * Destination "salon de guild" — poste les logs dans un channel fixe, ou en crée
 * un dynamiquement par tag si `category` est fourni sans `channel`.
 */
export interface DiscordGuildConfig {
    guildId: string;
    /** ID ou nom du channel fixe. Prioritaire sur `category` si les deux sont fournis. */
    channel?: string;
    /** ID de la catégorie où créer/chercher un channel nommé d'après le tag du log. */
    category?: string;
}

/**
 * Destination "webhook" — envoi direct via une URL de webhook Discord, sans bot ni client requis.
 */
export interface DiscordWebhookConfig {
    webhookUrl: string;
}

/** Union des destinations possibles pour la sortie Discord. */
export type DiscordDestination =
    | DiscordDMConfig
    | DiscordGuildConfig
    | DiscordWebhookConfig;

/**
 * Configuration de la sortie Discord (DM, salon de guild, ou webhook).
 */
export interface DiscordOutputConfig {
    enabled?: boolean;
    minLevel?: LogLevel;
    allowTags?: string[];
    destination: DiscordDestination;
}

/**
 * Configuration globale du logger — une entrée par sortie disponible.
 * Chaque sortie est indépendante et peut avoir son propre `minLevel`/`allowTags`.
 *
 * @example
 * ```ts
 * const logger = new Logger({
 *   console: { enabled: true },
 *   file: { enabled: true, folderPath: "./logs" },
 * });
 * ```
 */
export interface LoggerConfig {
    console?: ConsoleOutputConfig;
    file?: FileOutputConfig;
    discord?: DiscordOutputConfig;
}

/**
 * Signature d'une fonction de log unique (utilisée aussi bien pour le proxy global
 * que pour chaque sortie prise individuellement).
 */
export type LogFn = (
    level: LogLevel,
    message: string,
    tag?: string,
    infos?: Record<string, unknown> | null,
) => Promise<void>;

/**
 * `logger.log` est à la fois une fonction directement appelable (log sur toutes les
 * sorties actives) et un objet exposant chaque sortie individuellement.
 *
 * @example
 * ```ts
 * await logger.log(LogLevel.Error, "Oups");           // toutes les sorties actives
 * await logger.log.discord(LogLevel.Error, "Oups");   // Discord uniquement
 * ```
 */
export interface LogProxy extends LogFn {
    console: LogFn;
    file: LogFn;
    discord: LogFn;
}
