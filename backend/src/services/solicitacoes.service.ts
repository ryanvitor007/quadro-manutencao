// backend/src/services/solicitacoes.service.ts

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

// --- HELPER PARA LER O BLOB (FUNÇÃO OU BUFFER) ---
const lerBlob = (valor: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 1. Se for nulo ou undefined, retorna string vazia
    if (!valor) return resolve("");

    // 2. Se já for Buffer (configurações específicas), converte direto
    if (Buffer.isBuffer(valor)) {
      return resolve(valor.toString("utf-8"));
    }

    // 3. Se for String, retorna a própria string
    if (typeof valor === "string") {
      return resolve(valor);
    }

    // 4. Se for FUNÇÃO (O caso que está a acontecer!), executa para ler o Stream
    if (typeof valor === "function") {
      valor((err: any, name: any, eventEmitter: any) => {
        if (err) return resolve(""); // Em caso de erro, retorna vazio para não quebrar

        let chunks: Buffer[] = [];
        eventEmitter.on("data", (chunk: any) => {
          chunks.push(chunk);
        });

        eventEmitter.on("end", () => {
          const bufferCompleto = Buffer.concat(chunks);
          resolve(bufferCompleto.toString("utf-8"));
        });

        eventEmitter.on("error", (err: any) => {
          console.error("Erro ao ler BLOB:", err);
          resolve("");
        });
      });
      return;
    }

    // 5. Fallback
    resolve(String(valor));
  });
};
// ------------------------------------------------

export const SolicitacoesService = {
  getAll(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      pool.get((err, db) => {
        if (err) return reject(err);

        const sql = `SELECT * FROM SOLICITACOES ORDER BY DATA_CRIACAO DESC`;

        db.query(sql, [], async (e, result) => {
          db.detach();
          if (e) return reject(e);

          try {
            // Processamos todas as linhas de forma assíncrona
            // para dar tempo de ler os BLOBs (funções)
            const dadosTratados = await Promise.all(
              result.map(async (row: any) => {
                // Tenta ler DESCRICAO (Maiúsculo ou Minúsculo)
                const descRaw =
                  row.DESCRICAO !== undefined ? row.DESCRICAO : row.descricao;
                const obsRaw =
                  row.OBSERVACOES !== undefined
                    ? row.OBSERVACOES
                    : row.observacoes;

                const descricaoTexto = await lerBlob(descRaw);
                const observacoesTexto = await lerBlob(obsRaw);

                return {
                  ...row,
                  // Forçamos o retorno em campos padronizados para o front
                  DESCRICAO: descricaoTexto,
                  OBSERVACOES: observacoesTexto,
                  descricao: descricaoTexto,
                  observacoes: observacoesTexto,
                  criadoPorQr: row.CRIADO_POR_QR === 1,
                  responsavelTecnico: row.RESPONSAVEL_TECNICO,
                };
              })
            );

            // Debug para confirmar se funcionou
            if (dadosTratados.length > 0) {
              console.log("DEBUG - 1ª Linha Processada:", {
                ID: dadosTratados[0].ID,
                DESCRICAO: dadosTratados[0].DESCRICAO?.substring(0, 20) + "...", // Mostra só o início
              });
            }

            resolve(dadosTratados);
          } catch (processErr) {
            reject(processErr);
          }
        });
      });
    });
  },

  getById(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      pool.get((err, db) => {
        if (err) return reject(err);

        const sql = `SELECT * FROM SOLICITACOES WHERE ID = ?`;

        db.query(sql, [id], async (e, result) => {
          db.detach();
          if (e) return reject(e);

          if (!result[0]) return resolve(null);

          const row = result[0];
          const descRaw =
            row.DESCRICAO !== undefined ? row.DESCRICAO : row.descricao;
          const obsRaw =
            row.OBSERVACOES !== undefined ? row.OBSERVACOES : row.observacoes;

          const descricaoTexto = await lerBlob(descRaw);
          const observacoesTexto = await lerBlob(obsRaw);

          resolve({
            ...row,
            DESCRICAO: descricaoTexto,
            OBSERVACOES: observacoesTexto,
            descricao: descricaoTexto,
            observacoes: observacoesTexto,
            criadoPorQr: row.CRIADO_POR_QR === 1,
            responsavelTecnico: row.RESPONSAVEL_TECNICO
          });
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
            ID, OPERADOR_ID, OPERADOR_NOME, SETOR, MAQUINA,
            DESCRICAO, STATUS, PRIORIDADE, TIPO_SERVICO,
            DATA_CRIACAO, DATA_ATUALIZACAO, OBSERVACOES,
            CRIADO_POR_QR, RESPONSAVEL_TECNICO
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
          novoId,
          data.operadorId,
          data.operadorNome,
          data.setor,
          data.maquina,
          data.descricao,
          data.status || "pendente",
          data.prioridade || "C",
          data.tipoServico || "Mecânica",
          agora,
          null,
          data.observacoes || "",
          data.criadoPorQr ? 1 : 0, 
          data.responsavelTecnico || null
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
        const sql = `UPDATE SOLICITACOES SET STATUS = ?, DATA_ATUALIZACAO = ?, OBSERVACOES = ? WHERE ID = ?`;
        db.query(sql, [data.status, agora, data.observacoes, id], (e) => {
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
