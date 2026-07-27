import { describe, it, expect, vi } from "vitest";
import { Logger } from "./Logger";
import { LogLevel } from "./types";

describe("Logger", () => {
  it("devrait initialiser correctement les sorties selon la configuration", () => {
    const logger = new Logger({
      console: { enabled: true },
    });
    expect(logger).toBeDefined();
    expect(logger.log).toBeDefined();
  });

  it("devrait gérer en toute sécurité les sorties non configurées sans lever d'erreur", async () => {
    const logger = new Logger({
      console: { enabled: false },
    });

    // Ne doit pas lancer d'erreur même si la sortie console est désactivée
    await expect(
      logger.log(LogLevel.Information, "Message de test"),
    ).resolves.not.toThrow();
  });
});
