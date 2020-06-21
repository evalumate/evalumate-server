import { IsDefined, IsString } from "class-validator";

export default class CaptchaDto {
  @IsString()
  @IsDefined()
  solution: string;

  @IsString()
  @IsDefined()
  token: string;
}
