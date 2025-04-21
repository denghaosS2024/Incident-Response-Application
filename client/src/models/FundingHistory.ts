import IUser from "./User";

export default interface IFundingHistory {
  type: "Assign" | "Request";
  sender: IUser;
  timestamp: string;
  amount: number;
  reason: string;
}
