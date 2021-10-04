import { GetStaticProps } from "next";

export default function IssueAvatars({ users }) {
  return (
    <div className="avatar-list mr-1">
      {users.map((user, index) => {
        if (index < 3) {
          return (
            <img
              className="avatar circle-3"
              src={user.avatar_url || "https://img.pizza/28/28"}
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
        <div
          className="d-inline "
          data-bs-toggle="tooltip"
          data-bs-html="true"
          title={users
            .filter((_users, index) => index > 2)
            .map((nextUser) => ` ${nextUser.login}`)}
        >
          <span className="p-1 avatar-number circle-3">+{users.length > 99 ? `99` : users.length - 3}</span>
        </div>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
