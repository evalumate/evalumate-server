import config from "config";
import Hashids from "hashids";
import cryptoRandomString from "crypto-random-string";
import xxhash from "xxhashjs";

let salt: string = config.get("ids.hashSalt");
if (salt == null) {
  salt = cryptoRandomString({ length: 32 });
}

let idLength: number = config.get("ids.length");

/**
 * A class to encode and decode ids
 */
class IdHasher extends Hashids {
  /**
   * Creates a new IdHasher.
   * @param identifier An arbitrary string that is unique to the IdHasher's use
   * case
   */
  public constructor(identifier: string) {
    super(
      xxhash.h64(salt + identifier, 0).toString(),
      idLength,
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ123456789"
    );
  }

  /**
   * Like decode, but only returns a single number (the first one that was
   * decoded), not an array
   * @param hash The hash string to be decoded
   */
  public decodeSingle(hash: string) {
    return this.decode(hash)[0];
  }
}

export default IdHasher;
