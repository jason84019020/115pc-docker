export class Logger {
  static wait(message: string): void {
    console.log(`[Unknown] ⏳ WAIT: ${message}`);
  }

  static info(message: string): void {
    console.log(`[Unknown] ℹ️ INFO: ${message}`);
  }

  static success(message: string): void {
    console.log(`[Unknown] ✔️ SUCCESS: ${message}`);
  }

  static error(message: string, error?: unknown): void {
    console.error(`[Unknown] ✖️ ERROR: ${message}\n`, error);
  }
}
