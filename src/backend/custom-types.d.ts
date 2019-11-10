import Session from "./entities/Session";
import Member from "./entities/Member";
import { Store } from "redux";

declare global {
  namespace Express {
    interface Request {
      session?: Session;
      member?: Member;
      reduxState?: any;
    }
  }
}
