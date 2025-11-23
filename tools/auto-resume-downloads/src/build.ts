// eslint-disable-next-line n/no-unpublished-import
import {build} from 'esbuild';
import * as dotenv from 'dotenv';

dotenv.config({quiet: true});

function generateDefineFromEnv() {
  const define: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) {
      define[`process.env.${key}`] = JSON.stringify(value);
    }
  }
  return define;
}

void (async () => {
  await build({
    entryPoints: ['build/src/index.js'],
    outfile: 'dist/bundle.cjs',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    define: generateDefineFromEnv(),
  });

  console.log('✨ Build complete');
})();
