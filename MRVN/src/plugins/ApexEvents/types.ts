import * as t from "io-ts";
import { BasePluginType, command, eventListener } from "knub";

export const Event = t.type({
  event_id: t.number,
  announce_message_id: t.string,
  author_id: t.string,
  event_title: t.string,
  event_description: t.string,
  voice_channel_id: t.string,
});
export type TEvent = t.TypeOf<typeof Event>;

export const Ask = t.type({
  asker_id: t.string,
  message_id: t.string,
  event_id: t.number,
});
export type TAsk = t.TypeOf<typeof Ask>;

export const ConfigSchema = t.type({
  organizer_role: t.string,
  level_override: t.number,
  organizer_channel: t.string,
  events_max: t.number,
  events_announce_channel: t.string,
  voice_parent_id: t.string,
});
export type TConfigSchema = t.TypeOf<typeof ConfigSchema>;

export interface ApexEventsPluginType extends BasePluginType {
  config: TConfigSchema;
  state: {
    event_highest_id: number;
    events: TEvent[];
    asks: TAsk[];
  };
}

export const apexEventsCommand = command<ApexEventsPluginType>();
export const apexEventsEvent = eventListener<ApexEventsPluginType>();
