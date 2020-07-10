export class Notification {
    modId: string;
    subjectId: string;
    channelId: string;
    endTime: number;
    persist: boolean;
    activeFollow: boolean;

    constructor(
        modId: string,
        subjectId: string,
        channelId: string,
        endTime: number,
        persist: boolean,
        activeFollow: boolean,
    ) {
        this.modId = modId;
        this.subjectId = subjectId;
        this.channelId = channelId;
        this.endTime = endTime;
        this.persist = persist;
        this.activeFollow = activeFollow;
    }
}