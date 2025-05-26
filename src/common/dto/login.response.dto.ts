export class CustomerLoginResponseDto {
  accessToken: string;
  refreshToken: string;
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

export class MoverLoginResponseDto {
  accessToken: string;
  refreshToken: string;
  mover: {
    id: string;
    username: string;
    nickname: string;
    email: string;
    phoneNumber: string;
    profileImage: string | null;
    serviceArea: string | null;
    serviceList: string | null;
    intro: string | null;
    career: string | null;
    detailDescription: string | null;
    likeCount: number;
    totalRating: number;
    reviewCounts: number;
    createdAt: Date;
  };
}
