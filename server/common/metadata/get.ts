import axios from "axios";
import * as cheerio from 'cheerio';
import { NextApiRequest, NextApiResponse } from "next";

import { Logger } from "services/logging";

interface Metadata {
  title: string;
  description: string;
  ogImage?: string;
  ogVideo?: string;
}

export default async function get(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ message: "Invalid URL" });
    }

    let html;

    await axios.get(url)
    .then(({data}) => html = data)
    .catch(() => res.status(400).json({ message: "Invalid URL" }));

    const loadHtml = cheerio.load(html)

    const metadata: Metadata = {
      title: "",
      description: "",
    };

    loadHtml("meta").map((_, element) => {
      const name =
        loadHtml(element).attr("name") || loadHtml(element).attr("property");
      const content = loadHtml(element).attr("content");

      if (name && content) {
        if (name === "description") {
          metadata.description = content;
        } else if (name === "og:image") {
          metadata.ogImage = content;
        } else if (name === "og:video") {
          metadata.ogVideo = content;
        }
      }
    });

    return res.status(200).json(metadata);
  } catch (error) {
    Logger.error(error, "metadata endpoint error", req);
    res.status(error?.status || 500).json(error?.message || error?.toString());
  }
}
