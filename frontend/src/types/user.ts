import { Role } from './role';

export type User = {
  id_usuario: number;
  nombre_persona: string;
  username: string;
  role: Role;
};
