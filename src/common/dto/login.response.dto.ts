export class LoginResponseDto {
  customer: {
    id: string;
    username: string;
    email: string;
    phoneNumber: string;
    profileImage: string | null;
    wantService: string | null;
    livingPlace: string | null;
    createdAt: Date;
  };
}
