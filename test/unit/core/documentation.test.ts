import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import * as ReactDOMTestUtils from 'react-dom/test-utils';
import * as TinyTick from 'tinytick';
import * as fs from 'fs';
import {join, resolve} from 'path';
import {readFileSync, readdirSync} from 'fs';
import {transformSync} from 'esbuild';

// globally present; do not need to be imported in examples
[ReactDOMTestUtils].forEach((module) =>
  Object.entries(module).forEach(([key, value]) => {
    (globalThis as any)[key] = value;
  }),
);

// need to be imported in examples
(globalThis as any).modules = {
  fs,
  react: React,
  'react-dom/client': ReactDOMClient,
  tinytick: TinyTick,
};

type Results = [any, any][];

const resultsByName: {[name: string]: () => Promise<Results>} = {};

const AsyncFunction = Object.getPrototypeOf(async () => null).constructor;
const forEachDeepFile = (
  dir: string,
  callback: (file: string) => void,
  extension = '',
): void =>
  forEachDirAndFile(
    dir,
    (dir) => forEachDeepFile(dir, callback, extension),
    (file) => callback(file),
    extension,
  );

const forEachDirAndFile = (
  dir: string,
  dirCallback: ((dir: string) => void) | null,
  fileCallback?: (file: string) => void,
  extension = '',
): void =>
  readdirSync(dir, {withFileTypes: true}).forEach((entry) => {
    const path = resolve(join(dir, entry.name));
    if (entry.isDirectory()) {
      dirCallback?.(path);
    } else if (path.endsWith(extension)) {
      fileCallback?.(path);
    }
  });

const prepareTestResultsFromBlock = (block: string, prefix: string): void => {
  const name = prefix + ' - ' + (block.match(/(?<=^).*?(?=\n)/) ?? '');
  let count = 1;
  let suffixedName = name;
  while (resultsByName[suffixedName] != null) {
    suffixedName = name + ' ' + ++count;
  }

  const tsx = block
    .match(/(?<=```[tj]sx?\n).*?(?=```)/gms)
    ?.join('\n')
    ?.trim();
  if (tsx == null) {
    return;
  }

  let problem;
  if (tsx != '') {
    const realTsx =
      tsx
        ?.replace(/console\.log/gm, '_actual.push')
        ?.replace(
          /\/\/ -> (.+?)\s(.*?Event\(.*?)$/gm,
          'act(() => $1.dispatchEvent(new $2));\n',
        )
        ?.replace(
          /\/\/ -> (.*?Event\(.*?)$/gm,
          'act(() => dispatchEvent(new $1));\n',
        )
        ?.replace(
          /\/\/ ->\n(.*?);$/gms,
          (match, expected) =>
            '_expected.push(' + expected.replace(/\n\s*/gms, ``) + ');\n',
        )
        ?.replace(/\/\/ -> (.*?)$/gm, '_expected.push($1);\n')
        ?.replace(
          /\/\/ \.\.\. \/\/ !act$/gm,
          'await act(async () => {await pause();});\n',
        )
        ?.replace(/\/\/ \.\.\.$/gm, 'await pause();\n')
        ?.replace(/^(.*?) \/\/ !act$/gm, 'act(() => {$1});')
        ?.replace(/^(.*?) \/\/ !yolo$/gm, '')
        ?.replace(/\n+/g, '\n')
        ?.replace(
          /import (type )?(.*?) from '(.*?)';/gms,
          'const $2 = modules[`$3`];',
        )
        ?.replace(/export (const|class) /gm, '$1 ') ?? '';
    // lol what could go wrong
    try {
      const js = transformSync(realTsx, {loader: 'tsx'});
      resultsByName[suffixedName] = new AsyncFunction(`
        const _expected = [];
        const _actual = [];
        ${js.code}
        return Array(Math.max(_expected.length, _actual.length))
          .fill('')
          .map((_, r) => [_expected[r], _actual[r]]);`);
    } catch (e: any) {
      problem = `Could not parse example:\n-\n${name}\n-\n${e}\n-\n${realTsx}`;
    }
  } else {
    problem = `Could not find JavaScript in example: ${name}`;
  }
  expect(problem).toBeUndefined();
};

describe('Documentation tests', () => {
  forEachDeepFile(
    'src/@types',
    (file) =>
      readFileSync(file, 'utf-8')
        .match(/(?<=\* @example\n).*?(?=\s*(\*\/|\* @))/gms)
        ?.map((examples) => examples.replace(/^\s*?\* ?/gms, ''))
        ?.forEach((block) => prepareTestResultsFromBlock(block, file)),
    '.js',
  );
  ['site/guides', 'site/home'].forEach((root) =>
    forEachDeepFile(
      root,
      (file) => prepareTestResultsFromBlock(readFileSync(file, 'utf-8'), file),
      '.md',
    ),
  );

  test.each(Object.entries(resultsByName))('%s', async (_name, getResults) => {
    const results = await getResults();
    results.forEach(([expectedResult, actualResult]) => {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(actualResult).toEqual(expectedResult);
    });
  });
});
