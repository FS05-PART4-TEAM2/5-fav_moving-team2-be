export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  customer: {
    id: string;
    username: string;
    email: string;
    phoneNumber: string;
    profileImage: string | null;
    wantService: string | null;
    livingPlcace: string | null;
    createdAt: Date;
  };
}
