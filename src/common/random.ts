import type {Id} from '../@types/index.d.ts';
import {arrayMap, arrayReduce} from './array.ts';
import {encode, GLOBAL, math, mathFloor} from './other.ts';

// Fallback is not cryptographically secure but tolerable for ReactNative UUIDs.
const getRandomValues = GLOBAL.crypto
  ? (array: Uint8Array): Uint8Array => GLOBAL.crypto.getRandomValues(array)
  : /*! istanbul ignore next */
    (array: Uint8Array): Uint8Array =>
      arrayMap(array as any, () => mathFloor(math.random() * 256)) as any;

export const getUniqueId = (length = 16): Id =>
  arrayReduce<number, Id>(
    getRandomValues(new Uint8Array(length)) as any,
    (uniqueId, number) => uniqueId + encode(number),
    '',
  );
