export type Status =  "PENDING" | "VERIFIED" | "CANCELLED"
export interface History {
  review_message: string;
  review_date: string;
}

export interface Identity {
  front_hash: string;
  back_hash: string;
  document_type: string;
  did_requested: string;
}

export interface Step {
  state: string;
  name: string;
  id: string;
  ip: string;
  did_issued: boolean;
  history: History[];
  identity: Identity;
}

export interface kycSession {
  id: number;
  user_id: number;
  session_id: string;
  status: string;
  steps: Step[];
  validatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

