export interface JwtPayload {
  id: number;
  username: string;
  exp?: number;
}
