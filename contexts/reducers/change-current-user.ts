import {SimpleAction} from "./reducer";
import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";
import {CurrentUserState} from "../../interfaces/application-state";

export const changeCurrentUser =
  new SimpleAction<CurrentUserState>(AppStateReduceId.CurrentUser, 'currentUser');

