import CaptchaDto from "./CaptchaDto";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";

export default class CreateMemberDto {
  @ValidateNested()
  @Type(() => CaptchaDto)
  captcha: CaptchaDto;
}
