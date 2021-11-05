module.exports = {
  dialect: process.env.DB_DIALECT || 'postgres',
  username: process.env.DB_USERNAME || 'github',
  password: process.env.DB_PASSWORD || 'github',
  database: process.env.DB_DATABASE || 'github',
  host: process.env.DB_HOST || 'localhost',
  port: +process.env.DB_PORT || 54320
}
