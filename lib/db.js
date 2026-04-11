import oracledb from 'oracledb';

let isInitialized = false;

function getConnectString() {
  let s = String(process.env.DB_CONNECT_STRING || '').trim();
  while (s.toUpperCase().startsWith('DB_CONNECT_STRING=')) {
    s = s.slice('DB_CONNECT_STRING='.length);
  }
  return s;
}

async function initialize() {
  if (!isInitialized) {
    const libDir = process.env.ORACLE_CLIENT_LIB_DIR;
    if (libDir) {
      oracledb.initOracleClient({ libDir });
    }
    isInitialized = true;
  }
}

export async function getConnection() {
  await initialize();
  return await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: getConnectString(),
  });
}

export async function executeQuery(sql, binds = [], opts = {}) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...opts,
    });
    return result;
  } catch (err) {
    console.error('DB Error:', err.message);
    throw err;
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch {}
    }
  }
}

export async function callProcedure(sql, binds = []) {
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(sql, binds, { autoCommit: true });
  } catch (err) {
    console.error('Procedure Error:', err.message);
    throw err;
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch {}
    }
  }
}
