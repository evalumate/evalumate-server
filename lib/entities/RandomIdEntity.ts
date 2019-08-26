import generateUuid from "nanoid/async";
import generateUuidWithCustomAlphabet from "nanoid/async/generate";
import { BaseEntity, BeforeInsert, PrimaryColumn } from "typeorm";

/**
 * An abstract base class for TypeORM entities that expose an `id` primary key column which is a
 * random id string of a specifiable length and alphabet
 */
export default abstract class RandomIdEntity extends BaseEntity {
  protected static randomIdLength: number = 21;
  protected static randomIdAlphabet: string;

  /**
   * A random id of a specifiable length and alphabet (auto-generated on insert)
   */
  @PrimaryColumn({ unique: true })
  id: string;

  @BeforeInsert()
  protected async generatePublicId() {
    const length = Object.getPrototypeOf(this).constructor.randomIdLength;
    const alphabet = Object.getPrototypeOf(this).constructor.randomIdAlphabet;

    do {
      if (alphabet) {
        this.id = await generateUuidWithCustomAlphabet(alphabet, length);
      } else {
        this.id = await generateUuid(length);
      }
    } while (await this.idExists(this.id));
  }

  protected async idExists(id: string): Promise<Boolean> {
    return (await Object.getPrototypeOf(this).constructor.count({ id })) > 0;
  }
}
