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
import { Logger, LogLevel } from '@lex0u/logger';

const logger = new Logger({
    console: {
        enabled:  true,
        minLevel: LogLevel.Debug,
    },
    file: {
        enabled:    true,
        folderPath: './logs',
    },
});

await logger.log(LogLevel.Information, "Serveur démarré", "App");
await logger.log(LogLevel.Error, "Connexion échouée", "DB", { host: "localhost" });

// Sortie ciblée
await logger.log.console(LogLevel.Debug, "Debug uniquement console", "Auth");
await logger.log.file(LogLevel.Warning, "Warning uniquement fichier", "API");
```

---

## 💬 Intégration Discord

```ts
import { Logger, LogLevel } from '@lex0u/logger';
import { Client, GatewayIntentBits } from 'discord.js';

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
});

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", () => {
    logger.setDiscordClient(client);
});

client.login(process.env.DISCORD_TOKEN);
```
## 💬 Intégration Discord Optionnel

```ts
import { Logger, LogLevel } from '@lex0u/logger';
import { Client, GatewayIntentBits } from 'discord.js';

const discordConfig: DiscordOutputConfig = {
    enabled:     config.isProd && !!config.bot.logChannelId,
    minLevel:    LogLevel.Error,
    destination: {
        guildId: config.bot.guildId  ?? '',
        channel: config.bot.logChannelId ?? '',
    },
};

const loggerConfig: LoggerConfig = {
    console: {
        enabled:  true,
        minLevel: config.isDev ? LogLevel.Debug : LogLevel.Information,
    },
    file: {
        enabled:      true,
        folderPath:   './logs',
        minLevel:     LogLevel.Information,
        groupByLevel: true,
        maxFileSize:  5_000_000,
        maxDays:      config.isDev ? 7 : 30,
    },
    ...(config.bot.logChannelId && config.bot.guildId ? { discord: discordConfig } : {}),
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
LogLevel.Debug
LogLevel.Information
LogLevel.Warning
LogLevel.Error
```

---

## ✨ Features

- ✅ Console logging
- ✅ File logging
- ✅ Discord logging
- ✅ Async API
- ✅ Metadata support
- ✅ Per-destination log level
- ✅ Queue system for Discord
- ✅ Fully typed (TypeScript)

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
- Respecter l’architecture existante
- Commits clairs (`feat:`, `fix:`, `refactor:`)
- Pull Request descriptive

---

## 📦 Roadmap

- [ ] Rotation automatique des fichiers
- [ ] Format custom
- [ ] Webhook support
- [ ] Logger middleware Express
- [ ] Benchmarks

---

## 📄 Licence

MIT © 2026 Lex0u

---

## ⭐ Support

Si le projet t’aide, laisse une ⭐ sur GitHub !

