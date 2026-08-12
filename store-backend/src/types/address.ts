export type AddressInput = {
  zipcode: string;
  street: string;
  number: string;
  city: string;
  state: string;
  country: string;
  complement?: string | null | undefined;
};
