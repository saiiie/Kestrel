require('dotenv').config();
const amqp = require('amqplib');
const axios = require('axios');

// The exact queue name we defined in the Spring Boot Publisher
const QUEUE_NAME = 'kestrel-alerts-queue';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

async function startDispatcher() {
    try {
        console.log('🦅 Kestrel Dispatcher: Booting up...');

        // 1. Connect to RabbitMQ
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // 2. Ensure the queue exists before we try to read from it
        await channel.assertQueue(QUEUE_NAME, { durable: true }); // Must match Spring Boot's default!

        console.log(`✅ Connected to RabbitMQ. Listening for alerts on [${QUEUE_NAME}]...`);

        // 3. Start listening to the queue
        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                try {
                    // Parse the JSON payload coming from Java
                    const payload = JSON.parse(msg.content.toString());
                    console.log(`\n🚨 Alert received for ${payload.assetId}! Dispatching to Discord...`);

                    // 4. Send the Discord Message
                    await sendDiscordAlert(payload);

                    // 5. Tell RabbitMQ we successfully processed it so it can be deleted from the queue
                    channel.ack(msg);
                } catch (error) {
                    console.error('❌ Error processing message:', error.message);
                    // If it fails, reject it so it goes back in the queue or gets dropped safely
                    channel.nack(msg, false, false);
                }
            }
        });

    } catch (error) {
        console.error('❌ Failed to start Kestrel Dispatcher:', error);
        // Retry logic: If RabbitMQ isn't ready yet, try again in 5 seconds
        setTimeout(startDispatcher, 5000);
    }
}

async function sendDiscordAlert(payload) {
    // Destructure the payload from our Java DTO
    const { discordWebhookUrl, assetId, conditionType, targetPrice, currentLivePrice } = payload;

    // Determine the color based on the condition (Red for drops, Green for rises)
    const embedColor = conditionType === 'DROPS_BELOW' ? 16711680 : 65280;
    const actionText = conditionType === 'DROPS_BELOW' ? 'dropped below' : 'surged above';

    // Build a rich Discord Embed
    const discordMessage = {
        username: "Kestrel Sentinel",
        avatar_url: "https://i.imgur.com/rNfL8Gq.png", // A cool hawk icon!
        embeds: [
            {
                title: `🚨 Market Alert: ${assetId.toUpperCase()}`,
                description: `Your automated rule has been triggered! **${assetId}** has ${actionText} your target.`,
                color: embedColor,
                fields: [
                    { name: "Target Price", value: `$${targetPrice.toLocaleString()}`, inline: true },
                    { name: "Live Price", value: `$${currentLivePrice.toLocaleString()}`, inline: true }
                ],
                footer: { text: "Kestrel Automated Alerts" },
                timestamp: new Date().toISOString()
            }
        ]
    };

    // Make the POST request to the user's specific Webhook
    await axios.post(discordWebhookUrl, discordMessage);
    console.log(`✅ Successfully sent Discord alert to ${discordWebhookUrl.substring(0, 45)}...`);
}

// Start the app
startDispatcher();