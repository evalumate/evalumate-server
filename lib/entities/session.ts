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

  @Column({
    length: 10,
  })
  public publicId?: string;

  @Column()
  public name: string;

  @Column()
  public key: string;

  @Column()
  public captchaRequired: boolean;

  @CreateDateColumn()
  public createdAt: Date;
}

export default Session;
