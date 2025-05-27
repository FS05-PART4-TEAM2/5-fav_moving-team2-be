import { Request, Response } from "express";

export class SetAuthCookies {
  static set(
    req: Request,
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const origin = req.headers.origin ?? "";
    const isLocal = origin.startsWith("http://localhost");

    const cookieOptions = {
      httpOnly: true,
      secure: !isLocal, // 로컬은 false, 운영은 true
      sameSite: isLocal ? "lax" : "none", // 로컬은 lax, 운영은 none
    } as const;

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);
  }
}
