import { Request, Response } from "express";
import billModel from "../models/bill.model.js";
import expenseModel from "../models/expense.model.js";
import wardModel from "../models/bed.model.js";
import ipdAdmissionModel from "../models/ipdAdmission.model.js";

export const getHospitalAnalytics = async (req: Request, res: Response) => {
  try {
    const { clinicId } = req.params;

    if (!clinicId) {
      return res.status(400).json({ success: false, message: "Clinic ID is required" });
    }

    // 1. Fetch all invoices & expenses for the clinic
    const [bills, expenses, wards, admissions] = await Promise.all([
      billModel.find({ clinicId }),
      expenseModel.find({ clinicId }),
      wardModel.find({ clinicId }),
      ipdAdmissionModel.find({ clinicId }),
    ]);

    // 2. Revenue calculations (Total and monthly)
    let totalRevenue = 0;
    let totalPaid = 0;
    let totalDue = 0;
    let opdRev = 0;
    let wardRev = 0;
    let pharmaRev = 0;

    for (const bill of bills) {
      totalRevenue += bill.grandTotal;
      totalPaid += bill.paidAmount;
      totalDue += bill.dueAmount;

      for (const item of bill.items) {
        const total = item.quantity * item.unitPrice;
        if (item.inventoryItemId) {
          pharmaRev += total;
        } else if (
          item.name.toLowerCase().includes("ward") ||
          item.name.toLowerCase().includes("bed") ||
          item.name.toLowerCase().includes("stay") ||
          item.name.toLowerCase().includes("admit")
        ) {
          wardRev += total;
        } else {
          opdRev += total;
        }
      }
    }

    // 3. Expense calculations
    let totalExpenses = 0;
    for (const exp of expenses) {
      totalExpenses += exp.amount;
    }

    const netProfit = totalPaid - totalExpenses;

    // 4. Bed Occupancy calculations
    let totalBedsCount = 0;
    let occupiedBedsCount = 0;
    let cleaningBedsCount = 0;
    let maintenanceBedsCount = 0;
    let availableBedsCount = 0;

    for (const ward of wards) {
      totalBedsCount += ward.beds.length;
      for (const bed of ward.beds) {
        if (bed.status === "Occupied") occupiedBedsCount++;
        else if (bed.status === "Cleaning") cleaningBedsCount++;
        else if (bed.status === "Maintenance") maintenanceBedsCount++;
        else availableBedsCount++;
      }
    }

    // 5. Average Length of Stay (ALOS)
    const dischargedStays = admissions.filter(
      (adm) => adm.status === "Discharged" && adm.dischargeDate && adm.admissionDate
    );

    let totalDays = 0;
    dischargedStays.forEach((adm) => {
      const start = new Date(adm.admissionDate);
      const end = new Date(adm.dischargeDate!);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      totalDays += diffDays;
    });

    const averageLengthOfStay = dischargedStays.length > 0 ? (totalDays / dischargedStays.length).toFixed(1) : "0.0";

    // 6. Time-series data for graphs
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueTrend = monthNames.map(m => ({ name: m, revenue: 0, expenses: 0 }));

    bills.forEach((bill: any) => {
      const d = new Date(bill.createdAt || bill.date || new Date());
      revenueTrend[d.getMonth()].revenue += bill.paidAmount || 0;
    });
    expenses.forEach((exp: any) => {
      const d = new Date(exp.createdAt || exp.date || new Date());
      revenueTrend[d.getMonth()].expenses += exp.amount || 0;
    });

    return res.status(200).json({
      success: true,
      analytics: {
        financials: {
          totalRevenue,
          totalPaid,
          totalDue,
          totalExpenses,
          netProfit,
        },
        departmentRevenue: {
          opd: opdRev,
          hospitalization: wardRev,
          pharmacy: pharmaRev,
        },
        bedOccupancy: {
          total: totalBedsCount,
          occupied: occupiedBedsCount,
          available: availableBedsCount,
          cleaning: cleaningBedsCount,
          maintenance: maintenanceBedsCount,
        },
        stayStats: {
          totalDischarged: dischargedStays.length,
          averageLengthOfStay,
        },
        timeSeries: {
          revenueTrend
        }
      },
    });

  } catch (error: any) {
    console.error("Analytics fetch error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
