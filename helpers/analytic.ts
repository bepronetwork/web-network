import {Analytic, AnalyticType,} from "../interfaces/analytics";

export const analytic = <T = any>(type: AnalyticType): Analytic => ({type,});