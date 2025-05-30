import { MoverInfoOrder } from "src/mover/dto/mover-list.request.dto";

export default function getCursorField(orderBy: MoverInfoOrder | undefined) {
  switch (orderBy) {
    case "BESTRATING":
      return "totalRating";
    case "HIGHESTEXP":
      return "career";
    case "MOSTCONFIRM":
      return "confirmedCounts";
    case "MOSTREVIEW":
      return "reviewCounts";
    default:
      return "idNum";
  }
}
