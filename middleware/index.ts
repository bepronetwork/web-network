import {LogAccess} from "./log-access";
import withCors from "./withCors";
import WithJwt from "./withJwt";

const withProtected = (handler) => withCors(WithJwt(handler))
const RouteMiddleware = (handler) => LogAccess(withCors(WithJwt(handler)));

export {withCors, WithJwt, withProtected, RouteMiddleware};