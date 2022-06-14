const { Sequelize } = require('sequelize');

const { PGUSER, PGPASSWORD, PGDATABASE, PGHOST } = process.env

const sequelize = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
    host: PGHOST,
    dialect: 'postgres',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
      application_name: 'postgres',
      useUTC: false,
      dateFirst: 1,
    },
    schema: 'public',
    define: {
      timestamps: false
    },
  });

(async () => {await sequelize.sync()})();

export { sequelize };
