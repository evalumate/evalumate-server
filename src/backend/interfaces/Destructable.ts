interface Destructable {
  /**
   * Executes shutdown tasks (if any).
   */
  shutDown(): Promise<void>;
}

export default Destructable;
