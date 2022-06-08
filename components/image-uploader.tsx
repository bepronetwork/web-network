import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import UploadIcon from "assets/icons/upload";

export default function ImageUploader({
  name,
  description,
  value,
  onChange,
  lg = false,
  error = false,
  className = ""
}) {
  const { t } = useTranslation("custom-network");

  const [image, setImage] = useState(value);
  
  const dimensions = {
    width: (lg && "150") || "80",
    height: "80"
  };

  function handleChange(event) {
    if (!event.target.files.length) return;
    const newImage = {
      preview: URL.createObjectURL(event.target.files[0]),
      raw: event.target.files[0]
    };
    
    setImage(newImage);
    onChange(image);
  }

  useEffect(() => {
    setImage(value);
  }, [value]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center">
      <label
        className={`bg-black image-uploader ${
          (lg && "lg") || ""
        } border-radius-8 d-flex flex-column text-center align-items-center justify-content-center ${
          (error && "error") || ""
        } ${className}`}
        htmlFor={name}
      >
        {image.preview ? (
          <img
            src={image.preview}
            alt="dummy"
            width={dimensions.width}
            height={dimensions.height}
          />
        ) : (
          <>
            <UploadIcon />
            <span className="caption-small mt-3">{description}</span>
          </>
        )}
      </label>
      {error && (
        <small className="text-danger small-info mt-1">
          {t("errors.invalid-format")}
        </small>
      )}

      <input
        type="file"
        id={name}
        style={{ display: "none" }}
        accept=".svg"
        onChange={handleChange}
      />
    </div>
  );
}
