import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const AccessToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const accessToken = request.cookies["accessToken"];

    if (!accessToken) {
      throw new Error("accessToken이 누락되었습니다.");
    }

    return accessToken;
  },
);
