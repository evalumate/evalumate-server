import config from "config";
import { subSeconds } from "date-fns";
import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  MoreThan,
} from "typeorm";

// TypeORM query operator to check the createdAt field against a given ttl
export const Alive = (ttl: number) => MoreThan(Date.now() / 1000 - ttl);

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
   * A column storing the creation time as a UNIX timestamp
   */
  @Column({
    default: () => {
      return Date.now() / 1000;
    },
  })
  public createdAt: number;

  public static findAliveByToken(token: string, ttl: number) {
    return this.findOne({
      token: token,
      createdAt: Alive(ttl),
    });
  }

  /**
   * The captcha image as an svg data string.
   *
   * This field is not stored in the database and hence only defined on recently
   * created captcha instances.
   */
  public image: string;
}

export default Captcha;
