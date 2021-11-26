import sanitizeHtml from 'sanitize-html';
import * as marked from 'marked';
import {useEffect, useState} from 'react';
export default function MarkedRender({source = `_loading..._`}) {
  const [innerHtml, setInnerHtml] = useState<{__html: string}>(null)

  useEffect(() => {
    console.log('marked', marked(source))
    console.log('sanitize', sanitizeHtml(marked(source), {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])
    }))

    setInnerHtml({__html: sanitizeHtml(marked(source), {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])
    })})
  }, [source])

  return <div dangerouslySetInnerHTML={innerHtml}></div>
}
