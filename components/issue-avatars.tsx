import { GetStaticProps } from "next";

export default function IssueAvatars({ users }) {
  return (
    <div className="avatar-list mr-1">
      {users.map((user, index) => {
        if (index < 3) {
          return (
            <img
              className="avatar circle-3"
              src={user.avatar_url}
              alt={user.login}
              key={user.id}
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title={user.login}
            />
          );
        }
      })}
      {users.length > 3 && (
        <span
          className="avatar circle-3  ms-1"
          data-bs-toggle="tooltip"
          data-bs-html="true"
          title={users
            .filter((_users, index) => index > 2)
            .map((nextUser) => ` ${nextUser.login}`)}
        >
          {users.length - 3}+
        </span>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
