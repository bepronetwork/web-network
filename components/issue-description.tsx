import React, { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import MarkedRender from "components/MarkedRender";

interface DescriptionProps { description: string; isEdit?: boolean}

export default function IssueDescription({ description, isEdit = false }: DescriptionProps) {
  const { t } = useTranslation(["common", "bounty"]);
  const [body, setBody] = useState<string>();

  useEffect(() => {
    setBody(description)
  },[description])


  function handleChangeBody(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setBody(e.target.value)
  }

  return (
    <>
      <h3 className="caption-large mb-3">{t("misc.description")}</h3>
      <div className="bg-dark-gray p-3 rounded">
        <div className="p p-1">
          {isEdit ? (
          <textarea
            className={"form-control border border-1 border-danger border-radius-8 bg-dark-gray"}
            placeholder={t("bounty:fields.description.placeholder")}
            value={body}
            rows={24}
            wrap="soft"
            onChange={handleChangeBody}
          />
          ):
          (
            <MarkedRender source={description} />
          )}
        </div>
      </div>
    </>
  );
}