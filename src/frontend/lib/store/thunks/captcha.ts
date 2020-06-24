import { AppThunkAction } from "StoreTypes";

import { Captcha } from "../../models/Captcha";
import { getApiUrl } from "../../util/api";
import { ApiThunkOptions, callApi } from "./base";

/**
 * Returns a thunk action that fetches a captcha from the API and returns it on success.
 */
export function fetchCaptcha(
  apiThunkOptions?: ApiThunkOptions
): AppThunkAction<Promise<Captcha | undefined>> {
  return async (dispatch) => {
    const response = await dispatch(
      callApi<{ captcha: Captcha }>({ method: "GET", url: getApiUrl("/captcha") }, apiThunkOptions)
    );
    return response?.data?.captcha;
  };
}
