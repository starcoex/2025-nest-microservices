export interface IGoogle {
  id: string;
  displayName: string;
  name?: {
    familyName?: string;
    givenName?: string;
    middleName?: string;
  };
  emails?: Array<{
    value: string;
    verified: boolean;
  }>;
  photos?: Array<{
    value: string;
  }>;
  provider: string;
  _raw: string;
  _json: any;
}
