import LockedIcon from '@assets/icons/locked-icon';
import Modal from '@components/modal';
import {useContext, useEffect, useState} from 'react';
import Button from './button';
import ReactSelect from '@components/react-select';
import useOctokit from '@x-hooks/use-octokit';
import {ApplicationContext} from '@contexts/application';

export default function CreatePullRequestModal({
                                                 show = false,
                                                 onConfirm = ({title, description, branch}) => {},
                                                 onCloseClick = () => {}, repo = ``,
                                                 title: prTitle = ``,
                                                 description: prDescription = ``
                                               }) {
  const [title, setTitle] = useState(``);
  const [description, setDescription] = useState(``);
  const [options, setOptions] = useState([]);
  const [branch, setBranch] = useState([]);
  const octo = useOctokit();
  const {state: {accessToken,}} = useContext(ApplicationContext);

  function onSelectedBranch(option) {
    setBranch(option.value);
  }

  function isButtonDisabled(): boolean {
    return [title, description, branch].some(s => !s);
  }

  function setDefaults() {
    setTitle(prTitle);
    setDescription(prDescription)
  }


  useEffect(setDefaults, [show])
  useEffect(() => {
    if (!accessToken || options.length || !repo)
      return;

    function mapBranches({data: branches}) { return branches.map(({name}) => ({value: name, label: name, isSelected: branch && branch === name}))}
    octo.listBranches(repo).then(mapBranches).then(setOptions)

  }, [accessToken, repo]);

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
          <div className="form-group">
            <label className="smallCaption trans mb-2 text-white-50 text-uppercase">Select a branch</label>
            <ReactSelect options={options} onChange={onSelectedBranch} />
          </div>
        </div>
        <div className="d-flex justify-content-center">
          <Button className='mr-2 pull-request-button' disabled={isButtonDisabled()} onClick={() => onConfirm({title, description, branch})}>{isButtonDisabled() && <LockedIcon className='me-2'/>}Create pull request</Button>
          <Button color='dark-gray' onClick={onCloseClick}>cancel</Button>
        </div>
      </div>
    </Modal>
  )
}
