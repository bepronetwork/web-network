import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import UploadIcon from "assets/icons/upload";

export default function ImageUploader({
  name,
  description = undefined,
  value,
  onChange,
  lg = false,
  error = false,
  className = "",
  isLoading = false,
  accept = ".svg"
}) {
  const { t } = useTranslation("custom-network");

  const [image, setImage] = useState(value);
  
  const dimensions = {
    width: (lg && "150") || "80",
    height: "80"
  };

  function handleChange(event) {
    if (!event.target.files.length) return;
    
    onChange({
      preview: URL.createObjectURL(event.target.files[0]),
      raw: event.target.files[0]
    });
  }

  useEffect(() => {
    setImage(value);
  }, [value?.preview]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center">
      <label
        className={`bg-black image-uploader border border-white-50 rounded-10 ${
          (lg && "lg") || ""
        } d-flex flex-column text-center align-items-center justify-content-center ${
          (error && "error") || ""
        } ${className}`}
        htmlFor={name}
      >
        {isLoading ? (
          <span className="spinner-border spinner-border-xs ml-1" />
        ) : image.preview || typeof image === "string" ? (
          <img
            src={image.preview || image}
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
        accept={accept}
        onChange={handleChange}
      />
    </div>
  );
}
