import nodemailer from "nodemailer";
import { Router } from "express";
import Imap from "imap";
import { inspect } from "util";
// to both smtp and imap protocal to work
// https://myaccount.google.com/lesssecureapps
const router = Router();

// const transporter = nodemailer.createTransport({
//     host: 'smtp.ethereal.email',
//     port: 587,
//     auth: {
//         user: 'eliane.emmerich9@ethereal.email',
//         pass: 'QUtzvtFJjBUfu89Xu5'
//     }
// });

async function mailService() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "googlman6300@gmail.com",
      pass: "95782641dinthomas",
    },
  });

  // actual mail
  let info = await transporter.sendMail({
    to: "googlman6300@gmail.com",
    subject: "hello",
    text: "some text",
  });
  console.log("info:", info);

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

router.route("/").get(async (req, res) => {
  try {
    await mailService();
  } catch (e) {
    console.log(e);
  }
  res.send("successfully sent an email");
});

function iampClient() {
  const imap = new Imap({
    user: "googlman6300@gmail.com",
    password: "95782641dinthomas",
    host: "imap.gmail.com",
    port: 993,
    tls: true,
  });

  function openInbox(cb: any) {
    imap.openBox("INBOX", true, cb);
  }

  imap.once("ready", function () {
    openInbox(function (err: Error, box: any) {
      if (err) throw err;

      const f = imap.seq.fetch("6240:6245", {
        bodies: "HEADER.FIELDS (FROM TO SUBJECT DATE)",
        struct: true,
      });
      f.on("message", function (msg, seqno) {
        console.log("Message #%d", seqno);
        const prefix = "(#" + seqno + ") ";
        msg.on("body", function (stream, info) {
          let buffer = "";
          stream.on("data", function (chunk) {
            buffer += chunk.toString("utf8");
          });
          stream.once("end", function () {
            console.log(
              prefix + "Parsed header: %s",
              inspect(Imap.parseHeader(buffer))
            );
          });
        });
        msg.once("attributes", function (attrs) {
          console.log(prefix + "Attributes: %s", inspect(attrs, false, 8));
        });
        msg.once("end", function () {
          console.log(prefix + "Finished");
        });
      });
      f.once("error", function (err) {
        console.log("Fetch error: " + err);
      });
      f.once("end", function () {
        console.log("Done fetching all messages!");
        imap.end();
      });
    });
  });

  imap.once("error", function (err: Error) {
    console.log(err);
  });

  imap.once("end", function () {
    console.log("Connection ended");
  });

  imap.connect();
}

router.route("/imap").get((req, res) => {
  iampClient();
  res.send("imap server");
});

export { router as mailRoutes };
