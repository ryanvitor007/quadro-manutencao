// backend/src/services/maquinas.service.ts
import Firebird from "node-firebird";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const dbConfig: Firebird.Options = {
  host: process.env.FB_HOST || "localhost",
  port: Number(process.env.FB_PORT) || 3050,
  database: process.env.FB_DATABASE!,
  user: process.env.FB_USER || "SYSDBA",
  password: process.env.FB_PASSWORD || "masterkey",
  lowercase_keys: false,
  role: undefined as unknown as string,
  pageSize: 4096,
};

const pool = Firebird.pool(10, dbConfig);

export const MaquinasService = {
  // Buscar máquina pelo Código do QR Code
  getByCodigo(codigo: string): Promise<any> {
    return new Promise((resolve, reject) => {
      pool.get((err, db) => {
        if (err) return reject(err);

        // Busca exata pelo código
        const sql = `SELECT * FROM MAQUINAS WHERE CODIGO = ?`;

        db.query(sql, [codigo], (e, result) => {
          db.detach();
          if (e) return reject(e);
          resolve(result[0] || null); // Retorna a máquina ou null se não achar
        });
      });
    });
  },

  // Listar todas (para gerar os QRs)
  getAll(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      pool.get((err, db) => {
        if (err) return reject(err);
        db.query("SELECT * FROM MAQUINAS ORDER BY NOME", [], (e, result) => {
          db.detach();
          if (e) return reject(e);
          resolve(result);
        });
      });
    });
  },

  // Criar nova máquina
  create(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      pool.get((err, db) => {
        if (err) return reject(err);

        const id = uuidv4();
        const sql = `INSERT INTO MAQUINAS (ID, NOME, SETOR, CODIGO, RESPONSAVEL_TECNICO) VALUES (?, ?, ?, ?, ?)`;
        
        db.query(sql, [id, data.nome, data.setor, data.codigo, data.responsavel], (e) => {
          db.detach();
          if (e) return reject(e);
          resolve({ ok: true, id });
        });
      });
    });
  }
};