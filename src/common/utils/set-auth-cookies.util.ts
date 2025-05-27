import { Request, Response } from "express";

export class SetAuthCookies {
  static set(
    req: Request,
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const origin = req.headers.origin ?? "";
    const apiProtocol = req.protocol; // 'http' or 'https'
    const isLocal = origin.startsWith("http://localhost");

    const isSecure = apiProtocol === "https" && !isLocal;
    const sameSite: "lax" | "none" = isLocal ? "lax" : "none";

    console.log({ origin, apiProtocol, isLocal, isSecure, sameSite });

    const cookieOptions = {
      httpOnly: true,
      secure: isSecure,
      sameSite,
    } as const;

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);
  }
}
