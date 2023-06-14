export default function BountyAvatarsView({ users }) {
  return (
    <div className="avatar-list mr-1">
      {users.slice(0, 3).map(user=> {
        return (
          <img
            className="avatar circle-3"
            src={user && `https://github.com/${user}.png` || "https://img.pizza/28/28"}
            alt={user}
            key={user}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title={user}
          />
        );
      })}

      {users.length > 3 && (
        <div
          className="d-inline "
          data-bs-toggle="tooltip"
          data-bs-html="true"
          title={users
            .slice(3)
            .map(user => ` ${user}`)}
        >
          <span className="p-1 avatar-number circle-3">
            +{users.length > 99 ? "99" : users.length - 3}
          </span>
        </div>
      )}
    </div>
  );
}