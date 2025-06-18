import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import { Customer } from "src/customer/customer.entity";
import { Mover } from "src/mover/mover.entity";
import { Auth } from "src/auth/auth.entity";
import { Quotation } from "src/quotation/quotation.entity";
import { LikeMover } from "src/likeMover/likeMover.entity";
import { MoverReview } from "src/moverReview/moverReview.entity";
import { Notifications } from "src/notifications/notification.entity";
import { ServiceTypeKey } from "src/common/constants/service-type.constant";
import { RegionKey } from "src/common/constants/region.constant";

export class SeedData {
  constructor(private dataSource: DataSource) {}

  async seed() {
    // 1. Customer 데이터 생성
    const customers = await this.createCustomers();

    // 2. Mover 데이터 생성
    const movers = await this.createMovers();

    // 3. Auth 데이터 생성
    await this.createAuthData(customers, movers);

    // 4. Quotation 데이터 생성
    const quotations = await this.createQuotations(customers, movers);

    // 5. LikeMover 데이터 생성
    await this.createLikeMovers(customers, movers);

    // 6. MoverReview 데이터 생성
    await this.createMoverReviews(customers, movers, quotations);

    // 7. Notifications 데이터 생성
    await this.createNotifications(customers, movers, quotations);

    console.log("Seed data created successfully!");
  }

  private async createCustomers() {
    const customerRepo = this.dataSource.getRepository(Customer);
    const hashedPassword = await bcrypt.hash("password123", 10);

    const customers = [
      {
        username: "김민수",
        email: "kim.minsu@gmail.com",
        password: hashedPassword,
        isProfile: true,
        authType: "email",
        phoneNumber: "010-1234-5678",
        profileImage: null,
        wantService: ["FAMILY_MOVE", "SMALL_MOVE"] as ServiceTypeKey[],
        livingPlace: ["SEOUL", "GYEONGGI"] as RegionKey[],
      },
      {
        username: "이지영",
        email: "lee.jiyoung@naver.com",
        password: hashedPassword,
        isProfile: true,
        authType: "oauth",
        provider: "naver",
        phoneNumber: "010-2345-6789",
        profileImage: null,
        wantService: ["OFFICE_MOVE"] as ServiceTypeKey[],
        livingPlace: ["INCHEON"] as RegionKey[],
      },
      {
        username: "박준호",
        email: "park.junho@kakao.com",
        password: hashedPassword,
        isProfile: true,
        authType: "oauth",
        provider: "kakao",
        phoneNumber: "010-3456-7890",
        profileImage: null,
        wantService: ["SMALL_MOVE"] as ServiceTypeKey[],
        livingPlace: ["SEOUL"] as RegionKey[],
      },
      {
        username: "최수연",
        email: "choi.suyeon@gmail.com",
        password: hashedPassword,
        isProfile: false,
        authType: "email",
        phoneNumber: "010-4567-8901",
        profileImage: null,
        wantService: ["FAMILY_MOVE"] as ServiceTypeKey[],
        livingPlace: ["BUSAN"] as RegionKey[],
      },
      {
        username: "정우진",
        email: "jung.woojin@google.com",
        password: hashedPassword,
        isProfile: true,
        authType: "oauth",
        provider: "google",
        phoneNumber: "010-5678-9012",
        profileImage: null,
        wantService: ["FAMILY_MOVE", "OFFICE_MOVE"] as ServiceTypeKey[],
        livingPlace: ["DAEGU", "GYEONGBUK"] as RegionKey[],
      },
    ];

    return await customerRepo.save(customers);
  }

