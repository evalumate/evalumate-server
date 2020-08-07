import Member from "./entities/Member";
import Session from "./entities/Session";

declare global {
  namespace Express {
    interface Request {
      session?: Session;
      member?: Member;
    }
  }
}
