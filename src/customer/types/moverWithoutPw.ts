import { Mover } from "src/mover/mover.entity";

export type SafeMover = Omit<Mover, "password">;
