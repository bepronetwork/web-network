import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import ArrowUp from "assets/icons/arrow-up";

import Button from "components/button";
import ColorInput from "components/color-input";

const MoreColoursButton = ({isVisible, onClick}) => {
  const posfix = isVisible ? <span className="ml-1 svg-primary"><ArrowUp width={6.33} height={3.22} /></span> : "...";
  const textClass = isVisible ? "text-primary" : "text-gray text-primary-hover";

  return <Button onClick={onClick} textClass={`px-0 ${textClass}`} transparent>
    More Colours{posfix}
  </Button>;
}

export default function ThemeColors({ colors, similar, setColor }) {
  const { t } = useTranslation("custom-network");

  const [colorsEntries, setColorsEntries] = useState([]);
  const [moreColorsVisible, setMoreColorsVisible] = useState(false);

  function handleMoreColorsVsibility() {
    setMoreColorsVisible(previous => !previous);
  }

  useEffect(() => {
    setColorsEntries(colors && Object.entries(colors).map(color => ({ label: color[0], code: color[1] })) || []);
  }, [colors]);

  return (
    <>
      <label htmlFor="colors" className="caption-small mb-1 text-white">
        {t("steps.network-information.fields.colors.label")}
      </label>

      <div className="d-flex flex-row px-3 border-radius-8 justify-content-center gap-20 mb-2">
        {
          colorsEntries.slice(0, 3).map(color => 
          <div className="col-4" key={color.label}>
            <ColorInput
              label={color.label}
              code={color.code}
              onChange={setColor}
              error={similar.includes(color.label)}
            />
          </div>)
        }
      </div>

      <MoreColoursButton isVisible={moreColorsVisible} onClick={handleMoreColorsVsibility} />

      { moreColorsVisible &&
        <div className="row bg-dark-gray p-3 border-radius-8 mx-0 mt-2">
          {
            colorsEntries.slice(3, 15).map(color => 
            <div className="col-3" key={color.label}>
              <ColorInput
                label={color.label}
                code={color.code}
                onChange={setColor}
                error={similar.includes(color.label)}
              />
            </div>)
          }
        </div>
      }

      {(similar.length && (
        <p className="p-small text-danger mt-2">
          {t("steps.network-information.fields.colors.similar-colors")}
        </p>
      )) ||
        ""}
    </>
  );
}
