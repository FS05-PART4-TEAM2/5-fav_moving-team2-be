export class ApiResponse<T> {
  constructor(
    public readonly success: boolean,
    // public readonly statusCode?: number,
    public readonly data?: T,
    public readonly message?: string,
    public readonly errorCode?: string,
  ) {}

  static success<T>(
    data?: T,
    message = "요청이 성공했습니다.",
  ): ApiResponse<T> {
    return new ApiResponse(true, data, message);
  }

  static fail(
    message = "요청이 실패했습니다.",
    errorCode = "COMMON_ERROR",
  ): ApiResponse<null> {
    return new ApiResponse(false, null, message, errorCode);
  }
}
