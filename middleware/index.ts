import withCors from "./withCors";
import WithJwt from "./withJwt";
import {LogAccess} from "./log-access";

const withProtected = (handler) => withCors(WithJwt(handler))
const RouteMiddleware = (handler) => LogAccess(withCors(WithJwt(handler)));

export {withCors, WithJwt, withProtected, RouteMiddleware};