  private async createMovers() {
    const moverRepo = this.dataSource.getRepository(Mover);
    const hashedPassword = await bcrypt.hash("mover123", 10);

    const movers = [
      {
        username: "강이사",
        nickname: "믿음직한 강사장",
        email: "kang.mover@gmail.com",
        password: hashedPassword,
        isProfile: true,
        phoneNumber: "010-1111-2222",
        profileImage: "https://example.com/profiles/mover1.jpg",
        serviceArea: ["SEOUL", "GYEONGGI", "INCHEON"] as RegionKey[],
        serviceList: ["FAMILY_MOVE", "OFFICE_MOVE"] as ServiceTypeKey[],
        intro: "20년 경력의 베테랑 이사업체입니다.",
        career: 20,
        detailDescription:
          "안전하고 신속한 이사 서비스를 제공합니다. 가구 보호에 특히 신경쓰며, 고객 만족도 1위를 자랑합니다.",
        likeCount: 45,
        totalRating: 187.5,
        reviewCounts: 42,
        confirmedCounts: 156,
      },
      {
        username: "박포장",
        nickname: "꼼꼼한 박사장",
        email: "park.mover@naver.com",
        password: hashedPassword,
        provider: "naver",
        isProfile: true,
        phoneNumber: "010-2222-3333",
        profileImage: "https://example.com/profiles/mover2.jpg",
        serviceArea: ["SEOUL", "GANGWON"] as RegionKey[],
        serviceList: ["SMALL_MOVE", "FAMILY_MOVE"] as ServiceTypeKey[],
        intro: "소형이사 전문업체입니다.",
        career: 8,
        detailDescription:
          "원룸, 투룸 등 소형 이사에 특화된 서비스를 제공합니다. 학생 및 신혼부부 할인 혜택이 있습니다.",
        likeCount: 32,
        totalRating: 142.0,
        reviewCounts: 31,
        confirmedCounts: 89,
      },
      {
        username: "이운송",
        nickname: "스피드 이사장",
        email: "lee.mover@gmail.com",
        password: hashedPassword,
        isProfile: true,
        phoneNumber: "010-3333-4444",
        profileImage: null,
        serviceArea: ["BUSAN", "ULSAN", "GYEONGNAM"] as RegionKey[],
        serviceList: ["FAMILY_MOVE", "OFFICE_MOVE"] as ServiceTypeKey[],
        intro: "부산 지역 최고의 이사 서비스",
        career: 15,
        detailDescription:
          "부산 지역에서 15년간 쌓아온 노하우로 완벽한 이사 서비스를 제공합니다. 당일 이사도 가능합니다.",
        likeCount: 28,
        totalRating: 126.5,
        reviewCounts: 27,
        confirmedCounts: 102,
      },
      {
        username: "최빠른",
        nickname: "당일이사 최사장",
        email: "choi.mover@kakao.com",
        password: hashedPassword,
        provider: "kakao",
        isProfile: true,
        phoneNumber: "010-4444-5555",
        profileImage: "https://example.com/profiles/mover4.jpg",
        serviceArea: ["DAEGU", "GYEONGBUK"] as RegionKey[],
        serviceList: ["SMALL_MOVE"] as ServiceTypeKey[],
        intro: "당일 이사 전문업체",
        career: 5,
        detailDescription:
          "급하게 이사해야 하는 분들을 위한 당일 이사 서비스입니다. 24시간 상담 가능합니다.",
        likeCount: 18,
        totalRating: 82.5,
        reviewCounts: 18,
        confirmedCounts: 45,
      },
      {
        username: "정안전",
        nickname: "안전제일 정사장",
        email: "jung.mover@gmail.com",
        password: hashedPassword,
        isProfile: true,
        phoneNumber: "010-5555-6666",
        profileImage: "https://example.com/profiles/mover5.jpg",
        serviceArea: ["SEOUL", "GYEONGGI"] as RegionKey[],
        serviceList: [
          "FAMILY_MOVE",
          "OFFICE_MOVE",
          "SMALL_MOVE",
        ] as ServiceTypeKey[],
        intro: "안전한 이사가 최우선입니다.",
        career: 12,
        detailDescription:
          "가구 손상 제로를 목표로 하는 이사업체입니다. 모든 작업자가 보험에 가입되어 있어 안심하고 맡기실 수 있습니다.",
        likeCount: 35,
        totalRating: 165.0,
        reviewCounts: 35,
        confirmedCounts: 128,
      },
    ];

    return await moverRepo.save(movers);
  }

