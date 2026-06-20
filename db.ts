import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcrypt';
import pg from 'pg';
import { AsyncLocalStorage } from 'node:async_hooks';

const transactionStorage = new AsyncLocalStorage<pg.PoolClient>();
const sqliteTxStorage = new AsyncLocalStorage<boolean>();

class SimpleLock {
  private promise: Promise<void> = Promise.resolve();

  async acquire<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.promise.then(() => fn());
    this.promise = next.then(
      () => {},
      () => {}
    );
    return next;
  }
}

const sqliteLock = new SimpleLock();

// Helper function to translate SQLite questions (?) to PG placeholders ($1, $2, ...) and syntax
function convertQuery(sql: string): string {
  let paramCount = 1;
  let result = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    if (char === "'" || char === '"' || char === '`') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (stringChar === char) {
        if (sql[i - 1] !== '\\') {
          inString = false;
        }
      }
      result += char;
    } else if (char === '?' && !inString) {
      result += `$${paramCount++}`;
    } else {
      result += char;
    }
  }

  // Replace sqlite-specific keywords
  result = result.replace(/INSERT OR IGNORE INTO/gi, 'INSERT INTO');
  return result;
}

export interface DBWrapper {
  exec(sql: string): Promise<void>;
  prepare(sql: string): {
    get(...params: any[]): Promise<any>;
    all(...params: any[]): Promise<any[]>;
    run(...params: any[]): Promise<{ lastInsertRowid: any; changes: number }>;
  };
  transaction(fn: (...args: any[]) => any): (...args: any[]) => Promise<any>;
}

class PostgresAdapter implements DBWrapper {
  private pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new pg.Pool({
      connectionString,
      ssl: connectionString.includes('supabase') || connectionString.includes('neon') || connectionString.includes('render')
        ? { rejectUnauthorized: false }
        : false,
    });
  }

  async exec(sql: string): Promise<void> {
    await this.pool.query(sql);
  }

  prepare(sql: string) {
    return {
      get: async (...params: any[]) => {
        const pgSql = convertQuery(sql);
        const client = transactionStorage.getStore() || this.pool;
        const res = await client.query(pgSql, params);
        return res.rows[0];
      },
      all: async (...params: any[]) => {
        const pgSql = convertQuery(sql);
        const client = transactionStorage.getStore() || this.pool;
        const res = await client.query(pgSql, params);
        return res.rows;
      },
      run: async (...params: any[]) => {
        let pgSql = convertQuery(sql);
        if (pgSql.toLowerCase().startsWith('insert into') && !pgSql.toLowerCase().includes('returning')) {
          pgSql += ' RETURNING *';
        }
        const client = transactionStorage.getStore() || this.pool;
        const res = await client.query(pgSql, params);
        
        let lastInsertRowid: any = null;
        if (res.rows && res.rows.length > 0) {
          const firstRow = res.rows[0];
          lastInsertRowid = firstRow.id ?? Object.values(firstRow)[0];
        }
        
        return {
          lastInsertRowid,
          changes: res.rowCount ?? 0
        };
      }
    };
  }

  transaction(fn: (...args: any[]) => any) {
    return async (...args: any[]) => {
      const activeClient = transactionStorage.getStore();
      if (activeClient) {
        return await fn(...args);
      }

      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        const result = await transactionStorage.run(client, async () => {
          return await fn(...args);
        });
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    };
  }
}

class SqliteAdapter implements DBWrapper {
  constructor(private sqliteDb: Database.Database) {}

  async exec(sql: string): Promise<void> {
    this.sqliteDb.exec(sql);
  }

  prepare(sql: string) {
    const stmt = this.sqliteDb.prepare(sql);
    return {
      get: async (...params: any[]) => {
        return stmt.get(...params);
      },
      all: async (...params: any[]) => {
        return stmt.all(...params);
      },
      run: async (...params: any[]) => {
        const res = stmt.run(...params);
        return {
          lastInsertRowid: res.lastInsertRowid,
          changes: res.changes
        };
      }
    };
  }

  transaction(fn: (...args: any[]) => any) {
    return async (...args: any[]) => {
      const inTx = sqliteTxStorage.getStore();
      if (inTx) {
        return await fn(...args);
      }

      return sqliteLock.acquire(async () => {
        this.sqliteDb.prepare('BEGIN').run();
        try {
          const result = await sqliteTxStorage.run(true, async () => {
            return await fn(...args);
          });
          this.sqliteDb.prepare('COMMIT').run();
          return result;
        } catch (err) {
          try {
            this.sqliteDb.prepare('ROLLBACK').run();
          } catch (rollbackErr) {}
          throw err;
        }
      });
    };
  }
}

let db: DBWrapper;

