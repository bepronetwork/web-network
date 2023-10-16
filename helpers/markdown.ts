import { IFilesProps } from "components/drag-and-drop";

export function addFilesToMarkdown(markdown: string, files: IFilesProps[], ipfsUrl: string) {
  const strFiles = files?.filter(file => file.uploaded)?.map(file =>
  `${file?.type?.split("/")[0] === "image" ? "!" : ""}[${file?.name}](${ipfsUrl}/${file?.hash}) \n\n`);

  return `${markdown}\n\n${strFiles
  .toString()
  .replace(",![", "![")
  .replace(",[", "[")}`;
}