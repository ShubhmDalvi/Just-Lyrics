import { GENERAL_ERROR_LOG, STORAGE_TRANSIENT_SET_LOG } from "@constants";
import { log } from "@utils";
import { compressString, decompressString, isCompressed } from "./compression";

/**
 * Typed wrapper for chrome.storage.local.get that casts results to expected type.
 */
export async function getLocalStorage<T>(keys: string | string[] | null): Promise<T> {
  return (await chrome.storage.local.get(keys as string[])) as unknown as T;
}

/**
 * Cross-browser storage getter that works with both Chrome and Firefox.
 *
 * @param {Object|string} key - Storage key or object with default values
 * @param {Function} callback - Callback function to handle the retrieved data
 */
export function getStorage(
  key: string | string[] | { [key: string]: any },
  callback: (items: { [key: string]: any }) => void
): void {
  chrome.storage.sync.get(key, callback);
}

interface TransientStorageItem {
  type: "transient";
  value: any;
  expiry: number;
}

/**
 * Retrieves a value from transient storage with automatic expiry handling.
 * Automatically decompresses if the value was stored compressed.
 *
 * @param {string} key - Storage key to retrieve
 * @returns {Promise<*|null>} The stored value or null if expired/not found
 */
export async function getTransientStorage(key: string): Promise<any | null> {
  try {
    const result = await chrome.storage.local.get(key);
    const item = result[key] as TransientStorageItem | undefined;

    if (!item) return null;

    const { value, expiry } = item;
    if (expiry && Date.now() > expiry) {
      await chrome.storage.local.remove(key);
      return null;
    }

    if (typeof value === "string" && isCompressed(value)) {
      return decompressString(value);
    }

    return value;
  } catch (error) {
    log(GENERAL_ERROR_LOG, error);
    return null;
  }
}

/**
 * Stores a value in transient storage with automatic expiry.
 * Automatically compresses string values to save storage space.
 *
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @param {number} ttl - Time to live in milliseconds
 */
export async function setTransientStorage(key: string, value: any, ttl: number): Promise<void> {
  try {
    const expiry = Date.now() + ttl;
    const storedValue = typeof value === "string" ? compressString(value) : value;

    await chrome.storage.local.set({
      [key]: {
        type: "transient",
        value: storedValue,
        expiry,
      },
    });
    log(STORAGE_TRANSIENT_SET_LOG, key);
  } catch (error) {
    log(GENERAL_ERROR_LOG, error);
  }
}

/**
 * Removes expired cache entries from local storage.
 * Scans all Just Lyrics cache keys and removes those past their expiry time.
 */
export async function purgeExpiredKeys(): Promise<void> {
  try {
    const now = Date.now();
    const result = await chrome.storage.local.get(null);
    const keysToRemove: string[] = [];

    Object.keys(result).forEach(key => {
      if (key.startsWith("blyrics_")) {
        const item = result[key] as TransientStorageItem;
        if (item.expiry && now >= item.expiry) {
          keysToRemove.push(key);
        }
      }
    });

    if (keysToRemove.length) {
      await chrome.storage.local.remove(keysToRemove);
    }
  } catch (error) {
    log(GENERAL_ERROR_LOG, error);
  }
}
