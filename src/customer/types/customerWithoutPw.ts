import { Customer } from "../customer.entity";

export type SafeCustomer = Omit<Customer, "password">;
