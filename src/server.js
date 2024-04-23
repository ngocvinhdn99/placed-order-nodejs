require("dotenv").config();
const app = require("./app");
const { MongoClient } = require("mongodb");

const { PORT, MONGO_URL, DB_NAME } = process.env;

async function main() {
  // Connection URL
  const client = new MongoClient(MONGO_URL);

  await client.connect();
  console.log("Connected successfully to DB server");
  db = client.db(DB_NAME);
  app.locals.db = db;

  return "done.";
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  main();
});
