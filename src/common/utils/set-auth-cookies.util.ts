import { Response } from "express";

export class SetAuthCookies {
  static set(res: Response, accessToken: string, refreshToken: string) {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || process.env.NODE_ENV === "develop",
      sameSite: process.env.NODE_ENV === "production" || process.env.NODE_ENV === "develop" ? "none" : "lax",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || process.env.NODE_ENV === "develop",
      sameSite: process.env.NODE_ENV === "production" || process.env.NODE_ENV === "develop" ? "none" : "lax",
    });
  }
}
