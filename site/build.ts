import {createDocs, getSorter} from 'tinydocs';
import {readFileSync, writeFileSync} from 'fs';
import {ArticleInner} from './ui/ArticleInner.tsx';
import type {Docs} from 'tinydocs';
import {ExecutablePen} from './ui/ExecutablePen.tsx';
import {NavJson} from './ui/NavJson.tsx';
import {Page} from './ui/Page.tsx';
import {Readme} from './ui/Readme.tsx';

const GROUPS = ['Interfaces', '*', 'Type aliases'];
const CATEGORIES = ['Manager', 'Task', 'TaskRun', 'Category', '*'];
const REFLECTIONS = [/^get/, /^set/, '*', /^del/];

export const build = async (
  outDir: string,
  api = true,
  pages = true,
): Promise<void> => {
  const {version} = JSON.parse(readFileSync('./package.json', 'utf-8'));
  const baseUrl = version.includes('beta')
    ? 'https://beta.tinytick.org'
    : 'https://tinytick.org';
  writeFileSync(
    'site/js/version.ts',
    `export const thisVersion = 'v${version}';`,
    'utf-8',
  );

  const docs = createDocs(baseUrl, outDir, !api && !pages)
    .addJsFile('site/js/home.ts')
    .addJsFile('site/js/app.ts')
    .addJsFile('site/js/single.ts')
    .addLessFile('site/less/index.less')
    .addDir('site/fonts', 'fonts')
    .addDir('site/extras');

  [''].forEach((module) =>
    docs.addFile('dist/umd' + module + '/index.js', 'umd/tinytick/' + module),
  );

  if (api) {
    addApi(docs);
  }
  if (pages) {
    addPages(docs);
  }
  if (api || pages) {
    (
      await docs.generateNodes({
        group: getSorter(GROUPS),
        category: getSorter(CATEGORIES),
        reflection: getSorter(REFLECTIONS),
      })
    )
      .addPageForEachNode('/', Page)
      .addPageForEachNode('/', ArticleInner, 'article.html')
      .addTextForEachNode('/', NavJson, 'nav.json')
      .addTextForEachNode('/demos/', ExecutablePen, 'pen.json')
      .addPageForNode('/api/', Page, 'all.html', true)
      .addMarkdownForNode('/', Readme, '../readme.md')
      .addMarkdownForNode('/guides/releases/', Readme, '../../../releases.md');
  }
  docs.publish();
};

const addApi = (docs: Docs): Docs => docs.addApiFile('dist/@types/index.d.ts');

const addPages = (docs: Docs): Docs =>
  docs
    .addRootMarkdownFile('site/home/index.md')
    .addMarkdownDir('site/guides')
    .addMarkdownDir('site/demos', true);
