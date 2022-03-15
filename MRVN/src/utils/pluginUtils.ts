import { successMessage, errorMessage } from "./utils";

export function sendSuccessMessage(channel, body) {
  return channel.createMessage(successMessage(body));
}

export function sendErrorMessage(channel, body) {
  return channel.createMessage(errorMessage(body));
}
