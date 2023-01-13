const newNetworkObj = (issue) => ({
  name: issue.network?.name,
  logoIcon: issue.network?.logoIcon,
  colors: {
    primary: issue.network?.colors?.primary,
  },
});

const handleNetwork = (issues) =>
  issues?.map((issue) => {
    if (issue?.network) {
      issue.network.dataValues = newNetworkObj(issue);
    }
    return issue;
  });

export default function handleNetworkValues(issues) {
  if (issues?.rows) {
    return {
      ...issues,
      rows: handleNetwork(issues.rows),
    };
  } else if (issues?.length > 0) {
    return handleNetwork(issues);
  } else return issues;
}
