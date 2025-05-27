import { Request, Response } from "express";

export class SetAuthCookies {
  static set(
    req: Request,
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const origin = req.headers.origin;
    const isLocal = origin?.startsWith("http://localhost");

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: !isLocal,
      sameSite: isLocal ? "lax" : "none",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: !isLocal,
      sameSite: isLocal ? "lax" : "none",
    });
  }
}
