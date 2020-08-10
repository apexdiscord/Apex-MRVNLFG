import { PluginOptions, plugin } from "knub";
import { ApexEventsPluginType } from "./types";
import { CreateEventCmd } from "./commands/CreateEventsCmd";
import { loadEventMessages } from "./utils/loadEventMessages";
import { EventReactionAddEvt } from "./events/EventReactionAddEvt";
import { loadAskMessages } from "./utils/loadAskMessages";
import { ListEventCmd } from "./commands/ListEventsCmd";
import { CloseEventCmd } from "./commands/CloseEventCmd";
import { DeleteEventCmd } from "./commands/DeleteEventCmd";

const defaultOptions: PluginOptions<ApexEventsPluginType> = {
  config: {
    organizer_role: "741758286331904031",
    level_override: 50,
    organizer_channel: "741758391655071755",
    events_max: 2,
    events_announce_channel: "741758530754707597",
    voice_parent_id: "741775198466080899",
  },
};

export const ApexEventsPlugin = plugin<ApexEventsPluginType>()("apex_events", {
  defaultOptions,

  // prettier-ignore
  commands: [
    CreateEventCmd,
    ListEventCmd,
    CloseEventCmd,
    DeleteEventCmd,
  ],

  // prettier-ignore
  events: [
    EventReactionAddEvt,
  ],

  async onLoad(pluginData) {
    const { state } = pluginData;

    state.events = [];
    await loadEventMessages(pluginData);
    state.asks = [];
    await loadAskMessages(pluginData);

    let highest = 0;
    state.events.forEach((msg) => {
      if (msg.event_id > highest) {
        highest = msg.event_id;
      }
    });
    state.event_highest_id = highest;
  },
});
