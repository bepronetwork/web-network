import withCors from "./withCors";
import WithJwt from "./withJwt";

const withProtected = (handler) => withCors(WithJwt(handler))
export {withCors, WithJwt, withProtected}