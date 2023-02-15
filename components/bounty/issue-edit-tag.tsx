import { useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import ReactSelect from "react-select";

import { useTranslation } from "next-i18next";

import { PROGRAMMING_LANGUAGES } from "assets/bounty-labels";

import { ContextualSpan } from "components/contextual-span";

import { useAppState } from "contexts/app-state";

import { MAX_TAGS } from "helpers/contants";

interface IssueEditTagProps {
  isEdit: boolean;
  selectedTags: string[];
  setSelectedTags: (v: string[]) => void;
}

export default function IssueEditTag({
  selectedTags,
  setSelectedTags,
  isEdit = false,
}: IssueEditTagProps) {
  const { t } = useTranslation(["bounty"]);
  const { state } = useAppState();

  const TAGS_OPTIONS = PROGRAMMING_LANGUAGES.map(({ tag }) => ({
    label: tag,
    value: tag,
  }));

  function handleChangeTags(newTags) {
    setSelectedTags(newTags.map(({ value }) => value));
  }

  useEffect(() => {
    setSelectedTags(TAGS_OPTIONS.filter((tag) =>
        state.currentBounty?.data?.tags.includes(tag.value)).map((e) => e.value));
  }, [state.currentBounty?.data?.tags]);

  if (isEdit)
    return (
      <div className="cointainer mb-4 form-group">
        <h3 className="caption-large ms-2 mb-2">{t("tags")}</h3>
        <Row className="justify-content-center p-0 m-0 form-group">
          <Col className="col-12">
            {console.log("tags", state.currentBounty?.data?.tags, TAGS_OPTIONS)}
            <ReactSelect
              value={selectedTags?.map((tag) => ({ label: tag, value: tag }))}
              options={TAGS_OPTIONS}
              onChange={handleChangeTags}
              isOptionDisabled={() => selectedTags.length >= MAX_TAGS}
              isMulti
            />
          </Col>
          <Col>
            <ContextualSpan context="info" className="mt-1">
              {t("fields.tags-info")}
            </ContextualSpan>
          </Col>
        </Row>
      </div>
    );

  return null;
}
