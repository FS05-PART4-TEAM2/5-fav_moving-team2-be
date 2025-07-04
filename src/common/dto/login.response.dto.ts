export class CustomerLoginResponseDto {
  accessToken: string;
  refreshToken: string;
  customer: {
    id: string;
    username: string;
    email: string;
    phoneNumber: string;
    isProfile: boolean;
    profileImage: string | null;
    wantService: string[] | null;
    livingPlace: string[] | null;
    createdAt: Date;
    hasQuotation: boolean;
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
    isProfile: boolean;
    profileImage: string | null;
    serviceArea: string[] | null;
    serviceList: string[] | null;
    intro: string | null;
    career: number | null;
    detailDescription: string | null;
    likeCount: number;
    totalRating: number;
    reviewCounts: number;
    confirmQuotation: number;
    createdAt: Date;
  };
}
