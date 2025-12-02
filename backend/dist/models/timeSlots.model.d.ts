import mongoose, { Document } from "mongoose";
interface Slot {
    _id?: mongoose.Types.ObjectId | string | undefined;
    time: string;
    isActive: boolean;
}
export interface TimeSlot extends Document {
    doctorId: mongoose.Schema.Types.ObjectId;
    date: Date;
    slots: Slot[];
    createdAt?: Date;
}
declare const _default: mongoose.Model<TimeSlot, {}, {}, {}, mongoose.Document<unknown, {}, TimeSlot, {}, {}> & TimeSlot & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=timeSlots.model.d.ts.map