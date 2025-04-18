// All other imports are lazy so that single tasks start up fast.
import {
  existsSync,
  promises,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import gulp from 'gulp';
import {basename, dirname, join, resolve} from 'path';
import {gzipSync} from 'zlib';

const UTF8 = 'utf-8';
const TEST_MODULES = ['', 'ui-react'];
const ALL_MODULES = [...TEST_MODULES];
const ALL_DEFINITIONS = [...ALL_MODULES];

const DIST_DIR = 'dist';
const DOCS_DIR = 'docs';
const TMP_DIR = 'tmp';
const LINT_BLOCKS = /```[jt]sx?( [^\n]+)?(\n.*?)```/gms;
const TYPES_DOC_CODE_BLOCKS = /\/\/\/\s*(\S*)(.*?)(?=(\s*\/\/)|(\n\n)|(\n$))/gs;
const TYPES_DOC_BLOCKS = /(\/\*\*.*?\*\/)\s*\/\/\/\s*(\S*)/gs;

const getGlobalName = (module) =>
  'TinyTick' +
  (module == ''
    ? ''
    : basename(module)
        .split('-')
        .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
        .join(''));

const getPrettierConfig = async () => ({
  ...JSON.parse(await promises.readFile('.prettierrc', UTF8)),
  parser: 'typescript',
});

const allOf = async (array, cb) => await Promise.all(array.map(cb));
const testModules = async (cb) => await allOf(TEST_MODULES, cb);
const allModules = async (cb) => await allOf(ALL_MODULES, cb);
const allDefinitions = async (cb) => await allOf(ALL_DEFINITIONS, cb);

const clearDir = async (dir = DIST_DIR) => {
  try {
    await removeDir(dir);
  } catch {}
  await makeDir(dir);
};

const makeDir = async (dir) => {
  try {
    await promises.mkdir(dir);
  } catch {}
};

const ensureDir = async (fileOrDirectory) => {
  await promises.mkdir(dirname(fileOrDirectory), {recursive: true});
  return fileOrDirectory;
};

const removeDir = async (dir) => {
  await promises.rm(dir, {recursive: true});
};

const forEachDeepFile = (dir, callback, extension = '') =>
  forEachDirAndFile(
    dir,
    (dir) => forEachDeepFile(dir, callback, extension),
    (file) => callback(file),
    extension,
  );

const forEachDirAndFile = (dir, dirCallback, fileCallback, extension = '') =>
  readdirSync(dir, {withFileTypes: true}).forEach((entry) => {
    const path = resolve(join(dir, entry.name));
    if (entry.isDirectory()) {
      dirCallback?.(path);
    } else if (path.endsWith(extension)) {
      fileCallback?.(path);
    }
  });

const gzipFile = async (fileName) =>
  await promises.writeFile(
    `${fileName}.gz`,
    gzipSync(await promises.readFile(fileName, UTF8), {level: 9}),
  );

const copyPackageFiles = async (forProd = false) => {
  const mins = forProd ? [null, 'min'] : [null];
  const modules = forProd ? ALL_MODULES : TEST_MODULES;

  const json = JSON.parse(await promises.readFile('package.json', UTF8));
  delete json.private;
  delete json.scripts;
  delete json.devEngines;
  delete json.devDependencies;

  json.main = './index.js';
  json.types = './@types/index.d.ts';

  json.typesVersions = {'*': {}};
  json.exports = {};
  mins.forEach((min) => {
    modules.forEach((module) => {
      const path = [min, module].filter((part) => part).join('/');
      const typesPath = ['.', '@types', module, 'index.d.']
        .filter((part) => part)
        .join('/');
      const codePath = (path ? '/' : '') + path;

      json.typesVersions['*'][path ? path : '.'] = [typesPath + 'ts'];

      json.exports['.' + codePath] = {
        default: {
          types: typesPath + 'ts',
          default: '.' + codePath + '/index.js',
        },
      };
    });
  });

  await promises.writeFile(
    join(DIST_DIR, 'package.json'),
    JSON.stringify(json, undefined, 2),
    UTF8,
  );

  await promises.copyFile('LICENSE', join(DIST_DIR, 'LICENSE'));
  await promises.copyFile('readme.md', join(DIST_DIR, 'readme.md'));
  await promises.copyFile('releases.md', join(DIST_DIR, 'releases.md'));
};

let labelBlocks;
const getLabelBlocks = async () => {
  if (labelBlocks == null) {
    labelBlocks = new Map();
    await allModules(async (module) => {
      [
        ...(
          await promises.readFile(`src/@types/${module}/docs.js`, UTF8)
        ).matchAll(TYPES_DOC_BLOCKS),
      ].forEach(([_, block, label]) => {
        if (labelBlocks.has(label)) {
          throw new Error(`Duplicate label '${label}' in ${module}`);
        }
        labelBlocks.set(label, block);
      });
    });
  }
  return labelBlocks;
};

const copyDefinition = async (dir, module) => {
  const labelBlocks = await getLabelBlocks();
  // Add easier-to-read with-schemas blocks
  const codeBlocks = new Map();
  [
    ...(
      await promises.readFile(`src/@types/${module}/index.d.ts`, UTF8)
    ).matchAll(TYPES_DOC_CODE_BLOCKS),
  ].forEach(([_, label, code]) => {
    const prefix = code.match(/^\n\s*/m)?.[0];
    if (prefix) {
      codeBlocks.set(
        label,
        code
          .replace(/export type \S+ =\s/, '')
          .replace(/export function /, '')
          .replaceAll(prefix, prefix + ' * '),
      );
    }
  });
  const fileRewrite = (block) =>
    block.replace(TYPES_DOC_CODE_BLOCKS, (_, label, code) => {
      if (labelBlocks.has(label)) {
        let block = labelBlocks.get(label);
        return block + code;
      }
      throw `Missing docs label ${label} in ${module}`;
    });

  const definitionFile = await ensureDir(`${dir}/@types/${module}/index.d.ts`);
  await promises.writeFile(
    definitionFile,
    fileRewrite(
      await promises.readFile(`src/@types/${module}/index.d.ts`, UTF8),
    ),
    UTF8,
  );
};

const copyDefinitions = async (dir) => {
  await allDefinitions((module) => copyDefinition(dir, module));
};

const execute = async (cmd) => {
  const {exec} = await import('child_process');
  const {promisify} = await import('util');
  try {
    await promisify(exec)(cmd);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    throw e.stdout;
  }
};

const lintCheckFiles = async (dir) => {
  const {default: prettier} = await import('prettier');
  const prettierConfig = await getPrettierConfig();

  const filePaths = [];
  ['.ts', '.tsx', '.js', '.d.ts'].forEach((extension) =>
    forEachDeepFile(dir, (filePath) => filePaths.push(filePath), extension),
  );
  await allOf(filePaths, async (filePath) => {
    const code = await promises.readFile(filePath, UTF8);
    if (
      !(await prettier.check(code, {...prettierConfig, filepath: filePath}))
    ) {
      writeFileSync(
        filePath,
        await prettier.format(
          code,
          {...prettierConfig, filepath: filePath},
          UTF8,
        ),
      );
    }
  });

  const {
    default: {ESLint},
  } = await import('eslint');
  const esLint = new ESLint({});
  const results = await esLint.lintFiles([dir]);
  if (
    results.filter((result) => result.errorCount > 0 || result.warningCount > 0)
      .length > 0
  ) {
    const formatter = await esLint.loadFormatter();
    const errors = await formatter.format(results);
    throw errors;
  }
};

const lintCheckDocs = async (dir) => {
  const {
    default: {ESLint},
  } = await import('eslint');
  const esLint = new ESLint({
    overrideConfig: {
      rules: {
        'no-console': 0,
        'react/prop-types': 0,
        'react-hooks/rules-of-hooks': 0,
        '@typescript-eslint/no-unused-expressions': 0,
        'max-len': [
          2,
          {code: 80, ignorePattern: '^(\\s+\\* )?((im|ex)ports?|// ->)\\W.*'},
        ],
      },
    },
  });
  const {default: prettier} = await import('prettier');
  const prettierConfig = await getPrettierConfig();
  const docConfig = {...prettierConfig, printWidth: 75};

  const filePaths = [];
  ['.js', '.d.ts'].forEach((extension) =>
    forEachDeepFile(dir, (filePath) => filePaths.push(filePath), extension),
  );
  await allOf(filePaths, async (filePath) => {
    const code = await promises.readFile(filePath, UTF8);
    await allOf(
      [...(code.matchAll(LINT_BLOCKS) ?? [])],
      async ([_, hint, docBlock]) => {
        if (hint?.trim() == 'override') {
          return; // can't lint orphaned TS methods
        }
        const code = docBlock.replace(/\n +\* ?/g, '\n').trimStart();
        let pretty = code;
        if (!(await prettier.check(code, docConfig))) {
          pretty = await prettier.format(code, docConfig);
          writeFileSync(
            filePath,
            readFileSync(filePath, UTF8).replace(
              docBlock,
              '\n' +
                pretty
                  .trim()
                  .split('\n')
                  .map((line) => (line == '' ? ' *' : ' * ' + line))
                  .join('\n') +
                '\n * ',
            ),
            UTF8,
          );
        }
        const results = await esLint.lintText(pretty);
        if (
          results.filter(
            (result) => result.errorCount > 0 || result.warningCount > 0,
          ).length > 0
        ) {
          const formatter = await esLint.loadFormatter();
          const errors = await formatter.format(results);
          throw `${filePath} does not lint:\n${pretty}\n\n${errors}`;
        }
      },
    );
  });
};

const spellCheck = async (dir, deep = false) =>
  await execute(`cspell "${dir}/*${deep ? '*' : ''}"`);

const getTsOptions = async (dir) => {
  const {default: tsc} = await import('typescript');
  return tsc.parseJsonSourceFileConfigFileContent(
    tsc.readJsonConfigFile(`${dir}/tsconfig.json`, tsc.sys.readFile),
    tsc.sys,
    dir,
  );
};

const tsCheck = async (dir) => {
  const path = await import('path');
  const {default: tsc} = await import('typescript');
  const {analyzeTsConfig} = await import('ts-unused-exports');
  const {fileNames, options} = await getTsOptions(dir);
  const results = tsc
    .getPreEmitDiagnostics(
      tsc.createProgram(
        fileNames.filter(
          (fileName) => !fileName.startsWith('test/unit/core/types'),
        ),
        options,
      ),
    )
    .filter((result) => !result.file?.fileName.includes('/node_modules/'));
  if (results.length > 0) {
    const resultText = results
      .map((result) => {
        const {file, messageText, start} = result;
        const {line, character} = file.getLineAndCharacterOfPosition(start);
        return `${file.fileName}:${line}:${character}\n${JSON.stringify(
          messageText,
        )}`;
      })
      .join('\n\n');
    throw resultText;
  }
  const unusedResults = Object.entries(
    analyzeTsConfig(`${path.resolve(dir)}/tsconfig.json`, [
      '--excludeDeclarationFiles',
      '--excludePathsFromReport=' +
        'server.mjs;jest/reporter.js;jest/environment.js;build.ts;' +
        TEST_MODULES.map((module) => `${module}.ts`).join(';'),
    ]).unusedExports,
  )
    .map(
      ([file, exps]) =>
        `${file}: ${exps.map((exp) => exp.exportName).join(', ')}`,
    )
    .join('\n');
  if (unusedResults != '') {
    throw `Unused exports for ${dir} in: \n${unusedResults}`;
  }
};

const compileModule = async (module, dir = DIST_DIR, min = false) => {
  const {default: esbuild} = await import('rollup-plugin-esbuild');
  const {rollup} = await import('rollup');
  const {default: replace} = await import('@rollup/plugin-replace');
  const {default: prettierPlugin} = await import('rollup-plugin-prettier');
  const {default: shebang} = await import('rollup-plugin-preserve-shebang');
  const {default: image} = await import('@rollup/plugin-image');
  const {default: terser} = await import('@rollup/plugin-terser');

  let inputFile = `src/${module}/index.ts`;
  if (!existsSync(inputFile)) {
    inputFile += 'x';
  }

  const inputConfig = {
    external: ['react', 'react/jsx-runtime'],
    input: inputFile,
    plugins: [
      esbuild({
        target: 'esnext',
        legalComments: 'inline',
        jsx: 'automatic',
      }),
      replace({
        '/*!': '\n/*',
        delimiters: ['', ''],
        preventAssignment: true,
      }),
      shebang(),
      image(),
      min
        ? [terser({toplevel: true, compress: {unsafe: true, passes: 3}})]
        : prettierPlugin(await getPrettierConfig()),
    ],
    onwarn: (warning, warn) => {
      if (warning.code !== 'MISSING_NODE_BUILTINS') {
        warn(warning);
      }
    },
  };

  const moduleDir = dirname(await ensureDir(dir + '/' + module + '/-'));

  const index = 'index.js';
  const outputConfig = {
    dir: moduleDir,
    entryFileNames: index,
    format: 'esm',
    interop: 'default',
    name: getGlobalName(module),
  };

  await (await rollup(inputConfig)).write(outputConfig);

  if (min) {
    await gzipFile(join(moduleDir, index));
  }
};

// coverageMode = 0: none; 1: screen; 2: json; 3: html
const test = async (
  dirs,
  {coverageMode, countAsserts, puppeteer, serialTests} = {},
) => {
  const {default: jest} = await import('jest');
  await makeDir(TMP_DIR);
  const {
    results: {success},
  } = await jest.runCLI(
    {
      roots: dirs,
      setupFilesAfterEnv: ['./test/jest/setup'],
      ...(puppeteer
        ? {
            setupFilesAfterEnv: ['expect-puppeteer'],
            preset: 'jest-puppeteer',
            detectOpenHandles: true,
            maxWorkers: 2,
          }
        : {testEnvironment: './test/jest/environment'}),
      ...(coverageMode > 0
        ? {
            collectCoverage: true,
            coverageProvider: 'babel',
            collectCoverageFrom: [
              `${DIST_DIR}/index.js`,
              `${DIST_DIR}/ui-react/index.js`,
              // Other modules cannot be fully exercised in isolation.
            ],
            coverageReporters: ['text-summary']
              .concat(coverageMode > 1 ? ['json-summary'] : [])
              .concat(coverageMode > 2 ? ['lcov'] : []),
            coverageDirectory: 'tmp',
          }
        : {}),
      ...(countAsserts
        ? {
            testEnvironment: './test/jest/environment',
            reporters: ['default', './test/jest/reporter'],
            runInBand: true,
          }
        : {}),
      ...(serialTests ? {runInBand: true} : {}),
    },
    [''],
  );
  if (!success) {
    await removeDir(TMP_DIR);
    throw 'Test failed';
  }
  if (coverageMode == 2) {
    await promises.writeFile(
      'coverage.json',
      JSON.stringify({
        ...(countAsserts
          ? JSON.parse(await promises.readFile('./tmp/counts.json'))
          : {}),
        ...JSON.parse(await promises.readFile('./tmp/coverage-summary.json'))
          .total,
      }),
      UTF8,
    );
  }
  if (coverageMode < 3) {
    await removeDir(TMP_DIR);
  }
};

const compileModulesForProd = async () => {
  await clearDir(DIST_DIR);
  await copyPackageFiles(true);
  await copyDefinitions(DIST_DIR);

  await allModules(async (module) => {
    await compileModule(module, `${DIST_DIR}/`);
    await compileModule(module, `${DIST_DIR}/min`, true);
  });
};

const compileDocsAndAssets = async (api = true, pages = true) => {
  const {default: esbuild} = await import('esbuild');
  await makeDir(TMP_DIR);
  await esbuild.build({
    entryPoints: ['site/build.ts'],
    external: ['tinydocs', 'react', '@prettier/sync'],
    target: 'esnext',
    bundle: true,
    outfile: './tmp/build.js',
    format: 'esm',
    platform: 'node',
  });

  // eslint-disable-next-line import/no-unresolved
  const {build} = await import('./tmp/build.js');
  await build(esbuild, DOCS_DIR, api, pages);
  await removeDir(TMP_DIR);
};

const npmInstall = async () => {
  const {exec} = await import('child_process');
  const {promisify} = await import('util');
  return await promisify(exec)('npm install --legacy-peer-deps');
};

const npmPublish = async () => {
  const {exec} = await import('child_process');
  const {promisify} = await import('util');
  return await promisify(exec)('npm publish');
};

const {parallel, series} = gulp;

// --

export const preparePackage = copyPackageFiles;

export const compileForTest = async () => {
  await clearDir(DIST_DIR);
  await copyPackageFiles();
  await copyDefinitions(DIST_DIR);
  await testModules(async (module) => {
    await compileModule(module, DIST_DIR);
  });
};

export const lintFiles = async () => {
  await lintCheckFiles('src');
  await lintCheckFiles('test');
  await lintCheckFiles('site');
};
export const lintDocs = async () => await lintCheckDocs('src');
export const lint = series(lintDocs, lintFiles);

export const spell = async () => {
  await spellCheck('.');
  await spellCheck('src', true);
  await spellCheck('test', true);
  await spellCheck('site', true);
};

export const ts = async () => {
  await tsCheck('src');
  await tsCheck('test');
  await tsCheck('site');
};

export const compileForProd = async () => await compileModulesForProd();

export const compileForProdFast = async () => await compileModulesForProd(true);

export const testUnit = async () => {
  await test(['test/unit'], {coverageMode: 1, serialTests: true});
};
export const testUnitFast = async () => {
  await test(['test/unit/core'], {coverageMode: 1});
};
export const testUnitCountAsserts = async () => {
  await test(['test/unit'], {coverageMode: 2, countAsserts: true});
};
export const testUnitSaveCoverage = async () => {
  await test(['test/unit/core'], {coverageMode: 3});
};
export const compileAndTestUnit = series(compileForTest, testUnit);
export const compileAndTestUnitFast = series(compileForTest, testUnitFast);
export const compileAndTestUnitSaveCoverage = series(
  compileForTest,
  testUnitSaveCoverage,
);

export const testPerf = async () => {
  //  await test(['test/perf'], {serialTests: true});
};
export const compileAndTestPerf = series(compileForTest, testPerf);

export const compileDocsPagesOnly = async () =>
  await compileDocsAndAssets(false);

export const compileDocsAssetsOnly = async () =>
  await compileDocsAndAssets(false, false);

export const compileDocs = async () => await compileDocsAndAssets();

export const compileForProdAndDocs = series(compileForProd, compileDocs);

export const testE2e = async () => {
  // await test(['test/e2e'], {puppeteer: true});
};
export const compileAndTestE2e = series(compileForProdAndDocs, testE2e);

export const testProd = async () => {
  await execute('attw --pack dist --format table-flipped --profile esm-only');
  await test(['test/prod']);
};
export const compileAndTestProd = series(compileForProdAndDocs, testProd);

export const serveDocs = async () => {
  const {createTestServer} = await import('./test/server.mjs');
  createTestServer(DOCS_DIR, '8081');
};

export const preCommit = series(
  parallel(lint, spell, ts),
  compileForTest,
  testUnit,
  compileForProd,
);

export const prePublishPackage = series(
  npmInstall,
  compileForTest,
  parallel(lint, spell, ts),
  testUnitCountAsserts,
  testPerf,
  compileForProd,
  testProd,
  compileDocs,
  testE2e,
);

export const publishPackage = series(prePublishPackage, npmPublish);
