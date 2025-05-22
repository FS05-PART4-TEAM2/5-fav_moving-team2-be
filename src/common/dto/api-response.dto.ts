export class CommonApiResponse<T> {
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
  ): CommonApiResponse<T> {
    return new CommonApiResponse(true, data, message);
  }

  static fail(
    message = "요청이 실패했습니다.",
    errorCode = "COMMON_ERROR",
  ): CommonApiResponse<null> {
    return new CommonApiResponse(false, null, message, errorCode);
  }
}
