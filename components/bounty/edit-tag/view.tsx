import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import { ContextualSpan } from "components/contextual-span";
import ReactSelect from "components/react-select";

import { MAX_TAGS } from "helpers/constants";

import { GroupedSelectOption, SelectOption } from "types/utils";

import BountyTagsView from "../bounty-tags/view";

interface BountyEditTagViewProps {
  isEdit: boolean;
  selectedTags: string[];
  preview?: boolean;
  handleChangeTags: (tags: SelectOption[]) => void;
  tagsOptions: GroupedSelectOption[];
}

export default function BountyEditTagView({
  selectedTags,
  isEdit = false,
  preview = false,
  handleChangeTags,
  tagsOptions,
}: BountyEditTagViewProps) {
  const { t } = useTranslation(["bounty"]);

  if (isEdit)
    return (
      <div className="cointainer mb-4 form-group">
        <h3 className="caption-large ms-2 mb-2">{t("tags")}</h3>
        <Row className="justify-content-center p-0 m-0 form-group">
          {preview ? (
            <Col className="col-12">
              <BountyTagsView tags={selectedTags} />
            </Col>
          ) : (
            <>
              <Col className="col-12 text-black">
                <ReactSelect
                  value={selectedTags?.map((tag) => ({
                    label: tag,
                    value: tag,
                  }))}
                  options={tagsOptions}
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
