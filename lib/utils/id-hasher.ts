import config from "config";
import Hashids from "hashids";
import cryptoRandomString from "crypto-random-string";
import farmhash from "farmhash";

let salt: string = config.get("hashIdSalt");
if (salt == null) {
  salt = cryptoRandomString({ length: 64 });
}

/**
 * A class to encode and decode ids
 */
class IdHasher {
  private hashids: Hashids;

  /**
   * Creates a new IdHasher.
   * @param identifier An arbitrary string that is unique to the IdHasher's use
   * case
   */
  public constructor(identifier: string) {
    this.hashids = new Hashids(farmhash.hash64(salt + identifier));
  }

  public encode = this.hashids.encode;
  public decode = this.hashids.decode;
}

export default IdHasher;
