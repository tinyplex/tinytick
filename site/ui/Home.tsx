import type {NoPropComponent} from 'tinydocs';
import {Markdown, usePageNode} from 'tinydocs';
import {useReadme} from './Readme.tsx';

export const Home: NoPropComponent = (): any => {
  const [summary, body] = useReadme(usePageNode());

  return (
    <article id="home">
      <em>
        <img
          src="/favicon.svg"
          alt="Large TinyTick logo"
          width="100%"
          height="100%"
        />
      </em>
      <Markdown markdown={summary} html={true} />
      <Markdown markdown={body} html={true} />
    </article>
  );
};
