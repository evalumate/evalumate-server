import config from "config";
import { Column, Entity, OneToMany } from "typeorm";

import { getUnixTimestamp } from "../utils/time";
import Member from "./Member";
import RandomIdEntity from "./RandomIdEntity";
import Record from "./Record";

const sessionIdLength: number = config.get("session.idLength");

@Entity()
export default class Session extends RandomIdEntity {
  protected static randomIdLength = sessionIdLength;
  protected static randomIdAlphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstwxyz"; // No lookalikes
  protected static randomIdNoBadWords = true;

  @Column()
  name: string;

  @Column()
  key: string;

  @Column()
  captchaRequired: boolean;

  @OneToMany((type) => Member, (member) => member.session)
  members: Member[];

  @OneToMany((type) => Record, (record) => record.session)
  records: Record[];

  /**
   * The creation time as a UNIX timestamp
   */
  @Column("int", { default: getUnixTimestamp })
  createdAt: number;

  /**
   * The session's REST API URI (relative to the API root) or undefined, if the session has no id
   * yet.
   */
  get uri() {
    if (!this.id) return undefined;
    return `/sessions/${this.id}`;
  }
}
