class Logger {
  constructor(private name: string) {}

  getPrefixMsg(message: string): string {
    return `[${this.name}] ${message}`;
  }

  info(message: string): void {
    console.log(`[${this.name}] ℹ️ INFO: ${message}`);
  }

  success(message: string): void {
    console.log(`[${this.name}] ✔️ SUCCESS: ${message}`);
  }

  error(message: string, error?: unknown): void {
    console.error(`[${this.name}] ✖️ ERROR: ${message}\n`, error);
  }
}

export class LoggerHelper {
  private static instance: Logger;

  static init(name: string) {
    if (!LoggerHelper.instance) {
      LoggerHelper.instance = new Logger(name);
    }

    return LoggerHelper.instance;
  }

  private static getLogger(): Logger {
    if (!LoggerHelper.instance) {
      throw new Error(
        'Logger not initialized. Call LoggerHelper.init(name) first.',
      );
    }
    return LoggerHelper.instance;
  }

  static getPrefixMsg(message: string): string {
    return LoggerHelper.getLogger().getPrefixMsg(message);
  }

  static info(msg: string): void {
    LoggerHelper.getLogger().info(msg);
  }

  static success(msg: string): void {
    LoggerHelper.getLogger().success(msg);
  }

  static error(msg: string, error?: unknown): void {
    LoggerHelper.getLogger().error(msg, error);
  }
}
