const axios = require('axios');

function validateWebhook(value) {
    if (typeof value !== 'string' || !/^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/[0-9]+\/[A-Za-z0-9_-]+$/.test(value)) {
        throw new Error('Invalid Discord webhook URL');
    }
    return value;
}

function buildMessage(payload) {
    const { assetId, conditionType, targetPrice, currentLivePrice } = payload;
    if (conditionType === 'TEST_CONNECTION') {
        return { embeds: [{ title: 'Kestrel Connection Test', description: 'Your Discord connection is working.', color: 3447003 }] };
    }
    const actions = { DROPS_BELOW: 'dropped below', RISES_ABOVE: 'risen above', DEVIATES: 'deviated from its baseline by more than' };
    if (!actions[conditionType] || typeof assetId !== 'string' || !Number.isFinite(targetPrice) || !Number.isFinite(currentLivePrice)) {
        throw new Error('Invalid alert payload');
    }
    return {
        username: 'Kestrel Sentinel',
        embeds: [{
            title: `Market Alert: ${assetId.toUpperCase()}`,
            description: `${assetId} has ${actions[conditionType]} your $${targetPrice.toLocaleString()} threshold.`,
            color: conditionType === 'DROPS_BELOW' ? 16711680 : 65280,
            fields: [
                { name: 'Target / deviation threshold', value: `$${targetPrice.toLocaleString()}`, inline: true },
                { name: 'Live Price', value: `$${currentLivePrice.toLocaleString()}`, inline: true },
            ],
            timestamp: new Date().toISOString(),
        }],
    };
}

async function deliver(payload, http = axios, sleep = ms => new Promise(resolve => setTimeout(resolve, ms))) {
    const url = validateWebhook(payload.discordWebhookUrl);
    const message = buildMessage(payload);
    for (let attempt = 0; attempt < 4; attempt++) {
        try {
            // Never follow a redirect to an arbitrary server; webhook URLs are credentials.
            await http.post(url, message, { timeout: 10000, maxRedirects: 0 });
            return;
        } catch (error) {
            const status = error.response?.status;
            if (attempt === 3 || (status && status !== 429 && status < 500)) throw new Error(`Discord delivery failed (${status || 'network'})`);
            const retryAfter = Number(error.response?.data?.retry_after);
            await sleep(Math.min(60000, Math.max(1000 * 2 ** attempt, Number.isFinite(retryAfter) ? retryAfter * 1000 : 0)));
        }
    }
}

module.exports = { validateWebhook, buildMessage, deliver };
