import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
} from "typeorm";

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
}

export default Captcha;
