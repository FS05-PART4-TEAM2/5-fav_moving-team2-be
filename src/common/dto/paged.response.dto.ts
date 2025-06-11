export class CursorDto {
  cursorId: string;
  cursorDate: string;
}

export class PagedResponseDto<T> {
  data: T[];
  nextCursor: CursorDto | null;

  static of<T>(data: T[], nextCursor: CursorDto | null): PagedResponseDto<T> {
    return { data, nextCursor };
  }
}
