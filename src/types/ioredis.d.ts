declare module 'ioredis' {
  import { EventEmitter } from 'events';

  export interface RedisOptions {
    retryStrategy?: (times: number) => number | null | void;
    maxRetriesPerRequest?: number | null;
    enableOfflineQueue?: boolean;
    lazyConnect?: boolean;
    connectTimeout?: number;
    commandTimeout?: number;
  }

  export default class Redis extends EventEmitter {
    constructor(url: string, options?: RedisOptions);
    get(key: string): Promise<string | null>;
    setex(key: string, seconds: number, value: string): Promise<'OK'>;
    del(key: string): Promise<number>;
    connect(): Promise<void>;
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: 'connect', listener: () => void): this;
    on(event: 'ready', listener: () => void): this;
    on(event: 'close', listener: () => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
  }
} 