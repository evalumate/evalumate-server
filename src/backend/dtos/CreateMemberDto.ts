import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";

import CaptchaDto from "./CaptchaDto";

export default class CreateMemberDto {
  @ValidateNested()
  @Type(() => CaptchaDto)
  captcha: CaptchaDto;
}
