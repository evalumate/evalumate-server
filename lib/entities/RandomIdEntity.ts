import generateUuid from "nanoid/async";
import generateUuidWithCustomAlphabet from "nanoid/async/generate";
import {
  BaseEntity,
  BeforeInsert,
  PrimaryColumn,
  SaveOptions,
  QueryFailedError,
  Repository,
} from "typeorm";

/**
 * An abstract base class for TypeORM entities that expose an `id` primary key column which is a
 * unique random id string of a specifiable length and alphabet
 */
export default abstract class RandomIdEntity extends BaseEntity {
  protected static randomIdLength: number = 21;
  protected static randomIdAlphabet: string;

  /**
   * A unique random id of a specifiable length and alphabet (auto-generated on insert)
   */
  @PrimaryColumn({ unique: true })
  id: string;

  @BeforeInsert()
  protected async generatePublicId() {
    const length = Object.getPrototypeOf(this).constructor.randomIdLength;
    const alphabet = Object.getPrototypeOf(this).constructor.randomIdAlphabet;

    if (alphabet) {
      this.id = await generateUuidWithCustomAlphabet(alphabet, length);
    } else {
      this.id = await generateUuid(length);
    }
  }

  save(options?: SaveOptions): Promise<this> {
    const repository = (this.constructor as any).getRepository();

    const saveWithRetry = (timesLeft: number): Promise<this> => {
      try {
        return repository.save(this, options);
      } catch (error) {
        if (error instanceof QueryFailedError && this.idExists(this.id) && timesLeft > 0) {
          // Unique constraint error due to duplicate id. Trying again with a new id, automatically
          // generated thanks to @BeforeInsert
          return saveWithRetry(timesLeft - 1);
        }
        throw error;
      }
    };

    return saveWithRetry(3); // On duplicate ids, regenerate the id up to three times before failing
  }

  protected async idExists(id: string): Promise<Boolean> {
    return (await Object.getPrototypeOf(this).constructor.count({ id })) > 0;
  }
}
