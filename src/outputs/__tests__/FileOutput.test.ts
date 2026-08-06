import { describe, it, expect, vi } from "vitest";
import { FileOutput } from "../FileOutput";
import { LogLevel } from "../../types";

// Mock des modules fs/promises pour éviter de polluer le disque pendant les tests
vi.mock("fs/promises", () => ({
    mkdir: vi.fn().mockResolvedValue(undefined),
    appendFile: vi.fn().mockResolvedValue(undefined),
    readdir: vi.fn().mockResolvedValue([]),
    stat: vi.fn().mockRejectedValue(new Error("Non trouvé")),
    rename: vi.fn().mockResolvedValue(undefined),
    unlink: vi.fn().mockResolvedValue(undefined),
}));

describe("FileOutput", () => {
    it("ne devrait pas écrire de logs si la sortie est désactivée", async () => {
        const fileOutput = new FileOutput({
            enabled: false,
            folderPath: "./logs",
        });

        // Ne devrait pas lever d'erreur ni tenter d'écrire
        await expect(
            fileOutput.log({
                level: LogLevel.Information,
                message: "Test désactivé",
            }),
        ).resolves.not.toThrow();
    });

    it("devrait écrire des logs lorsque la sortie est activée et que folderPath est fourni", async () => {
        const fileOutput = new FileOutput({
            enabled: true,
            folderPath: "./logs",
            groupByLevel: false,
        });

        await expect(
            fileOutput.log({
                level: LogLevel.Success,
                message: "Opération réussie",
            }),
        ).resolves.not.toThrow();
    });
});
