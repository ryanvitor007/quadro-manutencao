import Firebird from "node-firebird";
import dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';


dotenv.config();

const dbConfig: Firebird.Options = {
  host: process.env.FB_HOST!,
  port: Number(process.env.FB_PORT!),
  database: process.env.FB_DATABASE!,
  user: process.env.FB_USER!,
  password: process.env.FB_PASSWORD!,
};

const pool = Firebird.pool(10, dbConfig);

export const SolicitacoesService = {
  getAll(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      pool.get((err, db) => {
        if (err) return reject(err);

        const sql = `SELECT * FROM SOLICITACOES`;

        db.query(sql, [], (e, result) => {
          db.detach();
          if (e) return reject(e);
          resolve(result);
        });
      });
    });
  },

  getById(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      pool.get((err, db) => {
        if (err) return reject(err);

        const sql = `SELECT * FROM SOLICITACOES WHERE ID = ?`;

        db.query(sql, [id], (e, result) => {
          db.detach();
          if (e) return reject(e);
          resolve(result[0] || null);
        });
      });
    });
  },

  create(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    pool.get((err, db) => {
      if (err) return reject(err);

      const novoId = uuidv4();
      const agora = new Date(); // <-- DATA_CRIACAO automática

      const sql = `
        INSERT INTO SOLICITACOES (
          ID,
          OPERADOR_ID,
          OPERADOR_NOME,
          SETOR,
          MAQUINA,
          DESCRICAO,
          STATUS,
          PRIORIDADE,
          DATA_CRIACAO,
          DATA_ATUALIZACAO
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        novoId,
        data.OPERADOR_ID,
        data.OPERADOR_NOME,
        data.SETOR,
        data.MAQUINA,
        data.DESCRICAO,
        data.STATUS,
        data.PRIORIDADE,
        agora,             // <-- DATA_CRIACAO automático
        data.DATA_ATUALIZACAO // ainda vem do frontend
      ];

      db.query(sql, params, (e) => {
        db.detach();
        if (e) return reject(e);

        resolve({
          ok: true,
          id_gerado: novoId,
          data_criacao: agora
        });
      });
    });
  });
},

  update(id: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      pool.get((err, db) => {
        if (err) return reject(err);

        const sql = `
          UPDATE SOLICITACOES SET
            ID_DO_OPERADOR = ?,
            NOME_DO_OPERADOR = ?,
            SETOR = ?,
            MÁQUINA = ?,
            DESCRIÇÃO = ?,
            STATUS = ?,
            PRIORIDADE = ?,
            ATUALIZAÇÃO_DE_DADOS = ?
          WHERE ID = ?
        `;

        const params = [
          data.ID_DO_OPERADOR,
          data.NOME_DO_OPERADOR,
          data.SETOR,
          data.MAQUINA,
          data.DESCRICAO,
          data.STATUS,
          data.PRIORIDADE,
          data.ATUALIZACAO_DE_DADOS,
          id,
        ];

        db.query(sql, params, (e, result) => {
          db.detach();
          if (e) return reject(e);
          resolve({ ok: true });
        });
      });
    });
  },

  delete(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      pool.get((err, db) => {
        if (err) return reject(err);

        const sql = `DELETE FROM SOLICITACOES WHERE ID = ?`;

        db.query(sql, [id], (e, result) => {
          db.detach();
          if (e) return reject(e);
          resolve({ ok: true });
        });
      });
    });
  },
};
