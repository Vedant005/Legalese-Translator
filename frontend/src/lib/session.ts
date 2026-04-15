import { v4 as uuidv4 } from "uuid";

export const getUserId = () => {
  if (typeof window === "undefined") return "";
  let userId: string | null = localStorage.getItem("legalese_user_id");
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem("legalese_user_id", userId);
  }
  return userId;
};
