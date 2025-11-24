import Firebird from "node-firebird";
import dotenv from "dotenv";

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

export const AuthService = {
  login(tipo: string, login: string, senha?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      pool.get((err, db) => {
        if (err) return reject(err);

        let sql = "";
        let params: any[] = [];

        if (tipo === "operador") {
          // Operador loga apenas com a matrícula (LOGIN_MATRICULA)
          sql = `SELECT * FROM USUARIOS WHERE TIPO = 'OPERADOR' AND LOGIN_MATRICULA = ?`;
          params = [login];
        } else {
          // Encarregado precisa de usuário E senha
          sql = `SELECT * FROM USUARIOS WHERE TIPO = 'ENCARREGADO' AND LOGIN_MATRICULA = ? AND SENHA = ?`;
          params = [login, senha];
        }

        db.query(sql, params, (e, result) => {
          db.detach();
          if (e) return reject(e);

          if (result.length > 0) {
            // Usuário encontrado! Retorna os dados dele
            resolve({ ok: true, user: result[0] });
          } else {
            // Usuário não encontrado ou senha errada
            resolve({ ok: false, message: "Credenciais inválidas" });
          }
        });
      });
    });
  }
};