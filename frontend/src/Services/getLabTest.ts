// import type { Lab } from "./labApi";
import api from "./mainApi";

export interface LabTestResponse {
  success: boolean;
  labTests: never[];
}

export const getUserLabTests = async (userId: string) => {
  return await api.get<LabTestResponse>(`/api/patient/getUserLabTest/${userId}`);
};
