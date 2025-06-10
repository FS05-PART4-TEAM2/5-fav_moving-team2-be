// src/common/dto/api-response.dto.ts
import { ApiProperty } from "@nestjs/swagger";

export class CommonApiResponse<T> {
  @ApiProperty({ example: true, description: "요청 성공 여부" })
  success: boolean;

  @ApiProperty({
    required: false,
    description: "응답 데이터",
    // 제네릭 T는 allOf 로 덮어쓰므로 구체적인 타입 지정은 여기서 하지 않아도 됩니다.
    type: Object,
  })
  data?: T;

  @ApiProperty({
    required: false,
    example: "요청이 성공했습니다.",
    description: "응답 메시지",
  })
  message?: string;

  @ApiProperty({
    required: false,
    description: "에러 코드",
  })
  errorCode?: string;

  constructor(
    success: boolean,
    data?: T,
    message?: string,
    errorCode?: string,
  ) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.errorCode = errorCode;
  }

  static success<T>(data?: T, message = "요청이 성공했습니다.") {
    return new CommonApiResponse<T>(true, data, message);
  }

  static fail(message = "요청이 실패했습니다.", errorCode = "COMMON_ERROR") {
    return new CommonApiResponse<null>(false, null, message, errorCode);
  }
}
