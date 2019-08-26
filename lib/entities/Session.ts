import Member from "./Member";
import PublicIdEntity from "./PublicIdEntity";
import config from "config";
import { Column, Entity, OneToMany } from "typeorm";

const sessionIdLength: number = config.get("ids.sessionIdLength");

@Entity()
export default class Session extends PublicIdEntity {
  protected static publicIdLength = sessionIdLength;
  protected static publicIdAlphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstwxyz"; // No lookalikes

  @Column()
  name: string;

  @Column()
  key: string;

  @Column()
  captchaRequired: boolean;

  @OneToMany(type => Member, member => member.session)
  members: Member[];

  /**
   * The creation time as a UNIX timestamp
   */
  @Column({ default: () => Date.now() / 1000 })
  createdAt: number;

  /**
   * The session's REST API URI or undefined, if the session has no id yet.
   */
  get uri() {
    if (!this.publicId) return undefined;
    return `/api/sessions/${this.publicId}`;
  }
}
