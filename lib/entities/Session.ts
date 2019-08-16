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
  id?: number;

  @Column()
  name: string;

  @Column()
  key: string;

  @Column()
  captchaRequired: boolean;

  /**
   * A column storing the creation time as a UNIX timestamp
   */
  @Column({
    default: () => Date.now() / 1000,
  })
  createdAt: number;

  /**
   * The public-facing id. It is inferred from `id` and not stored in the
   * database. Hence, it is only available on locally created session objects.
   */
  publicId: string;

  /**
   * If `publicId` is defined, returns the session's REST API URI.
   */
  getUri() {
    return this.publicId ? `/api/sessions/${this.publicId}` : undefined;
  }
}

export default Session;
