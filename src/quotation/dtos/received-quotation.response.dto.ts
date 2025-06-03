import { ReceivedQuote } from "../entities/received-quote.entity";

export class ReceivedQuoteResponseDto {
  id: string;
  price: number;
  comment: string;
  isAssignQuo: boolean;
  moverId: string;
  customerId: string;
  quotationId: string;
  createdAt: Date;

  static of(entity: ReceivedQuote): ReceivedQuoteResponseDto {
    const dto = new ReceivedQuoteResponseDto();

    dto.id = entity.id;
    dto.price = entity.price;
    dto.comment = entity.comment;
    dto.isAssignQuo = entity.isAssignQuo;
    dto.moverId = entity.moverId;
    dto.customerId = entity.customerId;
    dto.quotationId = entity.quotationId;
    dto.createdAt = entity.createdAt;

    return dto;
  }
}
