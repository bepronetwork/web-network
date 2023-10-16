import { useTranslation } from "next-i18next";

import { ContainerTypeFlex } from "components/bounty/create-bounty/sections/review/container-type/view";
import If from "components/If";
import MarkedRender from "components/MarkedRender";

interface ReviewProps {
  [name: string]: string | string[];
}

export interface CreateBountyReviewSectionProps {
  payload: ReviewProps;
}

type Value = string | string[];

export default function CreateBountyReviewSection({
  payload,
}: CreateBountyReviewSectionProps) {
  const { t } = useTranslation(["bounty"]);

  return (
    <div className="mt-2">
      <h5>
        {t("bounty:steps.review")}
      </h5>

      <p className="text-gray mb-4">
        {t("bounty:descriptions.review")}
      </p>

      {Object.entries(payload).map(([name, value]: [string, Value], key) => {
        if(!value || value?.length === 0) return null;
        return (
          <ContainerTypeFlex key={key}>
            <div className="col-md-3 text-gray text-capitalize">
              {name.replace("_", " ")}
            </div>

            <div className="col-md-9 text-truncate">
              { Array.isArray(value) ?
                <div className="d-flex flex-wrap">
                  {value.map((item, key) => (
                    <div className="d-flex" key={key}>
                      <div className="ball tag mt-2 mx-2" key={key} />

                      {item}
                    </div>
                  ))}
                </div> :
                <If 
                  condition={name === "description"}
                  otherwise={value}
                >
                  <MarkedRender source={String(value)} />
                </If>
              }
            </div>
          </ContainerTypeFlex>
        )
      })}
    </div>
  );
}
