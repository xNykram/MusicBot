const { getSubscription } = require('../subscription.js');

module.exports = {
    name: "stop",
    description: "Stops playing, clears the queue and leaves.",
    execute(message) {
        subscription = getSubscription(message, false);
        if (!subscription) {
            message.reply("Bot is currently not playing.");
            return false;
        }

        subscription.stop();
    }
}
