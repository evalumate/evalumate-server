declare module "svg-inline-react";
declare module "redux-persist-cookie-storage";
declare module "cookies-js";

declare module "NextReduxTypes" {
  // Extend NextPage getInitialProps context by the options added by next-redux-wrapper
  import { NextPageContext } from "next";
  import { Store } from "StoreTypes";
  export type NextReduxPageContext = NextPageContext & {
    store: Store;
    isServer: boolean;
  };

  /**
   * An extended version of `NextPage` that adds `store` and `isServer` to the `initialProps`
   * context.
   */
  export type NextReduxPage<P = {}, IP = P> = {
    (props: P): JSX.Element | null;
    defaultProps?: Partial<P>;
    displayName?: string;
    /**
     * Used for initial page load data population. Data returned from `getInitialProps` is
     * serialized when server rendered. Make sure to return plain `Object` without using `Date`,
     * `Map`, `Set`.
     * @param ctx Context of `page`
     */
    getInitialProps?(ctx: NextReduxPageContext): Promise<IP>;
  };
}
