export class WinStorage<T = any> {
  constructor(readonly key: string,
              readonly expire: number = 3600,
              readonly type: "localStorage" | "sessionStorage" = "localStorage",) {}

  setItem(value: any) {
    if (typeof window === "undefined")
      return;

    window[this.type].setItem(this.key, JSON.stringify({value, time: +new Date()}));
  }

  getItem(): T {
    if (typeof window === "undefined")
      return undefined;

    const entry = window[this.type].getItem(this.key);

    if (!entry)
      return undefined;

    const {value, time} = JSON.parse(entry);
    if (this.expire && +new Date() > time + this.expire)
      return undefined;

    return value;
  }

  get value() { return this.getItem(); }
  set value(v) { this.setItem(v); }
}