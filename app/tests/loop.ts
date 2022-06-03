import { LoopCommand } from '../src/commands/loop'
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



afterEach(() => {
    fakeReply.mockClear()
})

test("Message.reply should be called at least once", () => {
    LoopCommand.execute(message,[]);
    expect(fakeReply.mock.calls.length).toBeGreaterThanOrEqual(1)
})

describe("Empty queue", () => {
    beforeEach(() => {
        bot.queue = []
    })

    test("Command should have no effect when currentSong is null", () => {
        bot.currentSong = null
        LoopCommand.execute(message)    
        expect(bot.queue.length).toBe(0)
    })

    test("Command should have effect when currentSong is not null (testcase: arg = 1)", () => {
        bot.currentSong = {}
        LoopCommand.execute(message)    
        expect(bot.queue.length).toBe(1)
    })

    test("Message.reply should be called at least once", () => {
        LoopCommand.execute(message)
        expect(fakeReply.mock.calls.length).toBeGreaterThanOrEqual(1)
    })
})

describe("Non-empty queue", () => {
    var len = 0
    beforeEach(() => {
        bot.queue = [
            {},
            {},
            {},
            {},
    ]
        len = bot.queue.length
    })

    describe("Giving wrong argument should have no effect on queue", () => {
        test("Message.reply should be called at least once", () => {
            LoopCommand.execute(message, ["-1"])
            expect(fakeReply.mock.calls.length).toBeGreaterThanOrEqual(1)
        })

        test("Non-positive argument", () => {
            LoopCommand.execute(message, ["-2"]) 
            expect(bot.queue.length).toBe(len)
        })

        test("Non-number argument", () => {
            LoopCommand.execute(message, ["2wr"]) 
            expect(bot.queue.length).toBe(len)
        })
    })

    describe("Giving vaild argument should multiply queue length", () => {
        test("Default argument should be 1 with song currently playing", () => {
            LoopCommand.execute(message) 
            expect(bot.queue.length).toBe((len + 1) * 2 - 1)
        })

        test("Default argument should be 1 with song NOT currently playing", () => {
            LoopCommand.execute(message) 
            expect(bot.queue.length).toBe(len * 2)
        })

        for(let i = 1; i < 8; ++i)
        {
            test(`Test case #${2*i - 1} arg = ${i+1} with song currently playing`, () => {
                bot.currentSong = null
                LoopCommand.execute(message, [(i+1).toString()])
                expect(bot.queue.length).toBe((len + 1) * (i+2) - 1)
            })

            test(`Test case #${2*i} arg = ${i+1} with song currently NOT playing`, () => {
                bot.currentSong = {}
                LoopCommand.execute(message, [(i+1).toString()])
                expect(bot.queue.length).toBe(len * (i+2))
            })
        }

    })

    test("Ensure that argument is not too large to make queue exceed 1000 length", () => {
        LoopCommand.execute(message, ['300']) 
        expect(bot.queue.length).toBeLessThanOrEqual(1000)
    })
})

