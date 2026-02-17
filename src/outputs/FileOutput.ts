
import { appendFile, mkdir, readdir, rename, stat, unlink } from "fs/promises";
import { join, parse } from "path";
import { FileOutputConfig, ILogOutput, LogLevel, LogPayload } from "../types";

const DEFAULT_MAX_FILE_SIZE  = 5 * 1024 * 1024; // 5 MB
const DEFAULT_RETENTION_DAYS = 14;

export class FileOutput implements ILogOutput {
    private config: FileOutputConfig;

    constructor(config: FileOutputConfig) {
        this.config = {
            groupByLevel: true,
            ...config,
        };
    }

    async log({ level, message, tag, infos }: LogPayload): Promise<void> {
        if (!this.config.enabled || !this.config.folderPath) return;
        if (this.config.minLevel !== undefined && level < this.config.minLevel) return;
        if (tag && this.config.allowTags && !this.config.allowTags.includes(tag)) return;

        const date   = new Date();
        const logDir = this.getLogDirectory(level);

        await mkdir(logDir, { recursive: true });

        const fileName = `${date.toISOString().split("T")[0]}.log`;
        const filePath = join(logDir, fileName);

        if (await this.shouldRotate(filePath)) {
            await this.rotateFile(filePath);
        }

        const logLine = this.formatLogLine(level, message, tag, infos, date);
        await appendFile(filePath, logLine + "\n");
        await this.cleanOldLogs(logDir);
    }

    // ─────────────────────────────────────────────
    //  Helpers privés
    // ─────────────────────────────────────────────

    private getLogDirectory(level: LogLevel): string {
        const base = this.config.folderPath;
        return this.config.groupByLevel
            ? join(base, LogLevel[level].toLowerCase())
            : base;
    }

    private async shouldRotate(filePath: string): Promise<boolean> {
        const maxSize = this.config.maxFileSize ?? DEFAULT_MAX_FILE_SIZE;
        try {
            const { size } = await stat(filePath);
            return size > maxSize;
        } catch {
            return false; // Fichier n'existe pas encore
        }
    }

    private async rotateFile(filePath: string): Promise<void> {
        const { dir, name, ext } = parse(filePath);
        const files    = await readdir(dir);
        const regex    = new RegExp(`^${name}_(\\d+)\\${ext}$`);

        const indices = files
            .map(f => f.match(regex))
            .filter(Boolean)
            .map(m => parseInt(m![1]!, 10));

        const nextIndex  = indices.length > 0 ? Math.max(...indices) + 1 : 1;
        const rotatedPath = join(dir, `${name}_${nextIndex}${ext}`);

        try {
            await rename(filePath, rotatedPath);
        } catch (err) {
            console.error(`[Logger:File] Échec de la rotation de ${filePath} :`, err);
        }
    }

    private async cleanOldLogs(directory: string): Promise<void> {
        const retention = this.config.maxDays ?? DEFAULT_RETENTION_DAYS;
        const now       = Date.now();

        let files: string[];
        try {
            files = await readdir(directory);
        } catch {
            return;
        }

        for (const file of files) {
            const filePath = join(directory, file);
            try {
                const { mtimeMs } = await stat(filePath);
                const ageDays = (now - mtimeMs) / (1000 * 60 * 60 * 24);
                if (ageDays > retention) await unlink(filePath);
            } catch { /* ignore */ }
        }
    }

    private formatLogLine(
        level:   LogLevel,
        message: string,
        tag?:    string,
        infos:   Record<string, unknown> | null = null,
        date     = new Date()
    ): string {
        const sep      = "─".repeat(100);
        const header   = `[${LogLevel[level].toUpperCase()} | ${date.toISOString()}]`;
        const tagLine  = tag ? `Tag     : ${tag}\n` : "";
        const infoBlock = infos && Object.keys(infos).length
            ? `Infos   :\n${JSON.stringify(infos, null, 2)}\n`
            : "";

        return `${sep}\n${header}\n${tagLine}Message : ${message}\n${infoBlock}${sep}`;
    }
}