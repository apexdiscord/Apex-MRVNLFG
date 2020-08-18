import * as t from "io-ts";
import { BasePluginType, command, eventListener } from "knub";
import { GuildEvents } from "src/data/GuildEvents";
import { GuildEventParticipants } from "src/data/GuildEventParticipants";

export const ConfigSchema = t.type({
  organizer_role: t.string,
  level_override: t.number,
  organizer_channel: t.string,
  events_max: t.number,
  events_announce_channel: t.string,
  voice_parent_id: t.string,
});
export type TConfigSchema = t.TypeOf<typeof ConfigSchema>;

export interface EventsPluginType extends BasePluginType {
  config: TConfigSchema;
  state: {
    guildEvents: GuildEvents;
    guildEventParticipants: GuildEventParticipants;

    unloaded: boolean;
    makeVCVisibleTimeout: NodeJS.Timeout;
  };
}

export const eventsCommand = command<EventsPluginType>();
export const eventsEvent = eventListener<EventsPluginType>();
