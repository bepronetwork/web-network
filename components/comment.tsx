import { formatDate } from '@helpers/formatDate'
import Avatar from './avatar'
import MarkedRender from './MarkedRender'

export default function Comment({ comment }) {
  return (
    <div className="mb-3">
      <p className="caption-small text-uppercase mb-2 text-bold">
        <Avatar userLogin={comment?.user.login} />

        <span className="ml-1">@{comment?.user.login} </span>

        <span className="trans ml-1">
          {comment?.updated_at && formatDate(comment?.updated_at)}
        </span>
      </p>

      <p className="p-small content-wrapper child mb-0 comment">
        <MarkedRender source={comment?.body || `_No comment available_`} />
      </p>
    </div>
  )
}
