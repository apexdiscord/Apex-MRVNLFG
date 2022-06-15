import { VoiceChannel } from "discord.js";
import { DateTime } from "luxon";
import { lfgEvent } from "../types";
import { incrementOrCreateCounter } from "../utils/counterManager";
import { logKick } from "../utils/userActionLogger";

export const lfgKickSelectionCommandListener = lfgEvent({
  event: "interactionCreate",

  async listener(meta) {
    const interaction = meta.args.interaction.isSelectMenu() ? meta.args.interaction : null;
    if (!interaction || !interaction.isSelectMenu) return;
    const split = interaction.customId.split("::");
    if (split[0] !== "lfg" && split[1] !== "kickdown") return;

    await interaction.deferReply({ ephemeral: true });

    if (DateTime.fromMillis(Number(split[4])) <= DateTime.now()) {
      await interaction.editReply({ content: "This menu has expired" });
      return;
    }

    const selection = interaction.values[0];
    const vChannelId = split[2];
    const vChannel = (await meta.pluginData.guild.channels.fetch(vChannelId, { force: true })) as VoiceChannel;

    const toKick = vChannel.members.get(selection);
    if (toKick) {
      await toKick.edit({ channel: null });
      await interaction.editReply(
        `Successfully kicked <@${toKick.id}>! Use the \`block\` command to block them if you wish to do so.`,
      );

      await incrementOrCreateCounter(toKick.id, meta.pluginData);
      await logKick(interaction.user.id, toKick.id, vChannel, meta.pluginData);

      return;
    }

    await interaction.editReply(`User is no longer in your channel.`);
  },
});
