import {
  IsString,
  ValidateNested,
  IsDefined,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";

class CaptchaDto {
  @IsString()
  @IsDefined()
  solution: string;

  @IsString()
  @IsDefined()
  token: string;
}

export class CreateSessionDto {
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
