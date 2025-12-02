import type { Request, Response } from "express";
export declare const clinicRegister: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const clinicLogin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateClinic: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteClinic: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const searchClinicAndDoctor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllClinic: (req: Request, res: Response) => Promise<void>;
export declare const getClinicById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllClinicPatients: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getClinicStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const sendDoctorRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getClinicDoctorStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=clinic.controller.d.ts.map