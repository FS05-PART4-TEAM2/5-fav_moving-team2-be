export class recordLoginDto {
  userType: "customer" | "mover";
  userId: string;
  accessToken: string;
  refreshToken: string;
  provider?: string;
  providerId?: string;
}
