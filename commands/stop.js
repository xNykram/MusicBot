const { getSubscription } = require('../subscription.js');
const leave = require('./leave.js');

module.exports = {
    name: "stop",
    description: "Stops playing, clears the queue and leaves.",
    execute(message) {
        subscription = getSubscription(message, false);
        if (!subscription) {
            message.reply("Bot is currently not playing.");
            return false;
        }

        const arr = subscription.queue;
        subscription.audioPlayer.stop();
        subscription.queue = arr.splice(arr.length);
        leave.execute(message);
    }
}
