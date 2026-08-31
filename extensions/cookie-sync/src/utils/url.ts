import {config} from '../config.js';

export function isTargetUrl(url: string): boolean {
  return config.targetUrlRegex.test(url);
}
