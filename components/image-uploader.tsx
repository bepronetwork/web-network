import { useEffect, useState } from 'react'

import UploadIcon from '@assets/icons/upload'

export default function ImageUploader({
  name,
  description,
  onChange,
  lg = false,
  error = false
}) {
  const [image, setImage] = useState({ preview: '', raw: '' })
  const dimensions = {
    width: (lg && '150') || '80',
    height: '80'
  }

  function handleChange(event) {
    if (event.target.files.length)
      setImage({
        preview: URL.createObjectURL(event.target.files[0]),
        raw: event.target.files[0]
      })
  }

  useEffect(() => {
    onChange({ label: name, value: image })
  }, [image])

  return (
    <div>
      <label
        className={`bg-black image-uploader ${
          (lg && 'lg') || ''
        } border-radius-8 d-flex flex-column text-center align-items-center justify-content-center ${
          (error && 'error') || ''
        }`}
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
      {error && <small className="text-danger small-info">Invalid format</small>}

      <input
        type="file"
        id={name}
        style={{ display: 'none' }}
        accept=".svg"
        onChange={handleChange}
      />
    </div>
  )
}
