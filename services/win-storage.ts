export class WinStorage<T = any> {
  constructor(readonly key: string,
              readonly expire: number = 3600,
              readonly type: "localStorage" | "sessionStorage" = "localStorage",) {}

  setItem(value: T) {
    if (typeof window === "undefined")
      return;

    window[this.type].setItem(this.key, JSON.stringify({value, time: +new Date()}));
  }

  getItem(): T {
    if (typeof window === "undefined")
      return undefined;

    const entry = window[this.type]?.getItem(this.key);

    if (!entry)
      return undefined;

    try {
      const {value, time} = JSON.parse(entry);
      if (this.expire && +new Date() > time + this.expire) {
        this.setItem(undefined);
        return undefined;
      }

      return value;
    } catch (e) {
      console.debug(`Failed to parse ${this.key} from ${this.type}`);
      return undefined;
    }

  }

  removeItem(): void {
    if (typeof window === "undefined")
      return undefined;

    window[this.type]?.removeItem(this.key);
  }

  get value() { return this.getItem(); }
  set value(v) { this.setItem(v); }
}