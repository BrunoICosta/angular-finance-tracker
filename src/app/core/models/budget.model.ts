/** A recurring monthly spending limit for an expense category. */
export interface Budget {
  readonly categoryId: string;
  readonly limitCents: number;
}
