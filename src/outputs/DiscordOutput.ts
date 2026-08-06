import type { APIEmbed } from "discord.js";
import {
    DiscordGuildConfig,
    DiscordOutputConfig,
    IDiscordClient,
    ILogOutput,
    LogLevel,
    LogPayload,
} from "../types";

const LEVEL_COLORS: Record<LogLevel, number> = {
    [LogLevel.Debug]: 0x9b59b6,
    [LogLevel.Information]: 0x3498db,
    [LogLevel.Success]: 0x2ecc71,
    [LogLevel.Warning]: 0xf39c12,
    [LogLevel.Error]: 0xe74c3c,
    [LogLevel.Fatal]: 0x8e0000,
};

const LEVEL_EMOJI: Record<LogLevel, string> = {
    [LogLevel.Debug]: "🟣",
    [LogLevel.Information]: "🔵",
    [LogLevel.Success]: "🟢",
    [LogLevel.Warning]: "🟠",
    [LogLevel.Error]: "🔴",
    [LogLevel.Fatal]: "💀",
};

/** Taille maximale de la queue pre-ready (évite les fuites mémoire) */
const MAX_QUEUE_SIZE = 100;

export class DiscordOutput implements ILogOutput {
    private config: DiscordOutputConfig;
    private client: IDiscordClient | null = null;

    /**
     * Queue des payloads reçus avant que le client soit ready.
     * Vidée automatiquement dès que setClient() est appelé avec un client prêt,
     * ou dès que le client émet l'événement "ready".
     */
    private queue: LogPayload[] = [];

    constructor(config: DiscordOutputConfig, client?: IDiscordClient) {
        this.config = config;
        if (client) this.setClient(client);
    }

    /**
     * Injecte ou remplace le client Discord.
     * À appeler une fois que ton client est connecté.
     *
     * @example
     * // Option A — client fourni dès la construction (si déjà ready)
     * const logger = new Logger({ discord: { ... } }, client);
     *
     * // Option B — injection différée (recommandé dans la plupart des cas)
     * const logger = new Logger({ discord: { ... } });
     * client.once("ready", () => logger.setDiscordClient(client));
     */
    setClient(client: IDiscordClient): void {
        this.client = client;

        if (client.isReady()) {
            // Client déjà prêt → vider la queue immédiatement
            void this.flushQueue();
        } else {
            // Attendre le ready event pour vider la queue
            client.once("ready", () => void this.flushQueue());
        }
    }

    async log(payload: LogPayload): Promise<void> {
        if (!this.config.enabled) return;
        if (
            this.config.minLevel !== undefined &&
            payload.level < this.config.minLevel
        )
            return;
        if (
            payload.tag &&
            this.config.allowTags &&
            !this.config.allowTags.includes(payload.tag)
        )
            return;

        // Webhook : envoi direct, aucun client Discord requis
        if ("webhookUrl" in this.config.destination) {
            await this.send(payload);
            return;
        }

        // Client absent ou pas encore prêt → mise en queue
        if (!this.client?.isReady()) {
            if (this.queue.length < MAX_QUEUE_SIZE) {
                this.queue.push(payload);
            }
            return;
        }

        await this.send(payload);
    }

    // ─────────────────────────────────────────────
    //  Queue
    // ─────────────────────────────────────────────

    /** Vide la queue dans l'ordre d'arrivée */
    private async flushQueue(): Promise<void> {
        const pending = this.queue.splice(0);
        for (const payload of pending) {
            await this.send(payload).catch(() => null);
        }
    }

    // ─────────────────────────────────────────────
    //  Envoi
    // ─────────────────────────────────────────────

    private async send({
        level,
        message,
        tag,
        infos,
    }: LogPayload): Promise<void> {
        try {
            const embed = this.buildEmbed(level, message, tag, infos);
            const dest = this.config.destination;

            if ("webhookUrl" in dest) {
                await this.sendWebhook(dest.webhookUrl, embed);
            } else if ("dmUserId" in dest) {
                await this.sendDM(dest.dmUserId, embed);
            } else {
                await this.sendToGuild(dest, embed, tag);
            }
        } catch (err) {
            console.error(
                "[Logger:Discord] Erreur lors de l'envoi du log :",
                err,
            );
        }
    }

