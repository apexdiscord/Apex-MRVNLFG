import { TextChannel, VoiceChannel } from "discord.js";
import { noop } from "knub/dist/utils";
import { logger } from "../../../utils/logger";
import { lfgEvent } from "../types";

export const lfgButtonJoinCommandListener = lfgEvent({
  event: "interactionCreate",

  async listener(meta) {
    const interaction = meta.args.interaction.isButton() ? meta.args.interaction : null;
    if (!interaction || !interaction.isButton) return;
    const split = interaction.customId.split("::");
    if (split[0] !== "lfg" && split[1] !== "join") return;

    const presser = await meta.pluginData.guild.members.fetch({ force: true, user: meta.args.interaction.user.id });

    if (await meta.pluginData.state.modbans.isBanned(presser.id)) {
      logger.info(`${presser.id} failed to join a LFG post because they are banned from LFG`);
      await interaction.reply({
        ephemeral: true,
        content: `You are banned from using LFG. Please contact ModMail if you believe this is an error.`,
      });
      return;
    }

    if (presser.voice.channelId == null) {
      await interaction.reply({
        ephemeral: true,
        content: `You must be in <#${meta.pluginData.state.hubVoice.id}> to join LFG posts!`,
      });
      logger.info(`${presser.id.slice(0, -3) + `XXX`} failed to join LFG because they are not in any voice channel`);
      return;
    }

    const lfgCreatorId = split[2];
    if (presser.id === lfgCreatorId) {
      await interaction.reply({
        ephemeral: true,
        content: "You can't join your own LFG post! If you want to cancel it, use the `cancel` command.",
      });
      logger.info(`${presser.id.slice(0, -3) + `XXX`} failed to join LFG because it's their own LFG post`);
      return;
    }

    const isBlocked = await meta.pluginData.state.blocks.isBlockInEitherDirection(presser.id, lfgCreatorId);
    if (isBlocked === 1) {
      await interaction.reply({
        ephemeral: true,
        content: `You cannot join this LFG post, the poster is in your blocklist!`,
      });
      logger.info(`${presser.id.slice(0, -3) + `XXX`} failed to join LFG because the poster is in their blocklist`);
      return;
    } else if (isBlocked === 2) {
      await interaction.reply({
        ephemeral: true,
        content: `Unable to join this LFG post, you are blocked by the poster`, // If we get reports about harassment, change to generic fail?
      });
      logger.info(`${presser.id.slice(0, -3) + `XXX`} failed to join LFG because they are on the poster's blocklist`);
      return;
    }

    let lfgVoice: VoiceChannel | null = null;
    try {
      lfgVoice = (await meta.pluginData.guild.channels.fetch(split[3])) as VoiceChannel;
    } catch (e) {
      await interaction.reply({
        ephemeral: true,
        content: `Unable to join this LFG post! It might be expired or deleted - Sorry about that.`,
      });
      // We know this used to be an LFG post at one point, but the channel was deleted. We can safely delete the origin message.
      const tChannel = (await meta.pluginData.guild.channels.fetch(interaction.channelId)) as TextChannel;
      if (!tChannel) {
        logger.error("Could not find text channel " + interaction.channelId);
      } else {
        try {
          const message = await tChannel.messages.fetch(interaction.message.id);
          await message.delete();
        } catch (er) {
          logger.error(er);
        }
      }
      logger.info(`${presser.id.slice(0, -3) + `XXX`} failed to join LFG because the voice channel didn't exist`);
      return;
    }

    const activeLfg = await meta.pluginData.state.activeLfgs.findForVoiceAndUser(lfgVoice.id, lfgCreatorId);
    if (!activeLfg || lfgVoice.members.size >= lfgVoice.userLimit) {
      await meta.pluginData.state.activeLfgs.removeForVoiceAndUser(lfgVoice.id, lfgCreatorId);
      await interaction.reply({
        ephemeral: true,
        content:
          "Sorry, it looks like the last spot was just taken or the owner disbanded the group a few seconds ago.",
      });
      logger.info(
        `${
          presser.id.slice(0, -3) + `XXX`
        } failed to join LFG because it just ran out of spots/disappeared (race condition)`,
      );

      if (activeLfg) {
        const tChannel = (await meta.pluginData.guild.channels.fetch(activeLfg.text_channel_id)) as TextChannel;
        if (!tChannel) {
          logger.error("Could not find text channel " + activeLfg.text_channel_id);
        } else {
          try {
            const message = await tChannel.messages.fetch(activeLfg.message_id);
            await message.delete();
          } catch (e) {
            logger.error(e);
          }
        }
      }

      return;
    }

    if (presser.voice.channelId === activeLfg.voice_channel_id) {
      await interaction.reply({
        ephemeral: true,
        content: "You are already in this LFG channel!",
      });
      logger.info(`${presser.id.slice(0, -3) + `XXX`} failed to join LFG because they are already in the channel`);
      return;
    }

    const countAfterJoin = lfgVoice.members.size + 1;
    await presser.edit({
      channel: lfgVoice.id,
    });

    if (countAfterJoin >= lfgVoice.userLimit) {
      await meta.pluginData.state.activeLfgs.setEnabled(lfgVoice.id, lfgCreatorId, false);
      const tChannel = (await meta.pluginData.guild.channels.fetch(activeLfg.text_channel_id)) as TextChannel;
      if (!tChannel) {
        logger.error("Could not find text channel " + activeLfg.text_channel_id);
      } else {
        try {
          const message = await tChannel.messages.fetch(activeLfg.message_id);
          await message.delete();
        } catch (e) {
          logger.error(e);
        }
      }
    }

    await interaction.reply({ ephemeral: true, content: "Successfully joined, GLHF!" }).catch(noop);
    logger.info(`${presser.id.slice(0, -3) + `XXX`} successfully joined LFG`);
  },
});
