import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerRootComponent } from 'expo';
import App from './app/index';

// Guard AsyncStorage against undefined / null keys that crash Android SQLite
const originalGetItem = AsyncStorage.getItem;
AsyncStorage.getItem = function (key, ...args) {
  if (typeof key !== 'string') {
    console.warn('[AsyncStorage] Invalid key passed to getItem:', key, new Error().stack);
    return Promise.resolve(null);
  }
  return originalGetItem.call(this, key, ...args);
};

const originalSetItem = AsyncStorage.setItem;
AsyncStorage.setItem = function (key, value, ...args) {
  if (typeof key !== 'string') {
    console.warn('[AsyncStorage] Invalid key passed to setItem:', key, new Error().stack);
    return Promise.resolve();
  }
  return originalSetItem.call(this, key, value, ...args);
};

const originalRemoveItem = AsyncStorage.removeItem;
AsyncStorage.removeItem = function (key, ...args) {
  if (typeof key !== 'string') {
    console.warn('[AsyncStorage] Invalid key passed to removeItem:', key, new Error().stack);
    return Promise.resolve();
  }
  return originalRemoveItem.call(this, key, ...args);
};

const originalMultiGet = AsyncStorage.multiGet;
AsyncStorage.multiGet = function (keys, ...args) {
  if (!Array.isArray(keys) || keys.some(k => typeof k !== 'string')) {
    console.warn('[AsyncStorage] Invalid keys array passed to multiGet:', keys, new Error().stack);
    const validKeys = Array.isArray(keys) ? keys.filter(k => typeof k === 'string') : [];
    return originalMultiGet.call(this, validKeys, ...args);
  }
  return originalMultiGet.call(this, keys, ...args);
};

registerRootComponent(App);
