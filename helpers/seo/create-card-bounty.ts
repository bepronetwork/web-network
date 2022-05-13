import Jimp from "jimp";
import getConfig from "next/config";

import { position, write } from "../jimp-tools";

const { publicRuntimeConfig } = getConfig()
const bg = `${publicRuntimeConfig.homeUrl}/images/bg-bounty-card.png`;
const icon = `${publicRuntimeConfig.homeUrl}/images/bepro-icon.png`;
const repoMask = `${publicRuntimeConfig.homeUrl}/images/mask-issue-repo.png`;
const stateMask = `${publicRuntimeConfig.homeUrl}/images/mask-issue-state.png`;

async function doHeading({
  issueId,
  state
}: {
  issueId: string;
  state: string;
}) {
  async function doState() {
    const padding = 8;
    function getColorState(state) {
      switch (state?.toLowerCase()) {
      case "draft": {
        return "#c4c7d3";
      }
      case "open": {
        return "#4250E4";
      }
      case "in progress": {
        return "#4250E4";
      }
      case "canceled": {
        return "#20222b";
      }
      case "closed": {
        return "#20222b";
      }
      case "ready": {
        return "#35e0ad";
      }
      case "done": {
        return "#35e0ad";
      }
      case "disputed": {
        return "#eb5757";
      }
      default: {
        return "#4250E4";
      }
      }
    }
    const statusText = await write(state.toUpperCase(),
                                   35,
                                   state.toLowerCase() === "draft" ? "black" : "white",
                                   "bold",
                                   {
        // lineSpacing: 3.5,
                                   });

    let statusContainer = new Jimp(statusText.bitmap.width + padding,
      statusText.bitmap.height + padding,
      getColorState(state));
    const mask = await Jimp.read(stateMask);
    mask.resize(statusContainer.bitmap.width,
                statusContainer.bitmap.height,
                Jimp.RESIZE_BEZIER);
    statusContainer = await position(statusContainer, statusText, 50, 50);
    statusContainer.mask(mask, 0, 0);
    return statusContainer;
  }

  const status = await doState();
  const idText = await write(`#${issueId}`, 33, "#6E6F75", "regular");
  const margin = 10;
  const width = status.bitmap.width + idText.bitmap.width + margin;
  const height = Math.max(status.bitmap.height, idText.bitmap.height);
  let headerContainer = new Jimp(width, height);
  headerContainer = await position(headerContainer, status, 0, 0);
  headerContainer = await position(headerContainer, idText, 100, 50);

  return headerContainer;
}

async function doSubTitle({
  repoName,
  ammoutValue
}: {
  repoName: string;
  ammoutValue: number;
}) {
  async function doRepo() {
    const borderSize = 4;
    const padding = 10;
    const color = "#4250E4";
    const repoText = await write(repoName.toUpperCase(), 24, color, "semi");

    const repoContainer = new Jimp(repoText.bitmap.width + padding,
      repoText.bitmap.height + padding);

    let repoBorder = new Jimp(repoContainer.bitmap.width + borderSize,
      repoContainer.bitmap.height + borderSize,
      color);
    repoBorder = await position(repoBorder, repoContainer, 50, 50);
    const mask = await Jimp.read(repoMask);
    mask.resize(repoBorder.bitmap.width,
                repoBorder.bitmap.height,
                Jimp.RESIZE_BEZIER);
    repoBorder.mask(mask, 0, 0);
    // repoBorder.mask(repoContainer, borderSize / 2, borderSize / 2);
    repoBorder = await position(repoBorder, repoText, 50, 50);

    return repoBorder;
  }

  async function doAmmount() {
    const value = new Intl.NumberFormat("en").format(ammoutValue);
    const ammountText = await write(value, 70, "white", "semi", {});
    const currencyText = await write("$BEPRO", 38, "#4250E4", "regular", {});
    const margin = 10;
    const width = ammountText.bitmap.width + currencyText.bitmap.width + margin;
    const height = Math.max(ammountText.bitmap.height,
                            currencyText.bitmap.height);
    let ammountContainer = new Jimp(width, height);

    ammountContainer = await position(ammountContainer, ammountText, 0, 50);
    ammountContainer = await position(ammountContainer, currencyText, 100, 50);
    return ammountContainer;
  }

  const repo = await doRepo();
  const ammount = await doAmmount();
  const margin = 50;
  const width = Math.max(repo.bitmap.width, ammount.bitmap.width);
  const height = repo.bitmap.height + ammount.bitmap.height + margin;

  let container = new Jimp(width, height);

  container = await position(container, repo, 0, 0);
  container = await position(container, ammount, 0, 100);

  return container;
}

