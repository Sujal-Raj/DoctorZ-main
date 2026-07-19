import { v4 as uuidv4 } from "uuid";
import auditLogModel from "../models/auditLog.model.js";
import { Request } from "express";
import { UAParser } from "ua-parser-js";
import mongoose from "mongoose";

interface LogAuditParams {
  req?: Request;
  userId?: string;
  userName?: string;
  userRole?: string;
  hospitalId?: string | mongoose.Types.ObjectId;
  module: string;
  action: string;
  details: string;
  recordId?: string;
  previousValue?: any;
  newValue?: any;
  status?: "success" | "failure";
}

export const logAudit = async (params: LogAuditParams) => {
  try {
    let ipAddress = "";
    let userAgentString = "";
    let device = "Unknown";
    let browser = "Unknown";

    if (params.req) {
      ipAddress = (params.req.headers["x-forwarded-for"] || params.req.socket.remoteAddress || "") as string;
      userAgentString = params.req.headers["user-agent"] || "";
      
      const parser = new (UAParser as any)(userAgentString);
      const parsedDevice = parser.getDevice();
      const parsedBrowser = parser.getBrowser();
      
      device = parsedDevice.type ? `${parsedDevice.vendor || ""} ${parsedDevice.type}`.trim() : "Desktop";
      browser = `${parsedBrowser.name || "Unknown"} ${parsedBrowser.version || ""}`.trim();
    }

    const auditData = {
      auditId: `AUD-${uuidv4().substring(0, 8).toUpperCase()}`,
      userId: params.userId || (params.req as any)?.user?.id,
      userName: params.userName || (params.req as any)?.user?.name,
      userRole: params.userRole || (params.req as any)?.user?.role,
      hospitalId: params.hospitalId || (params.req as any)?.user?.clinicId,
      module: params.module,
      action: params.action,
      details: params.details,
      recordId: params.recordId,
      previousValue: params.previousValue,
      newValue: params.newValue,
      ipAddress,
      device,
      browser,
      userAgent: userAgentString,
      status: params.status || "success",
    };

    await auditLogModel.create(auditData);
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
};
