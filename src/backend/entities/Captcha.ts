import RandomIdEntity from "./RandomIdEntity";
import { OlderThan, YoungerThan } from "../utils/query-operators";
import { getUnixTimestamp } from "../utils/time";
import { Column, Entity } from "typeorm";

@Entity()
export default class Captcha extends RandomIdEntity {
  @Column()
  public solution: string;

  /**
   * The creation time as a UNIX timestamp
   */
  @Column("int", { default: getUnixTimestamp })
  createdAt: number;

  public static findAliveById(id: string, ttl: number) {
    return this.findOne({ id, createdAt: YoungerThan(ttl) });
  }

  /**
   * Removes all captchas from the database that have been created more than
   * `ttl` seconds ago.
   *
   * @param ttl The time to live for a captcha in seconds
   */
  public static deleteExpired(ttl: number) {
    return Captcha.getRepository().delete({ createdAt: OlderThan(ttl) });
  }

  /**
   * The captcha image as an svg data string.
   *
   * This field is not stored in the database and hence only defined on locally created captcha
   * instances.
   */
  public image: string;
}
