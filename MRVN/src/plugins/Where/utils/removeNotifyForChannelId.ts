import { PluginData } from "knub";
import { WherePluginType } from "../types";
import { Notification } from "./Notification";

export async function removeVCNotifyforChannelId(pluginData: PluginData<WherePluginType>, userId: string): Promise <void> {
    const newNotifies: Notification[] = [];

    for (const notif of pluginData.state.activeVCNotifications) {
        if (notif.subjectId !== userId) {
            newNotifies.push(notif);
        }
    }

    pluginData.state.activeVCNotifications = newNotifies;
}