  private async createAuthData(customers: Customer[], movers: Mover[]) {
    const authRepo = this.dataSource.getRepository(Auth);

    const authData = [
      // Customer auth data
      ...customers.map((customer, index) => ({
        accessToken: `customer_access_token_${index + 1}`,
        refreshToken: `customer_refresh_token_${index + 1}`,
        provider: customer.provider,
        providerId: customer.provider
          ? `${customer.provider}_id_${index + 1}`
          : null,
        userType: "customer" as const,
        userId: customer.id,
        logoutAt: null,
      })),
      // Mover auth data
      ...movers.map((mover, index) => ({
        accessToken: `mover_access_token_${index + 1}`,
        refreshToken: `mover_refresh_token_${index + 1}`,
        provider: mover.provider,
        providerId: mover.provider ? `${mover.provider}_id_${index + 1}` : null,
        userType: "mover" as const,
        userId: mover.id,
        logoutAt: null,
      })),
    ];

    await authRepo.save(authData);
  }

  private async createQuotations(customers: Customer[], movers: Mover[]) {
    const quotationRepo = this.dataSource.getRepository(Quotation);

    const quotations = [
      {
        moveType: "FAMILY_MOVE" as const,
        moveDate: "2025-07-15",
        price: "800000",
        startAddress: "서울시 강남구 역삼동 123-45",
        endAddress: "경기도 성남시 분당구 정자동 678-90",
        status: "CONFIRMED" as const,
        customerId: customers[0].id,
        assignMover: [movers[0].id, movers[4].id],
        confirmedMoverId: movers[0].id,
      },
      {
        moveType: "OFFICE_MOVE" as const,
        moveDate: "2025-07-20",
        price: "1200000",
        startAddress: "인천시 남동구 구월동 456-78",
        endAddress: "서울시 마포구 상암동 789-12",
        status: "PENDING" as const,
        customerId: customers[1].id,
        assignMover: [movers[0].id, movers[4].id],
      },
      {
        moveType: "SMALL_MOVE" as const,
        moveDate: "2025-06-25",
        price: "300000",
        startAddress: "서울시 중구 명동 234-56",
        endAddress: "서울시 용산구 이태원동 567-89",
        status: "COMPLETED" as const,
        customerId: customers[2].id,
        assignMover: [movers[1].id, movers[3].id],
        confirmedMoverId: movers[1].id,
      },
      {
        moveType: "FAMILY_MOVE" as const,
        moveDate: "2025-08-10",
        startAddress: "부산시 해운대구 우동 890-12",
        endAddress: "부산시 사하구 감천동 123-45",
        status: "PENDING" as const,
        customerId: customers[3].id,
        assignMover: [movers[2].id],
      },
      {
        moveType: "OFFICE_MOVE" as const,
        moveDate: "2025-07-30",
        price: "1500000",
        startAddress: "대구시 중구 동성로 345-67",
        endAddress: "대구시 수성구 범어동 678-90",
        status: "CONFIRMED" as const,
        customerId: customers[4].id,
        assignMover: [movers[3].id],
        confirmedMoverId: movers[3].id,
      },
    ];

    return await quotationRepo.save(quotations);
  }

