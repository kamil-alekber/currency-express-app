import fs from "fs";
import path from "path";

interface User {
  email: string;
  password: string;
  tokenVersion: string;
}

export function getUser(
  email: string
): [User | undefined, [{ users: User[] }]] {
  const jsonUsers = fs.readFileSync(
    path.resolve(__dirname, "../../src/db/users.json"),
    { flag: "r", encoding: "utf8" }
  );
  const parsedData = JSON.parse(jsonUsers);
  const user: User | undefined = parsedData[0].users.find(
    (user: { email: string; password: string }) => user.email === email
  );

  return [user, parsedData];
}
