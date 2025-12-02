import type { Request, Response } from "express";
export declare const createTimeSlot: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getTimeSlots: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateSlot: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const editTimeSlot: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getActiveSlots: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=timeSlots.controller.d.ts.map