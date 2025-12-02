import type { Request, Response } from "express";
export declare const bookAppointment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getBookingsByDoctor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateBookingStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getBookingsByDoctorAllPatient: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=booking.controller.d.ts.map