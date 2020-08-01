import * as t from "io-ts";
import { BasePluginType, command, eventListener } from "knub";

export const ConfigSchema = t.type({
    where_timeout: t.number,
    update_notification: t.boolean,
    persist_notifications: t.boolean,

    can_where: t.boolean,
    can_notify: t.boolean,
    can_follow: t.boolean,
    can_usage: t.boolean,
});
export type TConfigSchema = t.TypeOf<typeof ConfigSchema>;

export interface WherePluginType extends BasePluginType {
    config: TConfigSchema;
}

export const whereCommand = command<WherePluginType>();
export const whereEvent = eventListener<WherePluginType>();