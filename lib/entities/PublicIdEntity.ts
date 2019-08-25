import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import IdHasher from "../utils/IdHasher";
import { ObjectType } from "typeorm/common/ObjectType";
import { AfterInsert, AfterLoad, BaseEntity, PrimaryGeneratedColumn, FindOptions } from "typeorm";

/**
 * An abstract base class for TypeORM entities that expose a `publicId` which is generated from the
 * `id` column's value.
 */
export default abstract class PublicIdEntity extends BaseEntity {
  protected static idHasher: IdHasher;

  @PrimaryGeneratedColumn()
  id?: number;

  /**
   * The public-facing id (generated from `id` on insert or load)
   */
  publicId: string;

  @AfterInsert()
  @AfterLoad()
  protected generatePublicId() {
    const idHasher: IdHasher = Object.getPrototypeOf(this).constructor.idHasher;
    this.publicId = idHasher.encode((this as any).id!);
  }

  static getIdByPublicId<T extends PublicIdEntity>(this: ObjectType<T>, publicId: string) {
    const idHasher: IdHasher = (this as any).idHasher;
    const id = idHasher.decodeSingle(publicId);
    return id;
  }

  static findOneByPublicId<T extends PublicIdEntity>(
    this: ObjectType<T>,
    publicId: string,
    additionalFindOptions?: FindOptions<T>
  ): Promise<T | undefined> {
    const id = (this as any).getIdByPublicId(publicId);
    if (typeof id === "undefined") {
      throw new EntityNotFoundException((this as any).name);
    }
    const findOptions = additionalFindOptions ? { id, ...additionalFindOptions } : { id };
    return (this as any).findOne(findOptions);
  }
}
