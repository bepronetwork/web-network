import Modal from '@components/modal';
import {useEffect, useState} from 'react';
import ButtonTrans from '@components/button-trans';

export default function CreatePullRequestModal({
                                                 show = false,
                                                 onConfirm = ({title, description}) => {},
                                                 onCloseClick = () => {},
                                                 title: prTitle = ``,
                                                 description: prDescription = ``
                                               }) {
  const [title, setTitle] = useState(``);
  const [description, setDescription] = useState(``);

  function setDefaults() {
    setTitle(prTitle);
    setDescription(prDescription)
  }

  useEffect(setDefaults, [show])

  return (
    <Modal show={show} onCloseClick={onCloseClick} title="Create pull request">
      <div>
        <div>
          <div className="form-group">
            <label className="p-small trans mb-2">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} type="text" className="form-control" placeholder="Descriptive title for your PR"/>
          </div>
        </div>
        <div>
          <div className="form-group">
            <label className="p-small trans mb-2">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="form-control" placeholder="Describe your implementation"/>
          </div>
        </div>
        <div className="d-flex justify-content-center">
          <ButtonTrans opac={true} className="mr-2" disabled={!title && !description} onClick={() => onConfirm({title, description})}>start working</ButtonTrans>
          <ButtonTrans opac={true}  onClick={onCloseClick}>cancel</ButtonTrans>
        </div>
      </div>
    </Modal>
  )
}
