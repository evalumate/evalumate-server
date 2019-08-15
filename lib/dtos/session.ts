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
  public solution: string;

  @IsString()
  @IsDefined()
  public token: string;
}

export class CreateSessionDto {
  @ValidateNested()
  @IsDefined()
  @Type(() => CaptchaDto)
  public captcha: CaptchaDto;

  @IsString()
  @IsDefined()
  public sessionName: string;

  @IsBoolean()
  @IsDefined()
  public captchaRequired: boolean;
}
