import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Firebird from 'node-firebird';
import solicitacoesRoutes from "./routes/solicitacoes.routes";
import { AuthController } from "./controllers/auth.controller"; // Importe o controller
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/solicitacoes", solicitacoesRoutes);
app.use("/api/auth", authRoutes); // Use as rotas de autenticação

// Config Firebird
const dbConfig: Firebird.Options = {
  host: process.env.FB_HOST || 'localhost',
  port: Number(process.env.FB_PORT) || 3050,
  database: process.env.FB_DATABASE || '',
  user: process.env.FB_USER || 'SYSDBA',
  password: process.env.FB_PASSWORD || 'masterkey',
  lowercase_keys: false,
  role: null,
  pageSize: 4096
};

// Pool de conexões
const pool = Firebird.pool(10, dbConfig);

// Rota de teste simples
app.get('/api/ping', (_req, res) => {
  res.json({ ok: true, message: 'API online' });
});

// Rota de teste de conexão com o Firebird
app.get('/api/test-db', (_req, res) => {
  pool.get((err, db) => {
    if (err) {
      console.error('Erro ao conectar no Firebird:', err);
      return res.status(500).json({ ok: false, error: 'Erro de conexão com o banco' });
    }

    db.query('SELECT 1 AS TESTE FROM RDB$DATABASE', (queryErr, result) => {
      db.detach();

      if (queryErr) {
        console.error('Erro na query de teste:', queryErr);
        return res.status(500).json({ ok: false, error: 'Erro na query de teste' });
      }

      res.json({ ok: true, result });
    });
  });
});

app.get('/api/debug/tabelas', (_req, res) => {
  pool.get((err, db) => {
    if (err) {
      console.error('Erro ao conectar no Firebird:', err);
      return res.status(500).json({ ok: false, error: 'Erro de conexão com o banco' });
    }

    const sql = `
      SELECT TRIM(RDB$RELATION_NAME) AS TABELA
      FROM RDB$RELATIONS
      WHERE RDB$SYSTEM_FLAG = 0
        AND RDB$VIEW_BLR IS NULL
      ORDER BY RDB$RELATION_NAME
    `;

    // node-firebird espera (sql, params, callback)
    db.query(sql, [], (queryErr: any, result: any[]) => {
      db.detach();

      if (queryErr) {
        console.error('Erro ao listar tabelas:', queryErr);
        return res.status(500).json({ ok: false, error: 'Erro ao listar tabelas' });
      }

      console.log('Tabelas encontradas:', result);
      res.json({ ok: true, tabelas: result });
    });
  });
});

app.get('/api/debug/table/:nome', (_req, res) => {
  const tabela = _req.params.nome.toUpperCase();

  pool.get((err, db) => {
    if (err) return res.status(500).json({ error: err });

    const sql = `
      SELECT 
        TRIM(rf.RDB$FIELD_NAME) AS COLUNA,
        f.RDB$FIELD_TYPE,
        f.RDB$FIELD_LENGTH,
        rf.RDB$NULL_FLAG
      FROM RDB$RELATION_FIELDS rf
      JOIN RDB$FIELDS f ON f.RDB$FIELD_NAME = rf.RDB$FIELD_SOURCE
      WHERE rf.RDB$RELATION_NAME = ?
      ORDER BY rf.RDB$FIELD_POSITION
    `;

    db.query(sql, [tabela], (e, result) => {
      db.detach();
      if (e) return res.status(500).json({ error: e });

      res.json({ tabela, colunas: result });
    });
  });
});

app.get('/api/debug/solicitacoes/colunas', (_req, res) => {
  pool.get((err, db) => {
    if (err) {
      console.error('Erro ao conectar no Firebird:', err);
      return res.status(500).json({ ok: false, error: 'Erro de conexão' });
    }

    const sql = `
      SELECT 
        TRIM(rf.RDB$FIELD_NAME) AS COLUNA,
        TRIM(f.RDB$FIELD_TYPE) AS TIPO,
        f.RDB$FIELD_LENGTH AS TAMANHO,
        f.RDB$NULL_FLAG AS NOT_NULL
      FROM RDB$RELATION_FIELDS rf
      JOIN RDB$FIELDS f ON rf.RDB$FIELD_SOURCE = f.RDB$FIELD_NAME
      WHERE rf.RDB$RELATION_NAME = 'SOLICITACOES'
      ORDER BY rf.RDB$FIELD_POSITION
    `;

    db.query(sql, [], (queryErr: any, result: any[]) => {
      db.detach();

      if (queryErr) {
        console.error('Erro ao listar colunas:', queryErr);
        return res.status(500).json({ ok: false, error: 'Erro na query' });
      }

      res.json({ ok: true, colunas: result });
    });
  });
});


const port = Number(process.env.API_PORT) || 3001;

app.get('/', (req, res) => {
  res.send('API de Manutenção Rodando! 🚀 Acesse o front-end em localhost:3000');
});

// Rota de Instalação Automática da Tabela
app.get('/api/setup/criar-tabela', (req, res) => {
  pool.get((err, db) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro de conexão com o Firebird', detalhes: err });
    }

    const sql = `
      CREATE TABLE SOLICITACOES (
        ID VARCHAR(36) NOT NULL PRIMARY KEY,
        OPERADOR_ID VARCHAR(50),
        OPERADOR_NOME VARCHAR(100),
        SETOR VARCHAR(50),
        MAQUINA VARCHAR(100),
        DESCRICAO BLOB SUB_TYPE TEXT,
        STATUS VARCHAR(20),
        PRIORIDADE VARCHAR(1),
        TIPO_SERVICO VARCHAR(50),
        DATA_CRIACAO TIMESTAMP,
        DATA_ATUALIZACAO TIMESTAMP,
        OBSERVACOES BLOB SUB_TYPE TEXT
      )
    `;

    db.query(sql, [], (e) => {
      db.detach();
      if (e) {
        // Se der erro, provavelmente é porque já existe (o que é bom!)
        return res.json({ 
          status: 'Aviso', 
          mensagem: 'Provavelmente a tabela já existe ou houve um erro.',
          erro_banco: e.message 
        });
      }
      res.json({ status: 'Sucesso', mensagem: 'Tabela SOLICITACOES criada com sucesso!' });
    });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
