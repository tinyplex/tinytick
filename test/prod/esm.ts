import type {Manager, Manager as ManagerDebug} from 'tinytick';
import {createManager, createManager as createManagerDebug} from 'tinytick';

const _store: Manager = createManager();
const _storeDebug: ManagerDebug = createManagerDebug();
