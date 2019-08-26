import RandomIdEntity from "./RandomIdEntity";
import Session from "./Session";
import { Column, Entity, Index, ManyToOne, PrimaryColumn } from "typeorm";

/**
 * Note: Member keys are composed of `id` and `sessionId`.
 */
@Entity()
@Index(["id", "sessionId"], { unique: true })
export default class Member extends RandomIdEntity {
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
  @Column({ default: () => Date.now() / 1000 })
  createdAt: number;

  protected async idExists(id: string): Promise<Boolean> {
    return (await Member.count({ id, sessionId: this.sessionId })) > 0;
  }

  /**
   * The member's REST API URI or undefined, if the member or its session has no id yet or no
   * session has been assigned.
   */
  get uri() {
    if (!this.id || !this.session) return undefined;
    const sessionUri = this.session.uri;
    if (!sessionUri) return undefined;
    return `${sessionUri}/members/${this.id}`;
  }
}
