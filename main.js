const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { join } = require('path');

// Path to the Chromium executable
const chromiumPath = join(__dirname, 'node_modules', 'puppeteer', 'lib', 'vendor', 'chromium', 'chromium');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    }
});

client.on('ready', () => {
    console.log('Client is ready!');
});

// QR Code generation
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Function to check if a user is an admin or super admin
function isAdmin(participants, senderId) {
    const senderData = participants.find(participant => participant.id._serialized === senderId);
    return senderData && (senderData.isAdmin || senderData.isSuperAdmin);
}

// Listening to all incoming messages
client.on('message', async (message) => {  
    console.log(message.body);
    
    const msg = message.body.toLowerCase();
    const chat = await message.getChat();
    const sender = await message.getContact();
    const senderId = sender.id._serialized;

    if (msg === 'hi') {
        message.reply('hi');
    } else if (msg === 'hello') {
        message.reply('hello');
    } else if (msg === '!everyone') {
        if (chat.isGroup) {
            const participants = chat.participants;
            if (isAdmin(participants, senderId)) {
                let text = '';
                let mentions = [];

                for (let participant of participants) {
                    const contact = await client.getContactById(participant.id._serialized);
                    mentions.push(contact);
                    text += `@${contact.id.user} `;
                }

                await chat.sendMessage(text.trim(), { mentions });
            } else {
                message.reply('Only admins or super admins can use this command.');
            }
        } else {
            message.reply('This command can only be used in group chats.');
        }
    } else if (msg === '!democracy') {
        if (chat.isGroup) {
            const participants = chat.participants;
            if (isAdmin(participants, senderId)) {
                await chat.setMessagesAdminsOnly(false);
                await message.reply('Democracy mode enabled. Everyone can send messages.');
            } else {
                await message.reply('Only admins or super admins can use this command.');
            }
        } else {
            await message.reply('This command can only be used in group chats.');
        }
    } else if (msg === '!dictatorship') {
        if (chat.isGroup) {
            const participants = chat.participants;
            if (isAdmin(participants, senderId)) {
                await chat.setMessagesAdminsOnly(true);
                await message.reply('Dictatorship mode enabled. Only admins can send messages.');
            } else {
                await message.reply('Only admins or super admins can use this command.');
            }
        } else {
            await message.reply('This command can only be used in group chats.');
        }
    }
});

// Initialize the client
client.initialize();