async function initSqliteTables(sqliteDb: Database.Database) {
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'contestant')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS competitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contestants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      competition_id INTEGER,
      institution TEXT NOT NULL,
      department TEXT NOT NULL,
      level TEXT NOT NULL,
      bio TEXT,
      photo_url TEXT,
      status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'suspended')) DEFAULT 'pending',
      total_votes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(competition_id) REFERENCES competitions(id)
    );

    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contestant_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      price_paid DECIMAL(10,2) NOT NULL,
      voter_name TEXT,
      voter_email TEXT,
      tx_ref TEXT UNIQUE NOT NULL,
      proof_url TEXT,
      status TEXT CHECK(status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(contestant_id) REFERENCES contestants(id)
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'unread',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  try {
    sqliteDb.prepare("ALTER TABLE votes ADD COLUMN proof_url TEXT").run();
  } catch (e) {}

  const adminExists = sqliteDb.prepare('SELECT 1 FROM users WHERE role = ?').get('admin');
  const adminEmail = 'bennygrace2026@gmail.com';
  const hash = bcrypt.hashSync('Uni9jamedia95#', 10);
  
  if (!adminExists) {
    sqliteDb.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
      'Super Admin',
      adminEmail,
      hash,
      'admin'
    );
  } else {
    sqliteDb.prepare("UPDATE users SET email = ?, password = ? WHERE role = 'admin'").run(
      adminEmail,
      hash
    );
  }

  const compExists = sqliteDb.prepare('SELECT 1 FROM competitions LIMIT 1').get();
  if (!compExists) {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    sqliteDb.prepare('INSERT INTO competitions (title, start_date, end_date, is_active) VALUES (?, ?, ?, ?)').run(
      'Face of the Week - Week 1',
      now.toISOString(),
      nextWeek.toISOString(),
      1
    );
  }

  const rulesExist = sqliteDb.prepare("SELECT 1 FROM settings WHERE key = 'rules'").get();
  if (!rulesExist) {
    sqliteDb.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('rules', '## Competition Rules\n\n1. Be respectful to all participants.\n2. Do not use bots to generate votes.\n3. Keep your profile appropriate for all audiences.\n4. Have fun and be a great representative of UNI9JA MEDIA.');
  }

  const defaultFAQCount = sqliteDb.prepare('SELECT COUNT(*) as c FROM faqs').get() as any;
  if (defaultFAQCount && defaultFAQCount.c === 0) {
    const insertFaq = sqliteDb.prepare('INSERT INTO faqs (question, answer) VALUES (?, ?)');
    insertFaq.run('How do I register?', 'Click on "Register as Contestant" on the homepage and fill out the form.');
    insertFaq.run('How can people vote for me?', 'Once approved, you will get a unique profile link. Share it with your friends so they can vote.');
    insertFaq.run('Is voting free?', 'Basic participation is free, but some campaigns might require a premium voting token. See our rules for details.');
  }

  const defaultSettings = [
    {k: 'site_email', v: 'hello@uni9jamedia.com'},
    {k: 'site_phone', v: '+234 123 456 7890'},
    {k: 'site_address', v: 'Lagos, Nigeria'},
    {k: 'social_instagram', v: 'https://instagram.com/uni9jamedia'},
    {k: 'social_twitter', v: 'https://twitter.com/uni9jamedia'},
    {k: 'vote_cost', v: '100'},
    {k: 'rules_general', v: '1. Be respectful to all participants.\n2. Do not use bots to generate votes.'},
    {k: 'rules_contestant', v: '1. Keep your profile appropriate for all audiences.\n2. Have fun and be a great representative of UNI9JA MEDIA.'},
    {k: 'rules_voting', v: '1. Each vote costs N100.\n2. You can vote as many times as you like.'}
  ];
  const insertSetting = sqliteDb.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING');
  for (const s of defaultSettings) {
    insertSetting.run(s.k, s.v);
  }
}

export async function initDb() {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))) {
    console.log('[DB] Connecting to PostgreSQL/Supabase...');
    const adapter = new PostgresAdapter(dbUrl);
    db = adapter;

    try {
      // Check if some table doesn't exist
      const tableCheckSql = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `;
      const checkRes = await adapter.prepare(tableCheckSql).get();
      const tablesExist = checkRes?.exists === true;

      if (!tablesExist) {
        console.log('[DB] Supabase tables not found. Automatically setting up schema...');
        const fs = await import('fs/promises');
        const schemaSql = await fs.readFile(path.resolve(process.cwd(), 'supabase_schema.sql'), 'utf-8');
        
        // Run SQL block
        await adapter.exec(schemaSql);
        console.log('[DB] Supabase database tables created and seeded successfully!');
      } else {
        console.log('[DB] Supabase database connection active. Tables already exist.');
      }
    } catch (err: any) {
      console.error('[DB] Failed to initialize PostgreSQL/Supabase database:', err);
    }
  } else {
    console.log('[DB] Connecting to SQLite fallback...');
    const dbPath = path.resolve(process.cwd(), 'database.sqlite');
    const sqliteDb = new Database(dbPath, { verbose: console.log });
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('busy_timeout = 5000');
    
    db = new SqliteAdapter(sqliteDb);
    await initSqliteTables(sqliteDb);
  }
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}
