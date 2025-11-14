import database from "infra/database";

async function cleanDataBase() {
  await database.query("drop schema public cascade; create schema public;");
}

console.log(
  "Variaveis ambiente",
  process.env.POSTGRES_HOST,
  process.env.POSTGRES_PORT,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_DB,
  process.env.POSTGRES_PASSWORD,
);

beforeAll(cleanDataBase);

test("GET to /api/v1/migrations should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations");
  expect(response.status).toBe(200);

  const responseBody = await response.json();

  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBeGreaterThan(0);
});
