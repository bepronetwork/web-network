import { useEffect, useState } from "react";

import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

export default function MarkedRender({ className = "", source = "_loading..._" }) {
  const [innerHtml, setInnerHtml] = useState<{ __html: string }>(null);

  useEffect(() => {
    setInnerHtml({
      __html: sanitizeHtml(marked(source), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"])
      })
    });
  }, [source]);

  return (
    <div className={`marked-render ${className}`} dangerouslySetInnerHTML={innerHtml}></div>
  );
}
