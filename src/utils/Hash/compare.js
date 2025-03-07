import bcrypt from "bcrypt";

export const compare = ({ password, hashedPassword }) => {
  return bcrypt.compareSync(password, hashedPassword);
};