export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
}

export interface CreateUserData {
  email: string;
  username: string;
  passwordHash: string;
}