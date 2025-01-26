export interface IUser {
  id: number;
  email: string;
  password: string;
  phone_number: string;
  name: string;
  roles?: string[];
}
