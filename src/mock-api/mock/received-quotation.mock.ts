import {
  ReceivedQuotationResponseDto,
  OfferDto,
} from "../../received-quotation/dto/received-quotation.response.dto";

// Quotation mock 데이터
export const quotationMock = {
  id: "b1e1a0c8-2e45-4a45-981f-f5b756dee42c",
  customerId: "a1e1a0c8-2e45-4a45-981f-f5b756dee42c",
  moveType: "SMALL_MOVE",
  moveDate: "2025-06-10",
  startAddress: "서울시 강남구",
  endAddress: "서울시 송파구",
  createdAt: "2025-05-30T10:00:00.000Z",
  status: "pending",
};

export const receivedQuotationListMock: ReceivedQuotationResponseDto[] = [
  {
    quotationId: "b1e1a0c8-2e45-4a45-981f-f5b756dee42c",
    requestedAt: "2025-05-30T10:00:00.000Z",
    moveType: "SMALL_MOVE",
    moveDate: "2025-06-10",
    startAddress: "서울시 강남구",
    endAddress: "서울시 송파구",
    offers: [
      {
        offerId: "c1e1a0c8-2e45-4a45-981f-f5b756dee42c",
        moverId: "d1e1a0c8-2e45-4a45-981f-f5b756dee42c",
        moverNickname: "이사킹",
        moverProfileImageUrl:
          "https://upload3.inven.co.kr/upload/2023/11/20/bbs/i16726301297.jpg?MW=800",
        isAssigned: false,
        price: "150000",
        likeCount: 10,
        totalRating: 4.8,
        reviewCounts: 20,
        intro: "친절한 서비스 약속드립니다.",
        career: 10,
        isLiked: false,
        confirmedQuotationCount: 3,
        isCompleted: false,
        isConfirmedMover: false,
      },
      {
        offerId: "e1e1a0c8-2e45-4a45-981f-f5b756dee42c",
        moverId: "f1e1a0c8-2e45-4a45-981f-f5b756dee42c",
        moverNickname: "이사달인",
        moverProfileImageUrl:
          "https://upload3.inven.co.kr/upload/2023/11/20/bbs/i16726301297.jpg?MW=800",
        isAssigned: false,
        price: "155000",
        likeCount: 7,
        totalRating: 4.6,
        reviewCounts: 12,
        intro: "빠르고 안전한 이사",
        career: 8,
        isLiked: true,
        confirmedQuotationCount: 2,
        isCompleted: false,
        isConfirmedMover: false,
      },
    ],
  },
];

export const receivedQuotationDetailMock: ReceivedQuotationResponseDto = {
  quotationId: "b1e1a0c8-2e45-4a45-981f-f5b756dee42c",
  requestedAt: "2025-05-30T10:00:00.000Z",
  moveType: "SMALL_MOVE",
  moveDate: "2025-06-10",
  startAddress: "서울시 강남구",
  endAddress: "서울시 송파구",
  offers: [
    {
      offerId: "c1e1a0c8-2e45-4a45-981f-f5b756dee42c",
      moverId: "d1e1a0c8-2e45-4a45-981f-f5b756dee42c",
      moverNickname: "이사킹",
      moverProfileImageUrl:
        "https://upload3.inven.co.kr/upload/2023/11/20/bbs/i16726301297.jpg?MW=800",
      isAssigned: false,
      price: "150000",
      likeCount: 10,
      totalRating: 4.8,
      reviewCounts: 20,
      intro: "친절한 서비스 약속드립니다.",
      career: 10,
      isLiked: false,
      confirmedQuotationCount: 3,
      isCompleted: false,
      isConfirmedMover: false,
    },
  ],
};

export const receivedQuotationCompletedListMock: ReceivedQuotationResponseDto[] =
  [
    {
      quotationId: "b2e2b0c8-3f56-5b56-982f-f6b857eef43d",
      requestedAt: "2025-05-28T09:00:00.000Z",
      moveType: "FAMILY_MOVE",
      moveDate: "2025-06-15",
      startAddress: "서울시 마포구",
      endAddress: "경기도 성남시",
      offers: [
        {
          offerId: "c2e2b0c8-3f56-5b56-982f-f6b857eef43d",
          moverId: "d2e2b0c8-3f56-5b56-982f-f6b857eef43d",
          moverNickname: "든든이사",
          moverProfileImageUrl:
            "https://upload3.inven.co.kr/upload/2023/11/20/bbs/i16726301297.jpg?MW=800",
          isAssigned: true,
          price: "250000",
          likeCount: 15,
          totalRating: 4.9,
          reviewCounts: 30,
          intro: "든든하게 모시겠습니다.",
          career: 12,
          isLiked: false,
          confirmedQuotationCount: 5,
          isCompleted: true,
          isConfirmedMover: true,
        },
        {
          offerId: "e2e2b0c8-3f56-5b56-982f-f6b857eef43d",
          moverId: "f2e2b0c8-3f56-5b56-982f-f6b857eef43d",
          moverNickname: "스피드이사",
          moverProfileImageUrl:
            "https://upload3.inven.co.kr/upload/2023/11/20/bbs/i16726301297.jpg?MW=800",
          isAssigned: false,
          price: "245000",
          likeCount: 8,
          totalRating: 4.5,
          reviewCounts: 18,
          intro: "빠르고 안전하게!",
          career: 7,
          isLiked: false,
          confirmedQuotationCount: 2,
          isCompleted: true,
          isConfirmedMover: false,
        },
      ],
    },
  ];

export const receivedQuotationCompletedListMockDetail: ReceivedQuotationResponseDto =
  {
    quotationId: "b2e2b0c8-3f56-5b56-982f-f6b857eef43d",
    requestedAt: "2025-05-28T09:00:00.000Z",
    moveType: "FAMILY_MOVE",
    moveDate: "2025-06-15",

    startAddress: "서울시 마포구",
    endAddress: "경기도 성남시",
    offers: [
      {
        offerId: "c2e2b0c8-3f56-5b56-982f-f6b857eef43d",
        moverId: "d2e2b0c8-3f56-5b56-982f-f6b857eef43d",
        moverNickname: "든든이사",
        moverProfileImageUrl:
          "https://upload3.inven.co.kr/upload/2023/11/20/bbs/i16726301297.jpg?MW=800",
        isAssigned: true,
        price: "250000",
        likeCount: 15,
        totalRating: 4.9,
        reviewCounts: 30,
        intro: "든든하게 모시겠습니다.",
        career: 12,
        isLiked: false,
        confirmedQuotationCount: 5,
        isCompleted: true,
        isConfirmedMover: true,
      },
    ],
  };
