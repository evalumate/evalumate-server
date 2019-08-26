import Session from "./entities/Session";
import Member from "./entities/Member";

declare global {
  namespace Express {
    interface Request {
      session?: Session;
      member?: Member;
    }
  }
}
