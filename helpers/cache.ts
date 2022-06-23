class MiniCache {
  cache: { [x: string]: any; };
    
  constructor() {
    this.cache = {};
  }

  get(keys: (string|number)[]) {
    const data = this.cache[keys.join(":")];
    
    if (!data || this.isExpired(data?.expiresAt)) return;
    
    return this.cache[keys.join(":")].data;
  }

  set(keys: (string|number)[], value, expiration = 60) {
    this.cache[keys.join(":")] = {
      ...value,
      expiresAt: this.getExpiration(expiration)
    };
  }

  getExpiration(seconds: number) {
    return Date.now() + 1000 * seconds;
  }

  isExpired(expiresAt: number) {
    return Date.now() > expiresAt;
  }
}

export default MiniCache;