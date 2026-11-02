# Standalone MongoDB container

## Setup

Create the secrets file and replace the example values:

```bash
cp ./init_db_creation/.env.db_secrets.example ./init_db_creation/.env.db_secrets
```

Make the scripts executable:

```bash
chmod +x ./entrypoint.sh ./init_db_creation/*.sh
```

Create the external Docker network if it does not exist yet:

```bash
docker network create vps_microservices
```

## Usage

Start MongoDB:

```bash
docker compose up -d
```

The configured database users are created or updated each time the container
starts. MongoDB databases become persistent when they contain data or users;
configured databases without a user are created on the first application write.

The service is available to the host on `127.0.0.1:27017` and to containers on
the `vps_microservices` network as `mongodb:27017`. The root account authenticates
against the `admin` database.

### Development cleanup

The scripts are also available inside the container:

```bash
docker exec mongodb /usr/local/bin/db-scripts/empty_dbs.sh
docker exec mongodb /usr/local/bin/db-scripts/truncate_db_collections.sh
```

`empty_dbs.sh` drops each configured application database and recreates its
configured user. `truncate_db_collections.sh` removes documents from every
collection in `TARGET_DB` except names listed in the comma-separated
`WHITELIST_COLLECTIONS`; indexes are retained.

### Clean install

To remove the stored MongoDB data, stop the container and remove its volume:

```bash
docker compose down
docker volume rm standalone-mongodb-container_mongo_data
```
