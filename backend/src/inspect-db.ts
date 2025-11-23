import Firebird from 'node-firebird';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: Firebird.Options = {
  host: 'localhost',
  port: 3050,
  database: process.env.FB_DATABASE,
  user: 'SYSDBA',
  password: 'masterkey'
};

Firebird.attach(dbConfig, (err, db) => {
  if (err) throw err;

  const sql = `
    SELECT TRIM(RDB$RELATION_NAME) AS TABELA
    FROM RDB$RELATIONS
    WHERE RDB$SYSTEM_FLAG = 0 AND RDB$VIEW_BLR IS NULL
  `;

  db.query(sql, (err2, result) => {
    if (err2) throw err2;

    console.log('Tabelas encontradas:');
    console.table(result);

    db.detach();
  });
});
