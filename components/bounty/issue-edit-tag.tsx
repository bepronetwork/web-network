import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import ReactSelect from "react-select";

import { PROGRAMMING_LANGUAGES } from "assets/bounty-labels";

import { useAppState } from "contexts/app-state";

import { MAX_TAGS } from "helpers/contants";

export default function IssueEditTag({ isEdit = false }) {
  const {state} = useAppState();
  const [selectedTags, setSelectedTags] = useState<string[]>();
  const TAGS_OPTIONS = PROGRAMMING_LANGUAGES.map(({ tag }) => ({ label: tag, value: tag }));

  function handleChangeTags(newTags) {
    setSelectedTags(newTags.map(({ value }) => value));
  }

  useEffect(() => {
    setSelectedTags(TAGS_OPTIONS.filter(tag => state.currentBounty?.data?.tags.includes(tag.value)).map(e => e.value))
  }, [state.currentBounty?.data?.tags])

  if (isEdit)
    return (
      <div className="cointainer mb-4">
        <h3 className="caption-large ms-2 mb-2">Tag</h3>
        <Row className="justify-content-center p-0 m-0">
          <Col className="col-12">
          <div className="form-group"               style={{ color: 'black' }}>
            {console.log('tags', state.currentBounty?.data?.tags, TAGS_OPTIONS)}
            <ReactSelect
              value={selectedTags?.map(tag => ({ label: tag, value: tag }))}
              options={TAGS_OPTIONS}
              onChange={handleChangeTags}
              isOptionDisabled={() => selectedTags.length >= MAX_TAGS}
              isMulti
            />
          </div>
          </Col>
        </Row>
      </div>
    );

  return null;
}
