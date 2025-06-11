declare module 'ioredis' {
  export default class Redis {
    constructor(url: string);
    get(key: string): Promise<string | null>;
    setex(key: string, seconds: number, value: string): Promise<'OK'>;
    del(key: string): Promise<number>;
  }
} 