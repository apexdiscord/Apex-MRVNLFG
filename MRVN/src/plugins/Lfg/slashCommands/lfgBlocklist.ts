import { lfgEvent } from "../types";

export const lfgBlocklistSlashCommandListener = lfgEvent({
  event: "interactionCreate",

  async listener(meta) {
    const interaction = meta.args.interaction.isCommand() ? meta.args.interaction : null;
    if (!interaction || !interaction.isCommand) return;
    if (interaction.commandName !== "blocklist") return;

    await interaction.deferReply({ ephemeral: true });

    const allBlocks = await meta.pluginData.state.blocks.findAllByInitiator(interaction.user.id);
    if (allBlocks.length === 0) {
      await interaction.editReply(`You do not have any users blocked.`);
      return;
    }

    let msg = `Your blocked users:\n`;
    for (const block of allBlocks) {
      msg += `<@${block.target_id}>\n`;
    }
    msg +=
      "If any of the users here do not properly display, they are most likely not in the server.\nUser the `unblock` command to unblock a user.";

    await interaction.editReply(msg);
  },
});
