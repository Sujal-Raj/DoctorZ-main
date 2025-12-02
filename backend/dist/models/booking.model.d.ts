import mongoose, { Document } from "mongoose";
export interface IPatientInfo {
    name: string;
    age: number;
    gender: "Male" | "Female" | "Other";
    aadhar: string;
    contact: string;
}
export interface IBooking extends Document {
    doctorId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    patient: IPatientInfo;
    slot: string;
    slotId: mongoose.Types.ObjectId;
    dateTime: Date;
    mode: "online" | "offline";
    fees: number;
    status: "pending" | "completed";
    createdAt: Date;
    updatedAt: Date;
    roomId: string;
}
declare const Booking: mongoose.Model<IBooking, {}, {}, {}, mongoose.Document<unknown, {}, IBooking, {}, {}> & IBooking & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Booking;
//# sourceMappingURL=booking.model.d.ts.map