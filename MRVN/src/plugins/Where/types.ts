import * as t from "io-ts";
import { BasePluginType, guildCommand, guildEventListener } from "knub";
import { GuildNotifyRequests } from "../../data/GuildNotifyRequests";

export const ConfigSchema = t.type({
  where_timeout: t.number,
  update_notification: t.boolean,

  can_where: t.boolean,
  can_notify: t.boolean,
  can_follow: t.boolean,
  can_usage: t.boolean,
});
export type TConfigSchema = t.TypeOf<typeof ConfigSchema>;

export interface WherePluginType extends BasePluginType {
  config: TConfigSchema;

  state: {
    notifyRequests: GuildNotifyRequests;
  };
}

export const whereCommand = guildCommand<WherePluginType>();
export const whereEvent = guildEventListener<WherePluginType>();
