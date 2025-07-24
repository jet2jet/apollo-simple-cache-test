import { createRequire } from 'module';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { JSDOM } from 'jsdom';
import { Bench } from 'tinybench';
import { getAllHooks } from './allHooks.mjs';
import { getAllProcedures } from './allProcedures.mjs';
import { resetPersonData } from './mockServer/mockPerson.mjs';
import { server } from './mockServer/node.mjs';
const require = createRequire(import.meta.url);
const heapdump = require('heapdump') as {
  writeSnapshot: (filename: string) => boolean;
};

function waitMicrotask() {
  return new Promise<void>((resolve) => setImmediate(resolve));
}

async function main() {
  let promisePause = Promise.resolve();

  const isWithGc = process.argv.some((a) => a === '--with-gc');

  if (isWithGc) {
    console.log(
      `Program ${process.pid} (can create heapdump with 'kill -USR1 ${process.pid}')`
    );

    process.on('SIGUSR1', () => {
      let done!: () => void;
      promisePause = new Promise((resolve) => {
        done = resolve;
      });
      const filename = `heapdump-${Date.now()}.heapsnapshot`;
      console.log(`Start heap dump to ${filename}`);
      const r = heapdump.writeSnapshot(filename);
      console.log(`Heap dump ${r ? 'succeeded' : 'failed'} for ${filename}`);
      done();
    });
  }

  const allProcedures = getAllProcedures();
  const allHooks = getAllHooks();
  const bench = new Bench({ time: 10 });
  server.listen();

  loadDevMessages();
  loadErrorMessages();

  const versionInfoSet = new Set<string>();

  for (const a of allProcedures) {
    const versionInfo = a[0];
    versionInfoSet.add(versionInfo);
  }

  console.log('--- Version info ---');
  console.log([...versionInfoSet].join('\n'));
  console.log('--------------------');

  for (const a of allProcedures) {
    const name = a[1];
    const makeClient = a[2];
    const procedures = a[3];
    for (const p of procedures) {
      const fnName = p[0];
      const run = p[1];
      bench.add(
        `proc:${name}:${fnName}`,
        async () => {
          const client = makeClient();
          await run(client);
        },
        {
          beforeAll: async () => {
            await promisePause;
            await waitMicrotask();
          },
          beforeEach: () => {
            resetPersonData();
          },
        }
      );
    }
  }

  for (const a of allHooks) {
    const name = a[1];
    const Component = a[2];
    const hooks = a[3];
    for (const h of hooks) {
      const fnName = h[0];
      const use = h[1];
      bench.add(
        `hook:${name}:${fnName}`,
        async () => {
          const { result } = renderHook(() => use(), {
            wrapper: Component,
          });
          await waitFor(() => {
            if (!result.current) {
              throw new Error('Pending');
            }
          });
        },
        {
          beforeAll: async () => {
            await promisePause;
            await waitMicrotask();
          },
          beforeEach: () => {
            resetPersonData();
            const doc = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
              url: 'http://localhost/',
            });
            for (const [name, value] of Object.entries(doc.window)) {
              if (/^_/.test(name) || name in globalThis) {
                continue;
              }
              (globalThis as Record<string, unknown>)[name] = value;
            }
          },
          afterEach: () => {
            cleanup();
          },
        }
      );
    }
  }

  for (const t of bench.tasks) {
    console.log(`Running ${t.name}`);
    await t.run();
  }

  server.close();

  console.table(bench.table());
  process.exit(0);
}

void main().catch((e: unknown) => {
  console.error('Error:', e);
  process.exit(1);
});
