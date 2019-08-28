import { IsBoolean, IsDefined } from "class-validator";

export default class SetUnderstandingDto {
  @IsBoolean()
  @IsDefined()
  understanding: boolean;
}
