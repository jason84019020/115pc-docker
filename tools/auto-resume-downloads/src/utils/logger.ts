import {config} from '../config';

export class Logger {
  static wait(message: string): void {
    console.log(`[${config.name}] ⏳ WAIT: ${message}`);
  }

  static info(message: string): void {
    console.log(`[${config.name}] ℹ️ INFO: ${message}`);
  }

  static success(message: string): void {
    console.log(`[${config.name}] ✔️ SUCCESS: ${message}`);
  }

  static error(message: string, error?: unknown): void {
    console.error(`[${config.name}] ✖️ ERROR: ${message}\n`, error);
  }
}
