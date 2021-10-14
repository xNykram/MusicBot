const { getSubscription } = require('../subscription.js')

module.exports = {
    name: 'leave',
    description: 'Forces bot to leave from voice channel',
    execute(message) {
        const subscription = getSubscription(message.guild.id);
        if(subscription.isInVoiceChannel()){
            message.reply("You have to be in a voice channel with the music bot to do that.");
            return false;
        }

        subscription.leave();
    }


}
