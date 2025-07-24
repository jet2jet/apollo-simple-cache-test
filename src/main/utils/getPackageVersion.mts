import { createRequire } from 'module';
import * as path from 'path';
const require = createRequire(import.meta.url);

export default function getPackageVersion(packageName: string): string {
  for (const modulePath of require.resolve.paths('') ?? []) {
    try {
      const json = require(
        path.resolve(modulePath, packageName, 'package.json')
      ) as { version?: string };
      return `${packageName} ${json.version ?? '(unknown)'}`;
    } catch {}
  }
  return `${packageName} (unknown)`;
}
