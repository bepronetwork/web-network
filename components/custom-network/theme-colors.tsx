import { createRef, useEffect, useState, RefObject } from "react";

import { useTranslation } from "next-i18next";

import ArrowDown from "assets/icons/arrow-down";
import ArrowUp from "assets/icons/arrow-up";
import CopyIcon from "assets/icons/copy-icon";

import Button from "components/button";
import ColorInput from "components/color-input";
import { ThemeColors } from "interfaces/network";

const MoreColoursButton = ({label, isVisible, onClick}) => {
  const posfix = isVisible ? <ArrowUp width={6.33} height={3.22} /> : <ArrowDown width={6.33} height={3.22} />;

  return <Button onClick={onClick} textClass="px-0 text-primary" transparent>
    {label}
    <span className="ml-1 svg-primary">{posfix}</span>
  </Button>;
}


const ThemeStringInput = ({label, updateKey=0, initialText, error, onChange, onBlur, onPaste}) => {
  
  const themeStringInput: RefObject<HTMLInputElement> = createRef();

  const copyContent = ()=>{
    const input = themeStringInput.current as HTMLInputElement
    if(input){
      input.select() 
      document.execCommand("copy")
    }
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
          {/* The update key is used to force a rerender on the input component when a color input changed. */}
          <div key={updateKey}>
            <input
              type="text"
              className={`caption custom-text-input ${(error && "is-invalid") || ""} form-control`} 
              name={label}
              id={label}
              defaultValue={initialText}
              ref={themeStringInput}
              onChange={onChange}
              
              /*
              The changes are applied on blur and paste 
              to avoid funky behavior when manually editing
              the text
              */
              onPaste={onPaste}
              onBlur={onBlur}

              /*
              As the primary use case is to just paste values in. 
              It is more convenient to select all for a quick paste.
              Instead of having to select everything manually.
              */
              onFocus={(evt)=>evt.target.select()} 
            />
          </div>
          <Button
          className="rounded-right ml-1"
          onClick={copyContent}
          ><CopyIcon />
          </Button>
          
          </div>
      </div>
  </>
}

export default function ThemeColors ({ colors, similar, setColor } : {colors:ThemeColors, similar:string[], setColor: any}) {
  const { t } = useTranslation("custom-network");

  const [colorsEntries, setColorsEntries] = useState([]);
  const [moreColorsVisible, setMoreColorsVisible] = useState(false);
  const [themeInputError, setThemeInputError] = useState(false)
  const [themeInputUpdateKey, setThemeInputUpdateKey] = useState(0)


  const deconstructThemeInputString = (text) => {
    const colors = text.split(",").map(v => v.trim()).filter((t)=> t)
    return {text, colors}
  }
  const isThemeInputStringValid = (rawText) => {
    const {text, colors} = deconstructThemeInputString(rawText)
    return  text.match(new RegExp(`((#([\\da-f]{3}){1,2}),?){${Object.keys(colors).length}}`,'gi')); // match # followed by a group of 3 numbers or letters from a to f, that can be repeated max 2 times, followed by the possibility of a comma to exist. do this eagerly and case-insensitive
  }

  const updateThemeColors = (event) => {
    const {text, colors:themeTextColors} = deconstructThemeInputString(event.target.value)

    if(isThemeInputStringValid(text)){
      Object.entries(colors).forEach(([label, originalCode], index) => {
        const code = themeTextColors[index].toLowerCase()
        if(originalCode.toLowerCase() !== code){
          setColor({label, code})
        }
      })
    }
  }

  const themeInputStringChanged = (event) => {
    const text = event.target.value
    setThemeInputError(!isThemeInputStringValid(text))
  }

  //Called when a single ColorInput field changes value.
  const colorInputChanged = (color) => {
    setColor(color)
    // As we defined the string as defaultValue
    setThemeInputUpdateKey(themeInputUpdateKey+1)
  }

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
      <div className="row border-radius-8 justify-content-center mb-2">
        {
          colorsEntries.slice(0, 3).map(color => 
          <div className="col-4" key={color.label}>
            <ColorInput
              label={color.label}
              code={color.code}
              onChange={colorInputChanged}
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
                onChange={colorInputChanged}
                error={similar.includes(color.label)}
              />
            </div>)
          }
        </div>
      }

      <ThemeStringInput
        label="Theme String"
        error={themeInputError}
        updateKey={themeInputUpdateKey}
        initialText={Object.values(colors).join(",")}
        onChange={themeInputStringChanged}
        onBlur={updateThemeColors}
        onPaste={
          // The onPaste event only contains the 'before paste'
          // data. So we need to workaround it with this small hack.
          (e)=>setTimeout(()=>updateThemeColors(e))
        }
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
