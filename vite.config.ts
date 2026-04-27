import { Buffer } from 'node:buffer';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import vue from '@vitejs/plugin-vue';

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
      if (Array.isArray(contentType) ? contentType.some((item) => item.includes('application/json')) : contentType.includes('application/json')) {
        try {
          resolve(JSON.parse(raw));
        } catch (error) {
          reject(error);
        }
        return;
      }

      resolve(raw);
    });
  });
}

function resolveApiModule(apiPath: string) {
  const cleanPath = apiPath.replace(/^\/api\/?/, '').replace(/\/$/, '');
  const segments = cleanPath.split('/').filter(Boolean);
  const candidates = [
    path.resolve(process.cwd(), 'api', `${segments.join('/')}.ts`),
    path.resolve(process.cwd(), 'api', ...segments, 'index.ts')
  ];

  if (segments.length >= 2) {
    candidates.push(path.resolve(process.cwd(), 'api', ...segments.slice(0, -1), '[id].ts'));
  }

  const file = candidates.find((candidate) => existsSync(candidate));
  return {
    file,
    id: file?.endsWith(`${path.sep}[id].ts`) ? segments[segments.length - 1] : undefined
  };
}

async function loadApiHandler(server: ViteDevServer, apiPath: string) {
  const { file, id } = resolveApiModule(apiPath);
  if (!file) {
    return { handler: undefined, id: undefined };
  }

  const mod = await server.ssrLoadModule(file);
  return { handler: mod.default, id };
}

function hasConfiguredDatabase() {
  return Boolean(
    process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.POSTGRES_PRISMA_URL
  );
}

function createResponseAdapter(res: ServerResponse) {
  let statusCode = 200;

  return {
    setHeader(name: string, value: number | string | readonly string[]) {
      res.setHeader(name, value);
      return this;
    },
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
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

function localApiPlugin(): Plugin {
  return {
    name: 'haohao-local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api')) {
          next();
          return;
        }

        try {
          const requestUrl = new URL(req.url, 'http://localhost');
          const responseAdapter = createResponseAdapter(res);
          const requestAdapter = Object.assign(req, {
            query: Object.fromEntries(requestUrl.searchParams.entries()),
            body: await readBody(req),
            cookies: parseCookies(req.headers.cookie),
            headers: req.headers as Record<string, string | string[] | undefined>
          });

          if (!hasConfiguredDatabase()) {
            const mod = await server.ssrLoadModule(path.resolve(process.cwd(), 'dev-backend/router.ts'));
            await mod.handleDevApi(requestAdapter, responseAdapter, requestUrl.pathname);
            return;
          }

          const { handler, id } = await loadApiHandler(server, requestUrl.pathname);
          if (typeof handler !== 'function') {
            res.statusCode = 404;
            res.end(JSON.stringify({ message: 'API handler not found' }));
            return;
          }

          if (id) requestAdapter.query.id = id;
          await handler(requestAdapter, responseAdapter);
        } catch (error) {
          console.error(error);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
          }
          res.end(JSON.stringify({ message: error instanceof Error ? error.message : 'Local API error' }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    plugins: [vue(), localApiPlugin()],
    server: {
      port: 5173
    }
  };
});
