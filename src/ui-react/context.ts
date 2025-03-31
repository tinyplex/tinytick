import type React from 'react';
import type {Manager} from '../@types/index.d.ts';

import {createContext} from 'react';
import {GLOBAL} from '../common/other.ts';
import {TINYTICK} from '../common/strings.ts';

const TINYTICK_CONTEXT = TINYTICK + '_uirc';

export const Context: React.Context<Manager | undefined> = (GLOBAL as any)[
  TINYTICK_CONTEXT
]
  ? /*! istanbul ignore next */
    (GLOBAL as any)[TINYTICK_CONTEXT]
  : ((GLOBAL as any)[TINYTICK_CONTEXT] = createContext<Manager | undefined>(
      undefined,
    ));
