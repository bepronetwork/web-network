const handleNetwork = (issues) =>
  issues
    .map((issue) => {
      if(issue.network)
        issue.network.dataValues = {
          name: issue.network.name,
          logoIcon: issue.network.logoIcon, 
          colors: { primary: issue.network.colors.primary }
        }
      return issue
    });

export default function handleNetworkValues(issues) {
  if (issues?.rows) {
    return {
      ...issues,
      rows: handleNetwork(issues.rows),
    };
  } else if (Array.isArray(issues) && issues?.length > 0) {
    return handleNetwork(issues);
  } else return issues;
}
