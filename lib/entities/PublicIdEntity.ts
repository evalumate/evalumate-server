import generateUuid from "nanoid/async";
import generateUuidWithCustomAlphabet from "nanoid/async/generate";
import { ObjectType } from "typeorm/common/ObjectType";
import {
  BaseEntity,
  BeforeInsert,
  FindOptions,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from "typeorm";

/**
 * An abstract base class for TypeORM entities that expose a `publicId` which is a unique, indexed
 * random id string of a specifiable length and alphabet
 */
export default abstract class PublicIdEntity extends BaseEntity {
  protected static publicIdLength: number = 21;
  protected static publicIdAlphabet: string;

  @PrimaryGeneratedColumn()
  id?: number;

  /**
   * The public-facing id (auto-generated on insert)
   */
  @Index()
  @Column({ unique: true })
  publicId: string;

  @BeforeInsert()
  protected async generatePublicId() {
    const idLength = Object.getPrototypeOf(this).constructor.publicIdLength;
    const alphabet = Object.getPrototypeOf(this).constructor.publicIdAlphabet;

    do {
      if (alphabet) {
        this.publicId = await generateUuidWithCustomAlphabet(alphabet, idLength);
      } else {
        this.publicId = await generateUuid(idLength);
      }
    } while (await Object.getPrototypeOf(this).constructor.publicIdExists(this.publicId));
  }

  protected static async publicIdExists<T extends PublicIdEntity>(
    this: ObjectType<T>,
    publicId: string
  ): Promise<Boolean> {
    const findOptions = { publicId };
    const count = await (this as any).count(findOptions);
    return count > 0;
  }

  static findOneByPublicId<T extends PublicIdEntity>(
    this: ObjectType<T>,
    publicId: string,
    additionalFindOptions?: FindOptions<T>
  ): Promise<T | undefined> {
    const findOptions = additionalFindOptions
      ? { publicId, ...additionalFindOptions }
      : { publicId };
    return (this as any).findOne(findOptions);
  }
}
