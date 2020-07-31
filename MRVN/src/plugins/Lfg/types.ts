import * as t from "io-ts";
import { BasePluginType, command, eventListener } from "knub";

export const ConfigSchema = t.type({
    lfg_command_ident: t.string,
    lfg_shrink_ident: t.string,
    lfg_shrink_default: t.number,
    lfg_unshrink_ident: t.string,
    lfg_voice_ident: t.string,
    lfg_text_ident: t.string,
    lfg_message_compact: t.boolean,
    lfg_list_others: t.boolean,

    lfg_enable_emotes: t.boolean,
    lfg_emotes_chan_ident: t.string,
    lfg_emotes_idents: t.array(t.string),
    lfg_emotes_names: t.array(t.string),
    lfg_emotes_found_append: t.string,
    lfg_emotes_notfound_append: t.string,

    lfg_enable_shrink: t.boolean,
    lfg_shrink_text_idents: t.array(t.string),
    lfg_shrink_shrunk_amts: t.array(t.number),
    lfg_shrink_normal_amt: t.number,

    can_delay: t.boolean,
});
export type TConfigSchema = t.TypeOf<typeof ConfigSchema>;

export interface LfgPluginType extends BasePluginType {
    config: TConfigSchema;
}

export const lfgCommand = command<LfgPluginType>();
export const lfgEvent = eventListener<LfgPluginType>();