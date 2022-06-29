import { useTranslation } from "next-i18next";

export default function CreateBountyDetails({
  bountyTitle,
  setBountyTitle,
  bountyDescription,
  setBountyDescription,
}) {
  const { t } = useTranslation("create-bounty");

  return (
    //TODO: ADDING FILES
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-12 m-0">
          <div className="form-group">
            <label className="caption-small mb-2">
              {t("fields.title.label")}
            </label>
            <input
              type="text"
              className="form-control rounded-lg"
              placeholder={t("fields.title.placeholder")}
              value={bountyTitle}
              onChange={(e) => setBountyTitle(e.target.value)}
            />
            <p className="p-small text-gray trans mt-2">
              {t("fields.title.tip")}
            </p>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="caption-small mb-2">
          {t("fields.description.label")}
        </label>
        <textarea
          className="form-control"
          rows={3}
          placeholder={t("fields.description.placeholder")}
          value={bountyDescription}
          onChange={(e) => setBountyDescription(e.target.value)}
        />
      </div>
    </div>
  );
}
