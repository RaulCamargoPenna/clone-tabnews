import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const dataBaseInfo = await database.query("SHOW server_version;");
  const dataBaseVersion = dataBaseInfo.rows[0].server_version;

  const maxConnectionsInfo = await database.query("SHOW max_connections;");
  const maxConnections = parseInt(maxConnectionsInfo.rows[0].max_connections);

  const connectionsInfo = await database.query({
    text: `SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;`,
    values: [process.env.POSTGRES_DB],
  });
  const activeConnections = connectionsInfo.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: dataBaseVersion,
        max_connections: maxConnections,
        opened_connections: activeConnections,
      },
    },
  });
}

export default status;
