import { Type } from "class-transformer";
import { IsBoolean, IsDefined, IsString, ValidateNested } from "class-validator";

import CaptchaDto from "./CaptchaDto";

export default class CreateSessionDto {
  @ValidateNested()
  @IsDefined()
  @Type(() => CaptchaDto)
  captcha: CaptchaDto;

  @IsString()
  @IsDefined()
  sessionName: string;

  @IsBoolean()
  @IsDefined()
  captchaRequired: boolean;
}
