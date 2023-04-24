import { createRef, useEffect, useState, RefObject } from "react";

import { useTranslation } from "next-i18next";

import ArrowDown from "assets/icons/arrow-down";
import ArrowUp from "assets/icons/arrow-up";
import CopyIcon from "assets/icons/copy-icon";

import Button from "components/button";
import ColorInput from "components/color-input";

const MoreColoursButton = ({label, isVisible, onClick}) => {
  const posfix = isVisible ? <ArrowUp width={6.33} height={3.22} /> : <ArrowDown width={6.33} height={3.22} />;

  return <Button onClick={onClick} textClass="px-0 text-primary" transparent>
    {label}
    <span className="ml-1 svg-primary">{posfix}</span>
  </Button>;
}

const themeColorsToThemeString = (colors) => {
  return Object.entries(colors).reduce((prev, entry) => `${prev} ${entry[1]}` , "")
}

const ThemeStringInput = ({label, text, error, onChange}) => {
  
  const themeStringInput: RefObject<HTMLInputElement> = createRef();

  const copyContent = (evt)=>{
    const input = themeStringInput.current as HTMLInputElement
    if(input){
      input.select() 
      document.execCommand("copy")
    }
  } 

  const handleChange = (evt) => {
    onChange(evt.target.value)
  }
  
  return <>
      <div className="d-flex flex-column mb-4">
      <span
        className={`caption-small text-${(error && "danger") || "gray"} mt-2 mb-1`}
      >
        {label}
      </span>

          <div
          className={`
          d-flex flex-row align-items-center border-radius-8  cursor-pointer
          `}
          >
          <input
            type="text"
            className={`custom-text-input ${(error && "is-invalid") || ""} form-control`} 
            name={label}
            id={label}
            value={text}
            ref={themeStringInput}
            onChange={handleChange}
            onClick={copyContent}
          />
          <Button
          className="rounded-right ml-1"
          onClick={copyContent}
          ><CopyIcon />
          </Button>
          
          </div>
      </div>
  </>
}

export default function ThemeColors({ colors, similar, setColor }) {
  const { t } = useTranslation("custom-network");

  const [colorsEntries, setColorsEntries] = useState([]);
  const [moreColorsVisible, setMoreColorsVisible] = useState(false);
  const [themeStringText, setThemeStringText] = useState("")
  const [themeStringTextError, setThemeStringTextError] = useState(false)

  const themeInputChanged = (text) => {
    const themeTextColors = text.split(" ").filter((text)=> text !=="").map(val => val.trim())
    const haveSameColorAmount = themeTextColors.length === Object.keys(colors).length
    themeTextColors.forEach((col => console.log(col, /^#(?:[0-9a-fA-F]{6})$/.test(col))))
    const areAllColors = themeTextColors.every((col => /^#(?:[0-9a-fA-F]{6})$/.test(col)))
    const error =  !haveSameColorAmount || !areAllColors

    if(!error){
      Object.entries(colors).forEach((entry, index) => {
        const themeTextColor = themeTextColors[index]

        if(index === 0) console.log(entry[1], themeTextColor, entry[1] !== themeTextColor)
        
        if(entry[1] !== themeTextColor) setColor({label: entry[0], code: themeTextColor})
      })
    }

    setThemeStringTextError(error)
    setThemeStringText(text)
  }

  const hasError = !!similar?.length;

  function handleMoreColorsVsibility() {
    setMoreColorsVisible(!moreColorsVisible);
  }

  useEffect(() => {
    setColorsEntries(colors && Object.entries(colors).map(color => ({ label: color[0], code: color[1] })) || []);
    setThemeStringText(themeColorsToThemeString(colors))
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
      <div className="row border-radius-8 justify-content-center mb-2">
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

      <MoreColoursButton 
        label={t("steps.network-settings.fields.colors.more-colors")} 
        isVisible={hasError || moreColorsVisible} 
        onClick={handleMoreColorsVsibility} 
      />

      { (hasError || moreColorsVisible) &&
        <div className="row bg-dark-gray p-3 border-radius-8 mt-2 mx-0">
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

      <ThemeStringInput
        label="Theme String"
        error={themeStringTextError}
        text={themeStringText}
        onChange={themeInputChanged}
      />

      {(!!similar.length && (
        <p className="p-small text-danger mt-2">
          {t("steps.network-information.fields.colors.similar-colors")}
        </p>
      )) ||
        ""}
    </>
  );
}
