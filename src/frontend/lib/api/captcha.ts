import axios from "axios";

import { getApiUrl } from ".";

export type Captcha = { image: string; token: string };

export async function getCaptcha(): Promise<Captcha> {
  return (await axios.get(getApiUrl("/captcha"))).data.data.captcha;
}
