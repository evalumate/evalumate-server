import config from "config";
import { subSeconds } from "date-fns";
import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  MoreThan,
} from "typeorm";

const ttl: number = config.get("captcha.ttl");

// TypeORM query operator to check a date field against a given ttl
export const Alive = (ttl: number) => MoreThan(subSeconds(Date(), ttl));

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

  @CreateDateColumn()
  public createdAt: Date;

  public static findAliveByToken(token: string) {
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
