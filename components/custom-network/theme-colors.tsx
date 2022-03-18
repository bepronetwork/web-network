import { useTranslation } from "next-i18next";

import ColorInput from "components/color-input";

export default function ThemeColors({ colors, similar, setColor }) {
  const { t } = useTranslation("custom-network");

  return (
    <>
      <label htmlFor="colors" className="caption-small mb-2">
        {t("steps.network-information.fields.colors.label")}
      </label>

      <div className="row bg-dark-gray p-3 border-radius-8 justify-content-center text-center mx-0 gap-20">
        {colors &&
          Object.entries(colors).map((color) => {
            return (
              (color[0] !== "secondary" && (
                <div className="col-2" key={color[0]}>
                  <ColorInput
                    label={color[0]}
                    value={color[1]}
                    onChange={setColor}
                    error={similar.includes(color[0])}
                  />
                </div>
              )) ||
              ""
            );
          })}
      </div>

      {(similar.length && (
        <p className="p-small text-danger mt-2">
          {t("steps.network-information.fields.colors.similar-colors")}
        </p>
      )) ||
        ""}
    </>
  );
}
