import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import ArrowDown from "assets/icons/arrow-down";
import ArrowUp from "assets/icons/arrow-up";

import Button from "components/button";
import ColorInput from "components/color-input";

const MoreColoursButton = ({label, isVisible, onClick}) => {
  const posfix = isVisible ? <ArrowUp width={6.33} height={3.22} /> : <ArrowDown width={6.33} height={3.22} />;

  return <Button onClick={onClick} textClass="px-0 text-primary font-weight-medium" transparent>
    {label}
    <span className="ml-1 svg-primary">{posfix}</span>
  </Button>;
}

export default function ThemeColors({ colors, similar, setColor }) {
  const { t } = useTranslation("custom-network");

  const [colorsEntries, setColorsEntries] = useState([]);
  const [moreColorsVisible, setMoreColorsVisible] = useState(false);

  const hasError = !!similar?.length;

  function handleMoreColorsVsibility() {
    setMoreColorsVisible(!moreColorsVisible);
  }

  useEffect(() => {
    setColorsEntries(colors && Object.entries(colors).map(color => ({ label: color[0], code: color[1] })) || []);
  }, [ colors?.primary,
       colors?.secondary,
       colors?.oracle,
       colors?.text,
       colors?.background,
       colors?.shadow,
       colors?.gray,
       colors?.success,
       colors?.danger,
       colors?.warning,
       colors?.info ]);

  return (
    <>
      <div className="row border-radius-8 justify-content-center mb-2 gy-3">
        {
          colorsEntries.slice(0, 3).map(color => 
          <div className="col-12 col-md-4" key={color.label}>
            <ColorInput
              label={color.label}
              code={color.code}
              onChange={setColor}
              error={similar.includes(color.label)}
            />
          </div>)
        }
      </div>

      <MoreColoursButton 
        label={t("steps.network-settings.fields.colors.more-colors")} 
        isVisible={hasError || moreColorsVisible} 
        onClick={handleMoreColorsVsibility} 
      />

      { (hasError || moreColorsVisible) &&
        <div className="row bg-dark-gray p-3 border-radius-8 mt-2 mx-0">
          {
            colorsEntries.slice(3, 15).map(color => 
            <div className="col-12 col-md-4 col-lg-3" key={color.label}>
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

      {(!!similar.length && (
        <p className="p-small text-danger mt-2">
          {t("steps.network-information.fields.colors.similar-colors")}
        </p>
      )) ||
        ""}
    </>
  );
}
