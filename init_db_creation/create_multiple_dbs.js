const protectedDatabases = new Set(["admin", "config", "local"]);
const databaseIndexes = Object.keys(process.env)
    .map((key) => /^DB_NAME_(\d+)$/.exec(key))
    .filter(Boolean)
    .map((match) => Number(match[1]))
    .sort((left, right) => left - right);

for (const index of databaseIndexes) {
    const databaseName = process.env[`DB_NAME_${index}`];
    const username = process.env[`DB_USER_${index}`] || "";
    const password = process.env[`DB_PASS_${index}`] || "";

    if (!databaseName) {
        console.warn(`[WARN] DB_NAME_${index} is empty. Skipping.`);
        continue;
    }
    if (protectedDatabases.has(databaseName)) {
        throw new Error(`Refusing to configure protected database "${databaseName}".`);
    }
    if (Boolean(username) !== Boolean(password)) {
        throw new Error(`DB_USER_${index} and DB_PASS_${index} must both be set or both be empty.`);
    }

    if (!username) {
        console.warn(
            `[WARN] No user configured for "${databaseName}". MongoDB creates the database on first write.`,
        );
        continue;
    }

    const targetDatabase = db.getSiblingDB(databaseName);
    if (targetDatabase.getUser(username)) {
        targetDatabase.updateUser(username, {
            pwd: password,
            roles: [{ role: "readWrite", db: databaseName }],
        });
        console.info(`[INFO] Updated user "${username}" for "${databaseName}".`);
    } else {
        targetDatabase.createUser({
            user: username,
            pwd: password,
            roles: [{ role: "readWrite", db: databaseName }],
        });
        console.info(`[INFO] Created user "${username}" for "${databaseName}".`);
    }
}