async function doTitle(title: string) {
  title = `${title.substring(0, 115).trimEnd()}`;
  title = title.length > 105 ? `${title}...` : title;
  try {
    title = title?.split(" ").reduce((p, c) => {
      const lines = p.split("\n");
      const currentLine = lines[lines.length - 1].length || 0;
      return currentLine + (c.length % 48) > 40 ? `${p} \n${c}` : `${p} ${c}`;
    });
  } catch {
    title
  }

  const titleText = await write(title || "", 48, "white", "semi");
  let titleContainer = new Jimp(1080, 174);
  titleContainer = await position(titleContainer, titleText, 0, 0);

  return titleContainer;
}

async function doFooter({
  working,
  pr,
  proposal
}: {
  working: number;
  pr: number;
  proposal: number;
}) {
  let container = new Jimp(1080, 85);
  const logo = await Jimp.read(icon);

  async function doLabel(value = "", label = "") {
    const margin = 24;
    const valueText = await write(value.toString(), 38, "white", "bold");
    const labelText = await write(label.toString(), 38, "#6E6F75", "semi");
    const width = Math.max(labelText.bitmap.width, valueText.bitmap.width);
    const height = labelText.bitmap.height + valueText.bitmap.height + margin;

    let containerLabel = new Jimp(width, height);
    containerLabel = await position(containerLabel, valueText, 0, 0);
    containerLabel = await position(containerLabel, labelText, 0, 100);
    return containerLabel;
  }

  const labels = [
    {
      label: "WORKING",
      value: working
    },
    {
      label: "PULL REQUESTS",
      value: pr
    },
    {
      label: "PROPOSALS",
      value: proposal
    }
  ];

  container = await position(container, logo, 100, 50);

  await Promise.all(labels.map(async (element, i) => {
    const label = await doLabel(`${element.value}`, element.label);
    container = await position(container, label, i * 35, 50);
  }));

  return container;
}

export interface IGenerateCard {
  state: string;
  issueId: string;
  title: string;
  repo: string;
  ammount: number;
  working: number;
  pr: number;
  proposal: number;
}

interface IGenerateResp {
  width: number;
  heigth: number;
  data: Buffer;
  buffer: any;
}

export async function generateCard(issue: IGenerateCard): Promise<IGenerateResp> {
  const container = await Jimp.read(bg);
  let contain = new Jimp(1080, 510);

  const heading = await doHeading({
    issueId: issue.issueId,
    state: issue.state
  });
  const title = await doTitle(issue.title);
  const subTitle = await doSubTitle({
    repoName: issue.repo,
    ammoutValue: issue.ammount
  });
  const footer = await doFooter({
    working: issue.working,
    pr: issue.pr,
    proposal: issue.proposal
  });

  contain = await position(contain, heading, 0, 0);
  contain = await position(contain, title, 0, 28);
  contain = await position(contain, subTitle, 0, 63);
  contain = await position(contain, footer, 0, 100);

  const image = await position(container, contain, 50, 50);
  const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

  return {
    width: image.bitmap.width,
    heigth: image.bitmap.height,
    data: image.bitmap.data,
    buffer
  };
}
