const { test } = require('node:test');
const assert = require('node:assert/strict');
const { deliver, validateWebhook, buildMessage } = require('./delivery');
const payload = { discordWebhookUrl: 'https://discord.com/api/webhooks/123/test_token', assetId: 'bitcoin', conditionType: 'DEVIATES', targetPrice: 10, currentLivePrice: 100 };

test('rejects arbitrary destinations and deceptive Discord URLs', () => {
    for (const url of ['http://localhost/admin', 'https://discord.com.evil.test/api/webhooks/123/token', 'https://discord.com@127.0.0.1/api/webhooks/123/token', 'https://discord.com/api/webhooks/123/token?redirect=1']) {
        assert.throws(() => validateWebhook(url));
    }
});
test('deviation alert describes a deviation instead of a rise', () => {
    assert.match(buildMessage(payload).embeds[0].description, /deviated/);
});
test('retries rate limits, uses timeout and disables redirects', async () => {
    let calls = 0;
    const delays = [];
    await deliver(payload, { post: async (url, message, options) => {
        assert.equal(options.maxRedirects, 0);
        assert.equal(options.timeout, 10000);
        if (++calls === 1) throw { response: { status: 429, data: { retry_after: 2 } } };
    } }, async ms => delays.push(ms));
    assert.equal(calls, 2);
    assert.deepEqual(delays, [2000]);
});
test('does not retry permanent failures or disclose the webhook', async () => {
    let calls = 0;
    await assert.rejects(deliver(payload, { post: async () => { calls++; throw { response: { status: 404 } }; } }), /404/);
    assert.equal(calls, 1);
});
test('bounds retries for network failures', async () => {
    let calls = 0;
    await assert.rejects(deliver(payload, { post: async () => { calls++; throw new Error('network'); } }, async () => {}));
    assert.equal(calls, 4);
});
