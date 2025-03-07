import bcrypt from "bcrypt";

export const hash = ({ password, saltRound = 8 }) => {
  return bcrypt.hashSync(password, saltRound);
};