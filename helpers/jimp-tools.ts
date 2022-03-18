// import text2png from 'text2png'
import Jimp from "jimp";

interface OptiosProps {
  font?: string;
  textAlign?: string;
  color?: string;
  backgroundColor?: string;
  lineSpacing?: number;
  strokeWidth?: number;
  strokeColor?: string;
  padding?: number;
  paddingLeft?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  borderWidth?: number;
  borderLeftWidth?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderColor?: string;
  localFontPath?: string;
  localFontName?: string;
  output?: string;
}

const fontBold = "assets/fonts/seo/SpaceGrotesk-Bold.ttf";
const fontSemiBold = "assets/fonts/seo/SpaceGrotesk-SemiBold.ttf";
const fontRegular = "assets/fonts/seo/SpaceGrotesk-Regular.ttf";

export async function position(base: Jimp, image: Jimp, x = 0, y = 0) {
  const baseIMG = new Jimp(base);
  const positionIMG = new Jimp(image);

  let x_axis = 0;
  let y_axis = 0;

  x = x / 100;
  y = y / 100;

  x_axis = Math.ceil(baseIMG.bitmap.width * x - positionIMG.bitmap.width / 2);
  y_axis = Math.ceil(baseIMG.bitmap.height * y - positionIMG.bitmap.height / 2);

  if (x_axis <= 0) {
    x_axis = 0;
  } else if (x_axis > baseIMG.bitmap.width - positionIMG.bitmap.width) {
    x_axis = Math.ceil(baseIMG.bitmap.width - positionIMG.bitmap.width);
  }

  if (y_axis <= 0) {
    y_axis = 0;
  } else if (y_axis > baseIMG.bitmap.height - positionIMG.bitmap.height) {
    y_axis = Math.ceil(baseIMG.bitmap.height - positionIMG.bitmap.height);
  }

  return baseIMG.composite(positionIMG, x_axis, y_axis);
}

export async function write(
  text: string,
  fontSize = 16,
  textColor = "white",
  fontFamily?: string,
  options?: OptiosProps
) {
  let localFontPath = fontRegular;

  if (fontFamily === "bold") {
    localFontPath = fontBold;
  } else if (fontFamily === "semi") {
    localFontPath = fontSemiBold;
  }

  const buffer = "";
  // TODO: Find other choice to text2png
  // const buffer = text2png(text, {
  //   font: `${fontSize}px SpaceGrotesk-${fontFamily}`,
  //   textColor,
  //   localFontPath,
  //   localFontName: `SpaceGrotesk-${fontFamily}`,
  //   padding: 2,
  //   ...options,
  // });

  return await Jimp.read(Buffer.from(buffer, "base64"));
}
