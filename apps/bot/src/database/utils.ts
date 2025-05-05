import { Schema } from "mongoose";

export const p = {
   req_string: { type: String, required: true },
   string: { type: String, required: false },
   number: { type: Number, required: false },
   boolean: { type: Boolean, required: false },
   date: { type: Date, required: false },
};

export const t = Object.assign(p, {
   cargos: new Schema({ id: p.string }, { _id: false }),
});