import { SelectMenuBuilder, SelectMenuOptionBuilder } from "@discordjs/builders";
import { MessageActionRow, VoiceChannel } from "discord.js";
import { getMemberLevel } from "knub/dist/helpers";
import { DateTime } from "luxon";
import { lfgEvent } from "../types";

export const lfgKickSlashCommandListener = lfgEvent({
  event: "interactionCreate",

  async listener(meta) {
    const interaction = meta.args.interaction.isCommand() ? meta.args.interaction : null;
    if (!interaction || !interaction.isCommand) return;
    if (!interaction.commandName.startsWith("kick")) return;

    await interaction.deferReply({ ephemeral: true });

    const initiatorId = interaction.user.id;

    const activeLfg = await meta.pluginData.state.activeLfgs.findForUser(initiatorId);
    if (!activeLfg) {
      await interaction.editReply("You have no active LFG channel to kick someone from.");
      return;
    }

    const vChannel = (await meta.pluginData.guild.channels.fetch(activeLfg.voice_channel_id, {
      force: true,
    })) as VoiceChannel;
    const dropDown = new SelectMenuBuilder().setCustomId(
      `lfg::kickdown::${activeLfg.voice_channel_id}::${activeLfg.user_id}::${DateTime.now().toMillis() + 30 * 1000}`,
    );

    for (const vMember of vChannel.members.values()) {
      if (vMember.id === initiatorId) continue;
      if (getMemberLevel(meta.pluginData, vMember) >= 50) continue;

      dropDown.addOptions([new SelectMenuOptionBuilder().setLabel(vMember.displayName).setValue(vMember.id).toJSON()]);
    }

    if (dropDown.options.length === 0) {
      await interaction.editReply({ content: "There are no users to kick!" });
      return;
    }

    const row = new MessageActionRow().addComponents(dropDown.toJSON());

    await interaction.editReply({
      content: "Choose the user to kick: (This Menu is valid for 30 seconds)",
      components: [row],
    });
  },
});
