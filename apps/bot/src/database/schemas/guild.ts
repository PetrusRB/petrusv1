import { Schema } from "mongoose";
import { t } from "../utils.js";

export const guildSchema = new Schema(
    {
        id: t.req_string,
        cargos: {
            mutado: t.string,
            membro: t.string,
            naoverificado: t.string,
        }
    },
    {
        statics: {
            async get(id: string) {
                const guild = await this.findOne({ id });
                return guild ?? await this.create({ id });
            }
        }
    }
);