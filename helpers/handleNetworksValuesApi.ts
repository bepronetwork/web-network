const handleNetwork = (issues) =>
  issues
    .map((issue) => {
      if(issue.network)
        issue.network.dataValues = {
          networkAddress: issue.network.networkAddress,
          name: issue.network.name,
          logoIcon: issue.network.logoIcon,
          colors: { primary: issue.network?.colors?.primary },
          chain: {
            chainId: issue.network?.chain?.chainId,
            chainShortName: issue.network?.chain?.chainShortName,
            color: issue.network?.chain?.color
          },
          networkToken: {
            name: issue?.network?.networkToken?.name,
            symbol: issue?.network?.networkToken?.symbol,
            address: issue?.network?.networkToken?.address,
          }
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
