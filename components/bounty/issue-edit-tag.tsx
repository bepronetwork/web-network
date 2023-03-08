import { useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import ReactSelect from "react-select";

import { useTranslation } from "next-i18next";

import { PROGRAMMING_LANGUAGES } from "assets/bounty-labels";

import BountyTags from "components/bounty/bounty-tags";
import { ContextualSpan } from "components/contextual-span";

import { useAppState } from "contexts/app-state";

import { MAX_TAGS } from "helpers/constants";

interface IssueEditTagProps {
  isEdit: boolean;
  selectedTags: string[];
  setSelectedTags: (v: string[]) => void;
  preview?: boolean;
}

export default function IssueEditTag({
  selectedTags,
  setSelectedTags,
  isEdit = false,
  preview = false,
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
        state.currentBounty?.data?.tags?.includes(tag.value)).map((e) => e.value));
  }, [state.currentBounty?.data?.tags]);

  if (isEdit)
    return (
      <div className="cointainer mb-4 form-group">
        <h3 className="caption-large ms-2 mb-2">{t("tags")}</h3>
        <Row className="justify-content-center p-0 m-0 form-group">
          {preview ? (
            <Col className="col-12">
              <BountyTags tags={selectedTags} />
            </Col>
          ): (
            <>
              <Col className="col-12 text-black">
                <ReactSelect
                  value={selectedTags?.map((tag) => ({ label: tag, value: tag }))}
                  options={TAGS_OPTIONS}
                  onChange={handleChangeTags}
                  isOptionDisabled={() => selectedTags.length >= MAX_TAGS}
                  isMulti
                />
              </Col>
              <Col>
                <ContextualSpan context="info" className="mt-2">
                  {t("fields.tags-info")}
                </ContextualSpan>
              </Col>
            </>
          )}
        </Row>
      </div>
    );

  return null;
}
