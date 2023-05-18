require("dotenv").config();

module.exports = {
  dialect: process.env.NEXT_DB_DIALECT || "postgres",
  username: process.env.NEXT_DB_USERNAME || "github",
  password: process.env.NEXT_DB_PASSWORD || "github",
  database: process.env.NEXT_DB_DATABASE || "github",

  host: process.env.NEXT_DB_HOST || "localhost",
  port: +process.env.NEXT_DB_PORT || 54320,
  ... (process.env.NEXT_DB_LOG === "true" ? {
    logging: (sql) => { console.log(sql) },
  } : {
    logging: false
  }),

  ...(process.env.NEXT_DB_SSL === "true"
    ? {
      dialectOptions: {

        ssl: {
          required: true,
          rejectUnauthorized: false
        }
      }
    }
    : {})
};
