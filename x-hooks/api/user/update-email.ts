import { api } from "services/api";

export default async function updateUserEmail(email: string) {
  return api
          .put("/user/connect/email", { email })
          .then(({ data }) => data);
}