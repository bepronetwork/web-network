import {useEffect, useState} from "react";

import {useTranslation} from "next-i18next";

import Button from "components/button";
import ContractButton from "components/contract-button";
import Modal from "components/modal";

interface props {
  show: boolean,
  onConfirm: (arg: { title:string , description:string }) => Promise<void>;
  onCloseClick: () => void;
  title: string;
  description: string;
}

export default function CreatePullRequestModal({
  show = false,
  onConfirm,
  onCloseClick,
  title: prTitle = "",
  description: prDescription = ""
}: props) {

  if(!show)
    return <></>

  const { t } = useTranslation(["common", "pull-request"]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  function isButtonDisabled(): boolean {
    return [title, description].some((s) => !s);
  }

  function setDefaults() {
    setTitle(prTitle);
    setDescription(prDescription);
    setIsCreating(false);
  }

  function handleConfirm() {
    setIsCreating(true);
    onConfirm({ title, description }).finally(() =>
      setIsCreating(false));
  }

  useEffect(setDefaults, [show]);

  return (
    <Modal
      size="lg"
      show={show}
      onCloseClick={onCloseClick}
      onCloseDisabled={isCreating}
      title={t("pull-request:actions.create.title")}
      footer={
        (
          <div className="d-flex justify-content-between">
          <Button color="dark-gray" onClick={onCloseClick} disabled={isCreating}>
              {t("actions.cancel")}
            </Button>

            <ContractButton
              disabled={isButtonDisabled() || isCreating}
              onClick={handleConfirm}
              withLockIcon={isButtonDisabled()}
              isLoading={isCreating}
            >
              <span>{t("pull-request:actions.create.title")}</span>
            </ContractButton>
          </div>
        )
      }
      titlePosition="center">
      <div className="container">
        <div>
          <div className="form-group">
            <label className="caption-small mb-2 text-gray" title={t("forms.is.required")}>
              {t("forms.create-pull-request.title.label")} *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              className="form-control"
              placeholder={t("forms.create-pull-request.title.placeholder")}
            />
          </div>
        </div>
        <div>
          <div className="form-group">
            <label className="caption-small mb-2 text-gray" title={t("forms.is.required")}>
              {t("forms.create-pull-request.description.label")} *
            </label>
            <textarea
              value={description}
              rows={5}
              onChange={(e) => setDescription(e.target.value)}
              className="form-control"
              placeholder={t("forms.create-pull-request.description.placeholder")}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}