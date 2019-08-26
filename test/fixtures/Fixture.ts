/**
 * A simple generic abstract class to implement fixtures that are created via a `setUp` method and
 * destroyed via a `tearDown` method.
 */
export default abstract class Fixture<T> {
  abstract async setUp(options: any): Promise<T>;
  async tearDown(): Promise<void> {}
}
