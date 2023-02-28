import {LogAccess} from "middleware/log-access";
import withCors from "middleware/withCors";
import WithJwt from "middleware/withJwt";

const withProtected = (handler) => withCors(WithJwt(handler))
const RouteMiddleware = (handler) => LogAccess(withCors(WithJwt(handler)));

export {withCors, WithJwt, withProtected, RouteMiddleware};