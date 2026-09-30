require('dotenv').config();
const amqp = require('amqplib');
const { deliver } = require('./delivery');
const QUEUE = 'kestrel-alerts-queue';
const FAILED_QUEUE = 'kestrel-alerts-failed';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

async function startDispatcher() {
    let connection;
    let reconnectScheduled = false;
    const reconnect = () => {
        if (reconnectScheduled) return;
        reconnectScheduled = true;
        setTimeout(startDispatcher, 5000);
    };
    try {
        connection = await amqp.connect(RABBITMQ_URL);
        connection.on('error', () => console.error('RabbitMQ connection error'));
        connection.on('close', reconnect);
        const channel = await connection.createConfirmChannel();
        channel.on('error', () => console.error('RabbitMQ channel error'));
        channel.on('close', () => { connection.close().catch(() => {}); reconnect(); });
        await channel.assertQueue(QUEUE, { durable: true });
        await channel.assertQueue(FAILED_QUEUE, { durable: true });
        await channel.prefetch(1);
        await channel.consume(QUEUE, async msg => {
            if (!msg) { connection.close().catch(() => {}); return; }
            try {
                await deliver(JSON.parse(msg.content.toString()));
                channel.ack(msg);
                console.log('Discord alert delivered');
            } catch {
                // Preserve exhausted/permanent failures for inspection and manual replay.
                // Do not log message bodies, HTTP errors, or webhook tokens.
                try {
                    await new Promise((resolve, reject) => {
                        channel.sendToQueue(FAILED_QUEUE, msg.content,
                            { persistent: true, contentType: 'application/json' },
                            error => error ? reject(error) : resolve());
                    });
                    channel.ack(msg);
                    console.error('Alert retained in failed queue for review');
                } catch {
                    // Closing the connection makes unacknowledged messages available again.
                    connection.close().catch(() => {});
                }
            }
        });
        console.log('Dispatcher listening for alerts');
    } catch {
        console.error('Dispatcher connection unavailable; retrying');
        if (connection) await connection.close().catch(() => {});
        reconnect();
    }
}

if (require.main === module) startDispatcher();
module.exports = { startDispatcher };
