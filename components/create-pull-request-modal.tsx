import LockedIcon from '@assets/icons/locked-icon';
import Modal from '@components/modal';
import {useEffect, useState} from 'react';
import Button from './button';

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
  const isButtonDisabled = (): boolean => [
    title.length < 1 || !title,
    description.length < 1 || !description
  ].some(values => values)
  return (
    <Modal show={show} onCloseClick={onCloseClick} title="Create Pull Request" titlePosition="center">
      <div>
        <div>
          <div className="form-group">
            <label className="smallCaption trans mb-2 text-white-50 text-uppercase">Issue Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} type="text" className="form-control" placeholder="Your Issue Title"/>
          </div>
        </div>
        <div>
          <div className="form-group">
            <label className="smallCaption trans mb-2 text-white-50 text-uppercase">Description</label>
            <textarea value={description}
                      rows={5}
                      onChange={e => setDescription(e.target.value)}
                      className="form-control"
                      placeholder="Type a description..." />
          </div>
        </div>
        <div className="d-flex justify-content-center">
          <Button className='mr-2 pull-request-button' disabled={isButtonDisabled()} onClick={() => onConfirm({title, description})}>{isButtonDisabled() && <LockedIcon className='me-2'/>}Create pull request</Button>
          <Button color='dark-gray' onClick={onCloseClick}>cancel</Button>
        </div>
      </div>
    </Modal>
  )
}
