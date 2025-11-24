import Firebird from "node-firebird";
import dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const dbConfig: Firebird.Options = {
  host: process.env.FB_HOST || 'localhost',
  port: Number(process.env.FB_PORT) || 3050,
  database: process.env.FB_DATABASE!,
  user: process.env.FB_USER || 'SYSDBA',
  password: process.env.FB_PASSWORD || 'masterkey',
  lowercase_keys: false,
  role: undefined,
  pageSize: 4096
};

const pool = Firebird.pool(10, dbConfig);

export const SolicitacoesService = {
  getAll(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      pool.get((err, db) => {
        if (err) return reject(err);
        // Ordena por Data de Criação (mais recentes primeiro)
        const sql = `SELECT * FROM SOLICITACOES ORDER BY DATA_CRIACAO DESC`;
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
        const agora = new Date();

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
            TIPO_SERVICO,
            DATA_CRIACAO,
            DATA_ATUALIZACAO,
            OBSERVACOES
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
          novoId,
          data.operadorId,
          data.operadorNome,
          data.setor,
          data.maquina,
          data.descricao,
          data.status || 'pendente',
          data.prioridade || 'C',
          data.tipoServico || 'Mecânica',
          agora,
          null,
          data.observacoes || ''
        ];

        db.query(sql, params, (e) => {
          db.detach();
          if (e) return reject(e);
          resolve({ ok: true, id: novoId });
        });
      });
    });
  },

  update(id: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      pool.get((err, db) => {
        if (err) return reject(err);

        const agora = new Date();
        const sql = `
          UPDATE SOLICITACOES SET
            STATUS = ?,
            DATA_ATUALIZACAO = ?,
            OBSERVACOES = ?
          WHERE ID = ?
        `;

        const params = [
          data.status,
          agora,
          data.observacoes,
          id,
        ];

        db.query(sql, params, (e) => {
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
        db.query(sql, [id], (e) => {
          db.detach();
          if (e) return reject(e);
          resolve({ ok: true });
        });
      });
    });
  },
};