import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const AccessToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    let accessToken = request.headers["access-token"];

    if (!accessToken) {
      const authHeader = request.headers["authorization"];
      if (authHeader?.startsWith("Bearer ")) {
        accessToken = authHeader.replace("Bearer ", "");
      }
    }

    if (!accessToken) {
      accessToken = request.cookies["accessToken"];
    }

    if (!accessToken) {
      throw new Error("accessToken이 누락되었습니다.");
    }

    return accessToken;
  },
);