  private async createLikeMovers(customers: Customer[], movers: Mover[]) {
    const likeMoverRepo = this.dataSource.getRepository(LikeMover);

    const likes = [
      { moverId: movers[0].id, customerId: customers[0].id },
      { moverId: movers[0].id, customerId: customers[1].id },
      { moverId: movers[0].id, customerId: customers[2].id },
      { moverId: movers[1].id, customerId: customers[0].id },
      { moverId: movers[1].id, customerId: customers[2].id },
      { moverId: movers[2].id, customerId: customers[3].id },
      { moverId: movers[3].id, customerId: customers[4].id },
      { moverId: movers[4].id, customerId: customers[0].id },
      { moverId: movers[4].id, customerId: customers[1].id },
      { moverId: movers[4].id, customerId: customers[4].id },
    ];

    await likeMoverRepo.save(likes);
  }

  private async createMoverReviews(
    customers: Customer[],
    movers: Mover[],
    quotations: Quotation[],
  ) {
    const reviewRepo = this.dataSource.getRepository(MoverReview);

    const reviews = [
      {
        content:
          "정말 꼼꼼하고 친절하게 이사해주셨어요. 가구 하나하나 소중히 다뤄주셔서 감사합니다.",
        rating: 5,
        moverId: movers[0].id,
        quotationId: quotations[0].id,
        customerId: customers[0].id,
        customerNick: customers[0].username,
      },
      {
        content:
          "시간도 정확하고 작업도 빨라서 만족스러웠습니다. 다음에도 이용할 예정입니다.",
        rating: 4,
        moverId: movers[1].id,
        quotationId: quotations[2].id,
        customerId: customers[2].id,
        customerNick: customers[2].username,
      },
      {
        content: "가격도 합리적이고 서비스도 좋았어요. 추천합니다!",
        rating: 5,
        moverId: movers[0].id,
        quotationId: quotations[0].id,
        customerId: customers[0].id,
        customerNick: customers[0].username,
      },
      {
        content: "직원분들이 모두 친절하고 전문적이었습니다.",
        rating: 4,
        moverId: movers[4].id,
        quotationId: quotations[4].id,
        customerId: customers[4].id,
        customerNick: customers[4].username,
      },
    ];

    await reviewRepo.save(reviews);
  }

  private async createNotifications(
    customers: Customer[],
    movers: Mover[],
    quotations: Quotation[],
  ) {
    const notificationRepo = this.dataSource.getRepository(Notifications);

    const notifications = [
      {
        recipient: customers[0].id,
        type: "QUOTE_ARRIVED" as const,
        segments: [
          { text: "새로운 견적이 도착했습니다. ", isHighlight: false },
          { text: "강이사", isHighlight: true },
          { text: "님으로부터 견적을 받았습니다.", isHighlight: false },
        ],
        isRead: false,
      },
      {
        recipient: customers[1].id,
        type: "QUOTE_CONFIRMED" as const,
        segments: [
          { text: "견적이 확정되었습니다. ", isHighlight: false },
          { text: "2025년 7월 20일", isHighlight: true },
          { text: " 이사 일정을 확인해주세요.", isHighlight: false },
        ],
        isRead: false,
      },
      {
        recipient: customers[2].id,
        type: "MOVE_SCHEDULE" as const,
        segments: [
          { text: "내일은 이사 예정일입니다. ", isHighlight: false },
          { text: "오전 9시", isHighlight: true },
          { text: "에 기사님이 방문할 예정입니다.", isHighlight: false },
        ],
        isRead: true,
      },
      {
        recipient: movers[0].id,
        type: "QUOTE_ARRIVED" as const,
        segments: [
          { text: "새로운 견적 요청이 있습니다. ", isHighlight: false },
          { text: "가정이사", isHighlight: true },
          { text: " 견적을 확인해주세요.", isHighlight: false },
        ],
        isRead: false,
      },
      {
        recipient: movers[1].id,
        type: "QUOTE_CONFIRMED" as const,
        segments: [
          { text: "견적이 확정되었습니다. ", isHighlight: false },
          { text: "김민수", isHighlight: true },
          { text: "님의 이사를 담당하게 되었습니다.", isHighlight: false },
        ],
        isRead: false,
      },
    ];

    await notificationRepo.save(notifications);
  }
}
