import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";

@Entity()
class Session extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column()
  public name: string;

  @Column()
  public key: string;

  @Column()
  public captchaRequired: boolean;

  /**
   * A column storing the creation time as a UNIX timestamp
   */
  @Column({
    default: () => Date.now() / 1000,
  })
  public createdAt: number;
}

export default Session;
