import type { Response, Request } from "express";
export declare const getTodaysBookedAppointments: (req: Request, res: Response) => Promise<void>;
export declare const getTotalPatients: (req: Request, res: Response) => Promise<void>;
export declare const searchDoctors: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getDoctorNotifications: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const acceptDoctorRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const rejectDoctorRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const _default: {
    getAllDoctors: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    doctorRegister: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateDoctorData: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getDoctorById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteDoctor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateDoctor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getClinicDoctors: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    doctorLogin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getTodaysBookedAppointments: (req: Request, res: Response) => Promise<void>;
    getTotalPatients: (req: Request, res: Response) => Promise<void>;
    searchDoctors: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getDoctorNotifications: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    acceptDoctorRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    rejectDoctorRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default _default;
//# sourceMappingURL=doctor.controller.d.ts.map