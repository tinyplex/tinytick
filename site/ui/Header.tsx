import type {NoPropComponent} from 'tinydocs';
import {NodeChildren, useRootNode} from 'tinydocs';
import {useMetadata} from './BuildContext.tsx';

export const Header: NoPropComponent = () => {
  const {version} = useMetadata();
  const rootNode = useRootNode();

  return (
    <header>
      <a href="/">
        <img src="/favicon.svg" alt="TinyTick logo" />
        <span>
          TinyTick
          {version.includes('beta') && (
            <>
              {' '}
              <em>&beta;</em>
            </>
          )}
        </span>
      </a>
      <nav>
        <ul>
          <NodeChildren node={rootNode} />
          <li>
            <a href="https://github.com/tinyplex/tinytick">GitHub</a>
          </li>
        </ul>
      </nav>
      <span id="dark" />
    </header>
  );
};
