const protectedDatabases = new Set(["admin", "config", "local"]);
const databaseIndexes = Object.keys(process.env)
    .map((key) => /^DB_NAME_(\d+)$/.exec(key))
    .filter(Boolean)
    .map((match) => Number(match[1]))
    .sort((left, right) => left - right);

for (const index of databaseIndexes) {
    const databaseName = process.env[`DB_NAME_${index}`];
    if (!databaseName) {
        console.warn(`[WARN] DB_NAME_${index} is empty. Skipping.`);
        continue;
    }
    if (protectedDatabases.has(databaseName)) {
        throw new Error(`Refusing to drop protected database "${databaseName}".`);
    }

    const result = db.getSiblingDB(databaseName).dropDatabase();
    if (result.ok !== 1) {
        throw new Error(`Failed to drop database "${databaseName}".`);
    }
    console.info(`[INFO] Dropped "${databaseName}" (ok: ${result.ok === 1}).`);
}

load("/usr/local/bin/db-scripts/create_multiple_dbs.js");
