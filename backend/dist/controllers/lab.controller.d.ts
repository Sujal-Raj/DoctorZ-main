import type { Request, Response } from "express";
declare const _default: {
    labRegister: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    labLogin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getAllLabTests: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    addTest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    addTestBooking: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getLabById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateLabProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getAllTestByLabId: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateLabTest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteLabTest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getLabPatients: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    addLabPackage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getAllPackagesByLabId: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getAllPackages: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateLabPackage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteLabPackage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getPackageDetailsById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    bookPackage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
};
export default _default;
//# sourceMappingURL=lab.controller.d.ts.map