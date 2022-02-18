import { ReduceActionName } from '@interfaces/enums/reduce-action-names'
import { ReduceAction, ReduceActor } from '@interfaces/reduce-action'
import {
  ApplicationState,
  ChangeNetworkSummaryProps
} from '@interfaces/application-state'

const reducer = (state: ApplicationState, payload): ApplicationState => {
  if (payload.action === 'reset') return { ...state, networksSummary: {
    bounties: 0,
    amountInNetwork: 0,
    amountDistributed: 0
  } } 

  const value = state.networksSummary[payload.label] + payload?.amount

  const networksSummary = {
    bounties: payload?.label === 'bounties' ? value : state.networksSummary.bounties,
    amountInNetwork: payload?.label === 'amountInNetwork' ? value : state.networksSummary.amountInNetwork,
    amountDistributed: payload?.label === 'amountDistributed' ? value : state.networksSummary.amountDistributed
  }

  return { ...state, networksSummary }
}

export const ChangeNetworksSummary: ReduceAction<ChangeNetworkSummaryProps> = {
  name: ReduceActionName.ChangeNetworksSummary,
  fn: reducer
}

export const changeNetworksSummary = (
  payload: ChangeNetworkSummaryProps
): ReduceActor<ChangeNetworkSummaryProps> => ({
  name: ReduceActionName.ChangeNetworksSummary,
  payload
})