    // ─────────────────────────────────────────────
    //  Builders
    // ─────────────────────────────────────────────

    private buildEmbed(
        level: LogLevel,
        message: string,
        tag?: string,
        infos?: Record<string, unknown> | null,
    ) {
        const timestamp = new Date().toLocaleString("fr-FR", { hour12: false });
        const emoji = LEVEL_EMOJI[level];
        const levelName = LogLevel[level]!.toUpperCase();

        const embed: APIEmbed = {
            title: `${emoji} ${levelName}${tag ? ` — ${tag}` : ""}`,
            description: `\`\`\`${message}\`\`\``,
            color: LEVEL_COLORS[level],
            footer: { text: timestamp },
            fields: [],
        };

        if (infos && Object.keys(infos).length > 0) {
            const value = `\`\`\`json\n${JSON.stringify(infos, null, 2)}\`\`\``;
            (embed.fields as unknown[]).push({
                name: "Informations",
                value:
                    value.length > 1024 ? value.slice(0, 1020) + "…```" : value,
            });
        }

        return embed;
    }

    // ─────────────────────────────────────────────
    //  Envois
    // ─────────────────────────────────────────────

    private async sendDM(userId: string, embed: APIEmbed): Promise<void> {
        try {
            const user = await this.client!.users.fetch(userId);
            await user.send({ embeds: [embed] });
        } catch {
            console.warn(
                `[Logger:Discord] Impossible d'envoyer un DM à ${userId}`,
            );
        }
    }

    /**
     * Envoie un embed via un webhook Discord — aucun bot/client requis.
     */
    private async sendWebhook(
        webhookUrl: string,
        embed: APIEmbed,
    ): Promise<void> {
        const res = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embeds: [embed] }),
        });

        if (!res.ok) {
            console.warn(
                `[Logger:Discord] Webhook a répondu ${res.status} ${res.statusText}`,
            );
        }
    }

    private async sendToGuild(
        dest: DiscordGuildConfig,
        embed: APIEmbed,
        tag?: string,
    ): Promise<void> {
        let guild;
        try {
            guild =
                this.client!.guilds.cache.get(dest.guildId) ??
                (await this.client!.guilds.fetch(dest.guildId));
        } catch {
            console.warn(
                `[Logger:Discord] Guild introuvable : ${dest.guildId}`,
            );
            return;
        }

        // Channel fixe
        if (dest.channel) {
            const channel = guild.channels.cache.get(dest.channel);
            if (
                !channel?.isTextBased() ||
                !channel.isSendable?.() ||
                !channel.send
            ) {
                console.warn(
                    `[Logger:Discord] Channel ${dest.channel} invalide ou inaccessible.`,
                );
                return;
            }
            await channel.send({ embeds: [embed] }).catch(() => null);
            return;
        }

        // Channel dynamique par tag dans une catégorie
        if (dest.category && tag) {
            const channelName = `📋│${tag.toLowerCase()}`;
            let channel = [...guild.channels.cache.values()].find(
                (c) => c.name === channelName,
            );

            if (!channel) {
                try {
                    channel = await guild.channels.create({
                        name: channelName,
                        parent: dest.category,
                    });
                } catch {
                    console.warn(
                        `[Logger:Discord] Impossible de créer le channel ${channelName}`,
                    );
                    return;
                }
            }

            if (
                channel?.isTextBased() &&
                channel.isSendable?.() &&
                channel.send
            ) {
                await channel.send({ embeds: [embed] }).catch(() => null);
            }
            return;
        }

        console.warn(
            "[Logger:Discord] Aucune destination valide (channel ou category+tag requis).",
        );
    }
}
