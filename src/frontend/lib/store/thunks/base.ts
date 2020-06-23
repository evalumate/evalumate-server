import { AxiosError, AxiosRequestConfig, default as axios } from "axios";
import axiosRetry from "axios-retry";
import { AppThunkAction } from "StoreTypes";

import { ApiResponse } from "../../models/ApiResponse";
import { showInfoDialog, showSnackbar } from "../actions/dialogs";

export type ApiThunkOptions = {
  /**
   * If set to true (the default), idempotent requests that failed due to a network error or an
   * internal server error will be retried up to 3 times with an exponential back-off.
   */
  retryOnFailure?: boolean;
  /**
   * If an unexpected error is encountered during the API call, show an error info dialog by
   * dispatching a corresponding `showInfoDialog` action (defaults to `true`).
   */
  showErrorInfoDialog?: boolean;
  /**
   * If set, a snackbar with the provided message will be displayed on a success
   * response from the API by dispatching a corresponding `showSnackbar` action.
   */
  successSnackbarMessage?: string;
};

/**
 * A thunk action creator that encapsulates an API call and returns the result object, or
 * `undefined` in case of a connection error
 *
 * @param config The axios config for the HTTP request
 * @param options An optional ApiThunkOptions object
 * @param expectedErrorCodes An optional list of error status codes that will not trigger an error
 * info dialog even if `options.showErrorInfoDialog` is set to `true`
 */
export function callApi<PayloadDataType = any>(
  config: AxiosRequestConfig,
  options: ApiThunkOptions = {},
  expectedErrorCodes: number[] = []
): AppThunkAction<Promise<ApiResponse<PayloadDataType> | undefined>> {
  options = {
    showErrorInfoDialog: true,
    retryOnFailure: false,
    ...options,
  };

  return async (dispatch) => {
    try {
      let axiosInstance = axios.create();
      if (options.retryOnFailure) {
        axiosRetry(axiosInstance, {
          retries: 3,
          retryDelay: axiosRetry.exponentialDelay,
        });
      }
      const reply = (await axiosInstance.request<ApiResponse<PayloadDataType>>(config)).data;

      if (typeof options.successSnackbarMessage !== "undefined") {
        dispatch(showSnackbar(options.successSnackbarMessage));
      }

      return reply;
    } catch (e) {
      const error: AxiosError<ApiResponse> = e;

      if (typeof error.response === "undefined") {
        dispatch(
          showInfoDialog({
            title: "Connection Error",
            message: "An unexpected error occurred. Please try again.",
          })
        );
        return;
      }

      const data = error.response.data;
      if (options.showErrorInfoDialog && !expectedErrorCodes.includes(error.response.status)) {
        dispatch(showInfoDialog({ title: data.error!.name, message: data.error!.message }));
      }
      return data;
    }
  };
}
