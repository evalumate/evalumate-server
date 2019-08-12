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

  // TODO make api url customizable
  public getUri(): string | undefined {
    return this.publicId ? `/api/sessions/{$this.publicId}` : undefined;
  }

  public static findOneByPublicId(publicId: string) {
    return this.findOne({
      publicId: publicId,
    });
  }
}

export default Session;
