import Jimp from "jimp";
import { position, write } from "../jimp-tools";

const bg = `${process.env.NEXT_HOME_URL}/images/bg-bounty-card.png`;
const icon = `${process.env.NEXT_HOME_URL}/images/bepro-icon.png`;

async function doHeding({ ghId, state }: { ghId: string; state: string }) {
  var headerContainer = new Jimp(232, 48);

  async function doState() {
    var statusContainer = new Jimp(109, 48, "#4250E4");
    const statusText = await write(state, 35, "white", "bold");
    return await position(statusContainer, statusText, 50, 50);
  }

  const status = await doState();
  const idText = await write(ghId, 33, "#6E6F75", "semi");

  headerContainer = await position(headerContainer, status, 0, 0);
  headerContainer = await position(headerContainer, idText, 100, 50);

  return headerContainer;
}

async function doSubTitle({
  repoName,
  ammoutValue,
}: {
  repoName: string;
  ammoutValue: string;
}) {
  async function doRepo() {
    const borderSize = 2;
    const padding = 10;
    const color = "#4250E4";
    const repoText = await write(repoName, 25, color);

    var repoContainer = new Jimp(
      repoText.bitmap.width + padding,
      repoText.bitmap.height + padding
    );

    var repoBorder = new Jimp(
      repoContainer.bitmap.width + borderSize,
      repoContainer.bitmap.height + borderSize,
      color
    );
    repoBorder = await position(repoBorder, repoContainer, 50, 50);
    repoBorder.mask(repoContainer, borderSize / 2, borderSize / 2);
    repoBorder = await position(repoBorder, repoText, 50, 50);

    return repoBorder;
  }

  async function doAmmount() {
    var ammountContainer = new Jimp(503, 84);
    const ammountText = await write(ammoutValue, 70, "white");
    const statusText = await write("$BEPRO", 38, "#4250E4");
    ammountContainer = await position(ammountContainer, ammountText, 0, 50);
    ammountContainer = await position(ammountContainer, statusText, 100, 50);
    return ammountContainer;
  }

  const repo = await doRepo();
  const ammount = await doAmmount();
  const width = repo.bitmap.width + ammount.bitmap.width + 20;
  const height = repo.bitmap.height + ammount.bitmap.height + 20;

  var container = new Jimp(width, height);

  container = await position(container, repo, 0, 0);
  container = await position(container, ammount, 0, 100);

  return container;
}

async function doTitle(title: string) {
  // const title = `Remove all getContract functions from \nApplication and instead calling the Object \ndirectly`;
  var titleContainer = new Jimp(1080, 174);
  const statusText = await write(title, 48, "white", "bold");

  titleContainer = await position(titleContainer, statusText, 0, 0);

  return titleContainer;
}

async function doFooter({
  working,
  pr,
  proposal,
}: {
  working: number;
  pr: number;
  proposal: number;
}) {
  var container = new Jimp(1080, 85);
  const logo = await Jimp.read(icon);

  async function doLabel(value = "", label = "") {
    const margin = 24;
    const valueText = await write(value.toString(), 38, "white", "semi");
    const labelText = await write(label.toString(), 38, "#6E6F75");
    const width = Math.max(labelText.bitmap.width, valueText.bitmap.width);
    const height = labelText.bitmap.height + valueText.bitmap.height + margin;

    var containerLabel = new Jimp(width, height);
    containerLabel = await position(containerLabel, valueText, 0, 0);
    containerLabel = await position(containerLabel, labelText, 0, 100);
    return containerLabel;
  }

  const labels = [
    {
      label: "WORKING",
      value: working,
    },
    {
      label: "PULL REQUESTS",
      value: pr,
    },
    {
      label: "PROPOSALS",
      value: proposal,
    },
  ];

  container = await position(container, logo, 100, 50);

  await Promise.all(
    labels.map(async (element, i) => {
      const label = await doLabel(`${element.value}`, element.label);
      container = await position(container, label, i * 35, 50);
    })
  );

  return container;
}

export interface IGenerateCard {
  state: string;
  issueId: string;
  title: string;
  repo: string;
  ammount: string;
  working: number;
  pr: number;
  proposal: number;
}

interface IGenerateResp{
  width: number,
  heigth: number,
  data: Buffer,
}

export async function generateCard(issue: IGenerateCard): Promise<IGenerateResp> {
  var container = await Jimp.read(bg);
  var contain = new Jimp(1080, 510);

  const heading = await doHeding({ghId: issue.issueId, state: issue.state});
  const title = await doTitle(issue.title);
  const subTitle = await doSubTitle({repoName: issue.repo, ammoutValue: issue.ammount});
  const footer = await doFooter({working: issue.working, pr: issue.pr, proposal: issue.proposal});

  const elements = [
    {
      item: heading,
      x: 0,
      y: 0,
    },
    {
      item: title,
      x: 0,
      y: 35,
    },
    {
      item: subTitle,
      x: 0,
      y: 65,
    },
    {
      item: footer,
      x: 0,
      y: 100,
    },
  ];

  contain = await position(contain, heading, 0, 0);
  contain = await position(contain, title, 0, 35);
  contain = await position(contain, subTitle, 0, 65);
  contain = await position(contain, footer, 0, 100);

  var { bitmap } = await position(container, contain, 50, 50);

  return {
    width: bitmap.width,
    heigth: bitmap.height,
    data: bitmap.data,
  };
}
