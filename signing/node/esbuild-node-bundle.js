let esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: ['node12'],
    outfile: 'build/index.bundle.js',
}).catch(() => {
    process.exit(1);
});




