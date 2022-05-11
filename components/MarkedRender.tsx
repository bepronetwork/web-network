import sanitizeHtml from 'sanitize-html';
import * as marked from 'marked';
import {useEffect, useState} from 'react';
export default function MarkedRender({source = `_loading..._`}) {
  const [innerHtml, setInnerHtml] = useState<{__html: string}>(null)

  useEffect(() => {
    setInnerHtml({__html: sanitizeHtml(marked(source))})
  }, [source])

  return <div dangerouslySetInnerHTML={innerHtml}></div>
}
