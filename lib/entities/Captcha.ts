import config from "config";
import { subSeconds } from "date-fns";
import { BaseEntity, Column, Entity, LessThan, MoreThan, PrimaryGeneratedColumn } from "typeorm";

// TypeORM query operators to check the createdAt field against a given ttl
export const Alive = (ttl: number) => MoreThan(Date.now() / 1000 - ttl);
export const Expired = (ttl: number) => LessThan(Date.now() / 1000 - ttl);

@Entity()
class Captcha extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({
    length: 32,
  })
  public token: string;

  @Column()
  public solution: string;

  /**
   * The creation time as a UNIX timestamp
   */
  @Column({ default: () => Date.now() / 1000 })
  createdAt: number;

  public static findAliveByToken(token: string, ttl: number) {
    return this.findOne({
      token: token,
      createdAt: Alive(ttl),
    });
  }

  /**
   * Removes all captchas from the database that have been created more than
   * `ttl` seconds ago.
   *
   * @param ttl The time to live for a captcha in seconds
   */
  public static deleteExpired(ttl: number) {
    return Captcha.createQueryBuilder()
      .delete()
      .from(Captcha)
      .where(Expired(ttl))
      .execute();
  }

  /**
   * The captcha image as an svg data string.
   *
   * This field is not stored in the database and hence only defined on recently created captcha
   * instances.
   */
  public image: string;
}

export default Captcha;
