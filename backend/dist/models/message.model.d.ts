import mongoose from "mongoose";
export interface message extends Document {
    roomId: string;
    senderId: string;
    text: string;
    type: string;
    readBy: string;
    edited: boolean;
    deleted: boolean;
    createdAt: Date;
}
declare const messageModel: mongoose.Model<{
    text: string;
    createdAt: NativeDate;
    roomId: string;
    senderId: string;
    type?: string | null;
    readby?: string | null;
    edited?: boolean | null;
    deleted?: boolean | null;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    text: string;
    createdAt: NativeDate;
    roomId: string;
    senderId: string;
    type?: string | null;
    readby?: string | null;
    edited?: boolean | null;
    deleted?: boolean | null;
}, {}, mongoose.DefaultSchemaOptions> & {
    text: string;
    createdAt: NativeDate;
    roomId: string;
    senderId: string;
    type?: string | null;
    readby?: string | null;
    edited?: boolean | null;
    deleted?: boolean | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    text: string;
    createdAt: NativeDate;
    roomId: string;
    senderId: string;
    type?: string | null;
    readby?: string | null;
    edited?: boolean | null;
    deleted?: boolean | null;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    text: string;
    createdAt: NativeDate;
    roomId: string;
    senderId: string;
    type?: string | null;
    readby?: string | null;
    edited?: boolean | null;
    deleted?: boolean | null;
}>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<{
    text: string;
    createdAt: NativeDate;
    roomId: string;
    senderId: string;
    type?: string | null;
    readby?: string | null;
    edited?: boolean | null;
    deleted?: boolean | null;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default messageModel;
//# sourceMappingURL=message.model.d.ts.map