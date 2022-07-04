import DAO from "services/dao-service";

declare global {
  interface Window {
    DAOService: DAO;
    connectedAddress: string;
  }
}