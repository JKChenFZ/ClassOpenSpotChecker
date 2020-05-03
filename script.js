const axios = require("axios");
const cheerio = require("cheerio");
const htmlparser2 = require('htmlparser2');
require('dotenv').config()

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

let main = async () => {
    try {
        // URL in Oscar
        const rawContent = await axios.get(`${process.env.COURSE_FULL_URL}`);
        const parsedContent = htmlparser2.parseDOM(rawContent.data);
        const $class = cheerio.load(parsedContent);

        const $cap = $class(".datadisplaytable").find(".dddefault")[1].children[0].data;
        const $curr = $class(".datadisplaytable").find(".dddefault")[2].children[0].data;
        const $remain = $class(".datadisplaytable").find(".dddefault")[3].children[0].data;

        const msg = `Course Stats ${$cap}-${$curr}-${$remain}`;

        if ($remain !== "0") {
            await sendMessage(
                `${new Date(Date.now()).toLocaleString()}\n${msg}\n See you in an hour...`
            );
        }
    } catch (error) {
        const timestamp = new Date(Date.now()).toLocaleString();
        await sendMessage(`${timestamp} Failure detected`);

        console.log(`${timestamp} \n ${error.toString()}`);
    }
};

let sendMessage = async (body) => {
    try {
        await client.messages.create({
            to: process.env.MY_NUMBER,
            from: process.env.TWILIO_NUMBER,
            body: body
        });
    } catch(error) {
        const timestamp = new Date(Date.now()).toLocaleString();
        console.log(`${timestamp} \n ${error.toString()}`);
    }
};

main();
setInterval(main, 600000);