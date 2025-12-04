export class Logger {
  static wait(message: string): void {
    console.log(`[${process.env.NAME}] ⏳ WAIT: ${message}`);
  }

  static info(message: string): void {
    console.log(`[${process.env.NAME}] ℹ️ INFO: ${message}`);
  }

  static success(message: string): void {
    console.log(`[${process.env.NAME}] ✔️ SUCCESS: ${message}`);
  }

  static error(message: string, error?: unknown): void {
    console.error(`[${process.env.NAME}] ✖️ ERROR: ${message}\n`, error);
  }
}
