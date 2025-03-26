// https://www.rabbitmq.com/tutorials/tutorial-one-javascript

import amqp from "amqplib";
import dotenv from "dotenv";
import { createUserFromClient } from "../controllers/userController.js";

dotenv.config();

const RABBIT_HOST = process.env.RABBIT_HOST;
const RABBIT_EXCHANGE = "client_created";
const QUEUE_NAME = "user_creation_queue";

async function startConsumer() {
    try {
        const connection = await amqp.connect(RABBIT_HOST);
        const channel = await connection.createChannel();

        await channel.assertExchange(RABBIT_EXCHANGE, "topic", { durable: true });
        const q = await channel.assertQueue(QUEUE_NAME, { durable: true });

        await channel.bindQueue(q.queue, RABBIT_EXCHANGE, "client.new");

        console.log(`Esperando clientes nuevos: ${RABBIT_EXCHANGE}`);

        channel.consume(q.queue, async (msg) => {
            if (msg !== null) {
                const clientData = JSON.parse(msg.content.toString());
                console.log("Mensaje recibido:", clientData);

                try {
                    await createUserFromClient(clientData);
                    channel.ack(msg);
                } catch (error) {
                    console.error("Error procesando mensaje:", error);
                }
            }
        });

    } catch (error) {
        console.error("Error conectando con RabbitMQ:", error);
    }
}

export default startConsumer;