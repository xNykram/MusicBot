import { sequelize } from '../db';

// Sequelize does not supports creating views, so we have to do a workaround //

async function vwTopStats() {
  await sequelize.query(`CREATE OR REPLACE VIEW "topStats" as SELECT message as Song, count (*) as Amount, server_name, server_id FROM \
     "log" WHERE task = 'play' GROUP BY music_id, message, server_name, server_id;`)
}

export { vwTopStats }
