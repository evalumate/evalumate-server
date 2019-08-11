import {
  IsString,
  ValidateNested,
  IsDefined,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateSessionDto {
  @ValidateNested()
  @Type(() => CaptchaDto)
  public captcha: CaptchaDto;

  @IsString()
  @IsDefined()
  public sessionName: string;

  @IsBoolean()
  @IsDefined()
  public captchaRequired: boolean;
}

class CaptchaDto {
  @IsString()
  @IsDefined()
  public solution: string;

  @IsString()
  @IsDefined()
  public token: string;
}
