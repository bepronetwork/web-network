import { useState } from 'react'

import UploadIcon from '@assets/icons/upload'

export default function ImageUploader({ name, description }) {
  const [image, setImage] = useState({ preview: '', raw: '' })

  function handleChange(event) {
    if (event.target.files.length)
      setImage({
        preview: URL.createObjectURL(event.target.files[0]),
        raw: event.target.files[0]
      })
  }

  function handleUpload() {}

  return (
    <div>
      <label
        className="bg-black image-uploader border-radius-8 d-flex flex-column text-center align-items-center justify-content-center"
        htmlFor={name}
      >
        {image.preview ? (
          <img src={image.preview} alt="dummy" width="50" height="50" />
        ) : (
          <>
            <UploadIcon />
            <span className="caption-small mt-3">{description}</span>
          </>
        )}
      </label>

      <input
        type="file"
        id={name}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </div>
  )
}
