import LockedIcon from '@assets/icons/locked-icon';
import Modal from '@components/modal';
import {useContext, useEffect, useState} from 'react';
import Button from './button';
import ReactSelect from '@components/react-select';
import useOctokit from '@x-hooks/use-octokit';
import {ApplicationContext} from '@contexts/application';
import { useTranslation } from 'next-i18next';

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
  const [branch, setBranch] = useState();
  const [isCreating, setIsCreating] = useState(false)
  const octo = useOctokit();
  const {state: {accessToken,}} = useContext(ApplicationContext);
  const { t } = useTranslation(['common', 'pull-request'])

  function onSelectedBranch(option) {
    setBranch(option.value);
  }

  function isButtonDisabled(): boolean {
    return [title, description, branch].some(s => !s);
  }

  function setDefaults() {
    setTitle(prTitle);
    setDescription(prDescription)
    setBranch(undefined)
    setIsCreating(false)
  }

  async function handleConfirm() {
    setIsCreating(true)
    await onConfirm({title, description, branch})
  }


  useEffect(setDefaults, [show])
  useEffect(() => {
    if (!accessToken || options.length || !repo)
      return;

    function mapBranches({data: branches}) { return branches.map(({name}) => ({value: name, label: name, isSelected: branch && branch === name}))}
    octo.listBranches(repo).then(mapBranches).then(setOptions).catch(console.log)

  }, [accessToken, repo]);

  return (
    <Modal size="lg" show={show} onCloseClick={onCloseClick} title={t('pull-request:actions.create.title')} titlePosition="center">
      <div className="container">
        <div>
          <div className="form-group">
            <label className="caption-small mb-2 text-gray">{t('forms.create-pull-request.title.label')}</label>
            <input value={title} onChange={e => setTitle(e.target.value)} type="text" className="form-control" placeholder={t('forms.create-pull-request.title.placeholder')}/>
          </div>
        </div>
        <div>
          <div className="form-group">
            <label className="caption-small mb-2 text-gray">{t('forms.create-pull-request.description.label')}</label>
            <textarea value={description}
                      rows={5}
                      onChange={e => setDescription(e.target.value)}
                      className="form-control"
                      placeholder={t('forms.create-pull-request.description.placeholder')} />
          </div>
          <div className="form-group">
            <label className="caption-small mb-2 text-gray">{t('forms.create-pull-request.branch.label')}</label>
            <ReactSelect options={options} onChange={onSelectedBranch} />
          </div>
        </div>
        <div className="d-flex pt-2 justify-content-center">
          <Button className='mr-2' disabled={isButtonDisabled() || isCreating} onClick={handleConfirm}>
            {isButtonDisabled() && <LockedIcon className='me-2'/>}
            <span>{t('pull-request:actions.create.title')}</span>
            {isCreating ? <span className="spinner-border spinner-border-xs ml-1"/> : ''}
          </Button>
          <Button color='dark-gray' onClick={onCloseClick}>{t('actions.cancel')}</Button>
        </div>
      </div>
    </Modal>
  )
}
