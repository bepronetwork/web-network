require("dotenv").config();

const dbSecured = process.env.NEXT_DB_SECURE === "true" || true;

module.exports = {
  dialect: process.env.NEXT_DB_DIALECT || "postgres",
  username: process.env.NEXT_DB_USERNAME || "github",
  password: process.env.NEXT_DB_PASSWORD || "github",
  database: process.env.NEXT_DB_DATABASE || "github",
  
  host: process.env.NEXT_DB_HOST || "localhost",
  port: +process.env.NEXT_DB_PORT || 54320,
  ...(process.env.NEXT_DB_HOST
    ? {
        dialectOptions: {
            ...dbSecured? {
            ssl: {
              required: true,
              rejectUnauthorized: false
            }
          }: {}
        }
    }
    : {})
};
