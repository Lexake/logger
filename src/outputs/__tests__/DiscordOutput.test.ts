import { describe, it, expect, vi } from "vitest";
import { DiscordOutput } from "../DiscordOutput";
import { LogLevel } from "../../types";

describe("DiscordOutput", () => {
    it("devrait mettre les logs en file d'attente si le client n'est pas prêt", async () => {
        const mockClient = {
            isReady: vi.fn(() => false), // Transformé en spy avec vi.fn()
            once: vi.fn(),
        };

        const discordOutput = new DiscordOutput(
            { enabled: true, destination: { guildId: "123", channel: "456" } },
            mockClient as any,
        );

        await discordOutput.log({
            level: LogLevel.Information,
            message: "Test de file d'attente",
        });

        expect(mockClient.isReady).toHaveBeenCalled();
    });

    it("devrait respecter la configuration minLevel", async () => {
        const discordOutput = new DiscordOutput({
            enabled: true,
            minLevel: LogLevel.Warning,
            destination: {
                webhookUrl: "https://discord.com/api/webhooks/test",
            },
        });

        const globalFetch = vi.fn().mockResolvedValue({ ok: true });
        vi.stubGlobal("fetch", globalFetch);

        await discordOutput.log({
            level: LogLevel.Information,
            message: "Message ignoré",
        });

        expect(globalFetch).not.toHaveBeenCalled();
        vi.unstubAllGlobals();
    });
});
