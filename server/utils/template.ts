import fs from "fs";
import Handlebars from "handlebars";
import path from "path";

interface TemplateData {
  [key: string]: string | number;
}

export class TemplateProcessor {
  private html: string;

  constructor(private readonly templatePath: string) {}

  load(): Promise<string> {
    return new Promise((resolve, reject) => {
      const filePath = path.resolve(...this.templatePath.split("/"));

      fs.readFile(filePath, { encoding: "utf8" }, (err, data) => {
        if (err)
          reject(err);
        else {
          this.html = data;

          resolve(data);
        }
      });
    });
  }

  async compile(data: TemplateData): Promise<string> {
    if (!this.html)
      await this.load();

    const template = Handlebars.compile(this.html);

    return template(data);
  }
}