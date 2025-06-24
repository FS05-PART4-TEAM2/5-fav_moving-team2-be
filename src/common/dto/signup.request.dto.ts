import { IsEmail, IsString, Matches, MinLength } from "class-validator";

export class SignUpRequestDto {
  @IsString()
  @MinLength(2)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(9)
  @Matches(/^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{9,}$/, {
    message:
      "password must be at least 9 characters long and contain at least one number and one special character.",
  })
  password: string;

  @IsString()
  @Matches(
    /^(010|011|016|017|018|019|070|02|031|032|033|041|042|043|044|051|052|053|054|055|061|062|063|064)[0-9]{7,8}$/,
    {
      message:
        "phoneNumber must start with a valid area code (e.g., 011, 031, etc.) and be followed by 7~8 digits.",
    },
  )
  phoneNumber: string;
}
