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

  /**
   * A column storing the creation time as a UNIX timestamp
   */
  @Column({
    default: () => {
      return Date.now() / 1000;
    },
  })
  public createdAt: number;

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
