import type { Request, Response } from "express";
export declare const getPendingDoctors: (req: Request, res: Response) => Promise<Response>;
export declare const approveDoctor: (req: Request, res: Response) => Promise<Response>;
export declare const rejectDoctor: (req: Request, res: Response) => Promise<Response>;
export declare const approveLab: (req: Request, res: Response) => Promise<Response>;
export declare const rejectLab: (req: Request, res: Response) => Promise<Response>;
export declare const getPendingLabs: (req: Request, res: Response) => Promise<Response>;
export declare const getPendingClinics: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const approveClinic: (req: Request, res: Response) => Promise<Response>;
export declare const rejectClinic: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const adminLogin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=admin.controller.d.ts.map