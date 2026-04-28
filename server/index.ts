import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Buffer } from 'node:buffer';

type ApiHandler = (req: ApiRequest, res: ApiResponse) => Promise<void> | void;

interface ApiRequest extends IncomingMessage {
  query: Record<string, string>;
  body?: unknown;
  cookies: Record<string, string>;
}

interface ApiResponse {
  setHeader(name: string, value: number | string | readonly string[]): ApiResponse;
  status(code: number): ApiResponse;
  json(payload: unknown): void;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..', '..');
const distDir = path.resolve(rootDir, 'dist');
const apiDir = path.resolve(__dirname, '..', 'api');
const port = Number(process.env.PORT ?? 3000);

const mimeTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function loadLocalEnv() {
  const envPath = path.join(rootDir, '.env');
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    process.env[key] ??= value;
  }
}

loadLocalEnv();

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce<Record<string, string>>((cookies, pair) => {
    const [rawKey, ...rawValue] = pair.trim().split('=');
    if (!rawKey) return cookies;
    cookies[rawKey] = decodeURIComponent(rawValue.join('=') ?? '');
    return cookies;
  }, {});
}

function readBody(req: IncomingMessage) {
  return new Promise<unknown>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('error', reject);
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        resolve(undefined);
        return;
      }

      const contentType = req.headers['content-type'] ?? '';
      const isJson = Array.isArray(contentType)
        ? contentType.some((item) => item.includes('application/json'))
        : contentType.includes('application/json');

      if (!isJson) {
        resolve(raw);
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function createResponseAdapter(res: ServerResponse): ApiResponse {
  let statusCode = 200;

  return {
    setHeader(name, value) {
      res.setHeader(name, value);
      return this;
    },
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      if (!res.headersSent) {
        res.statusCode = statusCode;
        if (!res.getHeader('Content-Type')) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
        }
      }
      res.end(JSON.stringify(payload));
    }
  };
}

function resolveApiModule(apiPath: string) {
  const cleanPath = apiPath.replace(/^\/api\/?/, '').replace(/\/$/, '');
  const segments = cleanPath.split('/').filter(Boolean);
  const candidates = [
    path.resolve(apiDir, `${segments.join('/')}.js`),
    path.resolve(apiDir, ...segments, 'index.js')
  ];

  if (segments.length >= 2) {
    candidates.push(path.resolve(apiDir, ...segments.slice(0, -1), '[id].js'));
  }

  const file = candidates.find((candidate) => existsSync(candidate));
  return {
    file,
    id: file?.endsWith(`${path.sep}[id].js`) ? segments[segments.length - 1] : undefined
  };
}

async function handleApi(req: IncomingMessage, res: ServerResponse, requestUrl: URL) {
  const { file, id } = resolveApiModule(requestUrl.pathname);
  if (!file) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ message: 'API handler not found' }));
    return;
  }

  const mod = (await import(pathToFileURL(file).href)) as { default?: ApiHandler };
  if (typeof mod.default !== 'function') {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ message: 'API handler is invalid' }));
    return;
  }

  const query = Object.fromEntries(requestUrl.searchParams.entries());
  if (id) query.id = id;

  const apiReq = Object.assign(req, {
    query,
    body: await readBody(req),
    cookies: parseCookies(req.headers.cookie),
    headers: req.headers as Record<string, string | string[] | undefined>
  }) as ApiRequest;

  await mod.default(apiReq, createResponseAdapter(res));
}

async function sendStatic(req: IncomingMessage, res: ServerResponse, requestUrl: URL) {
  const decodedPath = decodeURIComponent(requestUrl.pathname);
  const requestedPath = decodedPath === '/' ? '/index.html' : decodedPath;
  const filePath = path.normalize(path.join(distDir, requestedPath));
  const safeFilePath = filePath.startsWith(distDir) ? filePath : path.join(distDir, 'index.html');
  const targetPath = existsSync(safeFilePath) && (await stat(safeFilePath)).isFile()
    ? safeFilePath
    : path.join(distDir, 'index.html');

  const extension = path.extname(targetPath);
  res.statusCode = 200;
  res.setHeader('Content-Type', mimeTypes[extension] ?? 'application/octet-stream');

  if (targetPath.endsWith('index.html')) {
    res.setHeader('Cache-Control', 'no-store');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }

  createReadStream(targetPath).pipe(res);
}

createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

    if (requestUrl.pathname.startsWith('/api')) {
      await handleApi(req, res, requestUrl);
      return;
    }

    await sendStatic(req, res, requestUrl);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    res.end(JSON.stringify({ message: '服务器开小差了，请稍后再试' }));
  }
}).listen(port, () => {
  console.log(`好好记账服务已启动：http://localhost:${port}`);
});

void readFile(path.join(distDir, 'index.html')).catch(() => {
  console.warn('未找到 dist/index.html，请先执行 npm run build:tencent');
});
