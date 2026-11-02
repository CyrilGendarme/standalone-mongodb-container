const protectedDatabases = new Set(["admin", "config", "local"]);
const databaseName = process.env.TARGET_DB;

if (!databaseName) {
    throw new Error("TARGET_DB must be defined.");
}
if (protectedDatabases.has(databaseName)) {
    throw new Error(`Refusing to truncate protected database "${databaseName}".`);
}

const excludedCollections = new Set(
    (process.env.WHITELIST_COLLECTIONS || "")
        .split(",")
        .map((collectionName) => collectionName.trim())
        .filter(Boolean),
);
const targetDatabase = db.getSiblingDB(databaseName);
const collections = targetDatabase.getCollectionInfos();
let truncatedCount = 0;

for (const collection of collections) {
    if (
        collection.type !== "collection" ||
        collection.name.startsWith("system.") ||
        excludedCollections.has(collection.name)
    ) {
        continue;
    }

    const result = targetDatabase.getCollection(collection.name).deleteMany({});
    truncatedCount += 1;
    console.info(`[INFO] Removed ${result.deletedCount} document(s) from "${collection.name}".`);
}

if (truncatedCount === 0) {
    console.info(`[INFO] No collections to truncate in "${databaseName}".`);
} else {
    console.info(`[INFO] Truncation complete for "${databaseName}".`);
}
