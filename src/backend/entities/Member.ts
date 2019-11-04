import RandomIdEntity from "./RandomIdEntity";
import Session from "./Session";
import { getUnixTimestamp } from "../utils/time";
import { Column, Entity, Index, ManyToOne, PrimaryColumn } from "typeorm";
import config from "config";

const memberIdLength: number = config.get("member.idLength");

/**
 * Note: Member keys are composed of `id` and `sessionId`.
 */
@Entity()
@Index(["id", "sessionId"], { unique: true })
export default class Member extends RandomIdEntity {
  protected static randomIdLength = memberIdLength;

  /**
   * A random id string (auto-generated on insert)
   */
  @PrimaryColumn()
  id: string;

  @ManyToOne(type => Session, session => session.members, { onDelete: "CASCADE" })
  session: Session;

  @PrimaryColumn()
  sessionId: string;

  @Column()
  secret: string;

  @Column()
  understanding: boolean = true;

  /**
   * The creation time as a UNIX timestamp
   */
  @Column("int", { default: getUnixTimestamp })
  createdAt: number;

  /**
   * The UNIX timestamp of the moment when the member's last ping was processed.
   */
  @Column("int", { default: getUnixTimestamp })
  lastPingTime: number;

  async idExists(id: string): Promise<boolean> {
    return (await Member.count({ id, sessionId: this.sessionId })) > 0;
  }

  /**
   * The member's REST API URI (relative to the API root) or undefined, if the member or its session
   * has no id yet or no session has been assigned.
   */
  get uri() {
    if (!this.id || !this.session) return undefined;
    const sessionUri = this.session.uri;
    if (!sessionUri) return undefined;
    return `${sessionUri}/members/${this.id}`;
  }
}
