# @lex0u/logger

<p align="center">

![npm version](https://img.shields.io/npm/v/@lex0u/logger?color=blue)
![npm downloads](https://img.shields.io/npm/dm/@lex0u/logger?color=green)
![npm total downloads](https://img.shields.io/npm/dt/@lex0u/logger?color=brightgreen)
![license](https://img.shields.io/npm/l/@lex0u/logger)
![types](https://img.shields.io/npm/types/@lex0u/logger)
![node](https://img.shields.io/node/v/@lex0u/logger)
![issues](https://img.shields.io/github/issues/lex0u/logger)
![stars](https://img.shields.io/github/stars/lex0u/logger?style=social)

</p>

<p align="center">
Simple • Asynchrone • Multi-destinations • TypeScript-first
</p>

---

## 🚀 Installation

```bash
npm install @lex0u/logger
```

---

## ⚡ Quick Start

```ts
import { Logger, LogLevel } from "@lex0u/logger";

const logger = new Logger({
    console: {
        enabled: true,
        minLevel: LogLevel.Debug,
    },
    file: {
        enabled: true,
        folderPath: "./logs",
    },
});

await logger.log(LogLevel.Information, "Serveur démarré", "App");
await logger.log(LogLevel.Error, "Connexion échouée", "DB", {
    host: "localhost",
});

// Sortie ciblée
await logger.log.console(LogLevel.Debug, "Debug uniquement console", "Auth");
await logger.log.file(LogLevel.Warning, "Warning uniquement fichier", "API");
```

---

## 💬 Intégration Discord

### Option A — Webhook (recommandé, aucun bot requis)

La méthode la plus simple : crée un webhook dans les paramètres d'un salon Discord
(**Paramètres du salon → Intégrations → Webhooks → Nouveau webhook**) et récupère son URL.

```ts
import { Logger, LogLevel } from "@lex0u/logger";

const logger = new Logger({
    console: { enabled: true },
    discord: {
        enabled: true,
        minLevel: LogLevel.Warning,
        destination: {
            webhookUrl: process.env.DISCORD_WEBHOOK_URL!,
        },
    },
});

await logger.log(LogLevel.Error, "Erreur critique !", "DB");
```

Aucun token, aucun client, aucun `setDiscordClient` — l'envoi est direct.

### Option B — Bot Discord (client requis)

```ts
import { Logger, LogLevel } from "@lex0u/logger";

const logger = new Logger({
    console: { enabled: true },
    discord: {
        enabled:     true,
        minLevel:    LogLevel.Warning,
        destination: {
            guildId: "...",
            channel: "..."
        },
    },
  },
});

await logger.log(LogLevel.Error, "Erreur critique !", "DB");
```

Aucun token, aucun client, aucun `setDiscordClient` — l'envoi est direct.

### Option B — Bot Discord (client requis)

```ts
import { Logger, LogLevel } from "@lex0u/logger";
import { Client, GatewayIntentBits } from "discord.js";

const logger = new Logger({
    console: { enabled: true },
    discord: {
        enabled: true,
        minLevel: LogLevel.Warning,
        destination: {
            guildId: "...",
            channel: "...",
        },
    },
});

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", () => {
    logger.setDiscordClient(client);
});

client.login(process.env.DISCORD_TOKEN);
```

### Option C — Intégration conditionnelle (bot, optionnelle selon l'environnement)

```ts
import { Logger, LogLevel } from "@lex0u/logger";
import { Client, GatewayIntentBits } from "discord.js";

const discordConfig: DiscordOutputConfig = {
    enabled: config.isProd && !!config.bot.logChannelId,
    minLevel: LogLevel.Error,
    destination: {
        guildId: config.bot.guildId ?? "",
        channel: config.bot.logChannelId ?? "",
    },
};

const loggerConfig: LoggerConfig = {
    console: {
        enabled: true,
        minLevel: config.isDev ? LogLevel.Debug : LogLevel.Information,
    },
    file: {
        enabled: true,
        folderPath: "./logs",
        minLevel: LogLevel.Information,
        groupByLevel: true,
        maxFileSize: 5_000_000,
        maxDays: config.isDev ? 7 : 30,
    },
    ...(config.bot.logChannelId && config.bot.guildId
        ? { discord: discordConfig }
        : {}),
};

const logger = new Logger(loggerConfig);
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", () => {
    logger.setDiscordClient(client);
});

client.login(process.env.DISCORD_TOKEN);
```

---

## 🧠 Log Levels

```ts
LogLevel.Debug;
LogLevel.Information;
LogLevel.Success;
LogLevel.Warning;
LogLevel.Error;
LogLevel.Fatal;
```

---

## ✨ Features

- ✅ Logs console
- ✅ Logs fichier
- ✅ Logs Discord (bot ou webhook)
- ✅ API asynchrone
- ✅ Support des métadonnées
- ✅ Niveau de log par destination
- ✅ Système de file d'attente pour Discord
- ✅ Entièrement typé (TypeScript)

---

## 🛠 Scripts

```bash
npm run build
npm run test
npm run dev
```

---

## 🤝 Contribution

Les contributions sont les bienvenues !

### Workflow

```bash
# Fork
git clone https://github.com/lex0u/logger.git

# Install
npm install

# Dev
npm run dev
```

### Guidelines

- Utiliser TypeScript strict
- Respecter l'architecture existante
- Commits clairs (`feat:`, `fix:`, `refactor:`)
- Pull Request descriptive

---

## 📦 Roadmap

- [ ] Rotation automatique des fichiers
- [ ] Format custom
- [ ] Logger middleware Express
- [ ] Benchmarks
- [ ] Sortie Slack / Telegram
- [ ] Filtrage par regex sur le message
- [ ] Mode silencieux global (kill switch)
- [ ] Export des logs en JSON/CSV
- [ ] Compression automatique des anciens logs (gzip)
- [ ] Hooks `onLog` pour brancher des traitements custom
- [ ] Rate limiting sur les sorties Discord (anti-spam)
- [ ] Support des transports custom (plugin system)

---

## 📄 Licence

MIT © 2026 Lex0u

---

## ⭐ Support

Si le projet t'aide, laisse une ⭐ sur GitHub !
