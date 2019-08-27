import CaptchaDto from "./CaptchaDto";
import { IsBoolean, IsDefined, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

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
