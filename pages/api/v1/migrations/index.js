import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
  const methodsAllowed = ["GET", "POST"];

  if (!methodsAllowed.includes(request.method)) {
    return response
      .status(405)
      .json({ error: `Método ${request.method} não aceito.` });
  }

  const dbClient = await database.getNewClient();
  const defaultMigrationOptions = {
    dbClient: dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  try {
    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions);
      return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });

      if (migratedMigrations.length > 0) {
        return response.status(201).json(migratedMigrations);
      }

      return response.status(200).json(migratedMigrations);
    }
  } catch (error) {
    throw error;
  } finally {
    await dbClient.end();
  }
}
