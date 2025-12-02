import type { Request, Response } from "express";
export declare const getUserLabTest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const _default: {
    patientRegister: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    patientLogin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getPatientById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getAvailableSlotsByDoctorId: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    updatePatient: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getBookedDoctor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    addFavouriteDoctor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    isFavouriteDoctor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    addfavouriteClinic: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    isFavouriteClinic: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getUserPrescription: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getUserLabTest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default _default;
//# sourceMappingURL=patient.controller.d.ts.map