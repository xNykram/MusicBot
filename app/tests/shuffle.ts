import { ShuffleCommand } from '../src/commands/shuffle'
import { Subscription, getSubscription } from '../src/bot'
import { Message } from 'discord.js'

const fakeReply = jest.fn()

const message = {
    reply: fakeReply,
    guild: {
        id: 1
    }
} as unknown as Message

const bot = getSubscription(message)


const len = bot.queue.length
ShuffleCommand.execute(message)
test("Queue length should remain unchanged", () => {
    expect(bot.queue.length).toBe(len)
})

test("Message.send should be executed at least once", () => {
    expect(fakeReply.mock.calls.length).toBeGreaterThanOrEqual(1)
})

