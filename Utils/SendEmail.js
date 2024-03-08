import nodeMailer from "nodemailer";
import { promisify } from "util";
import fs from "fs";
import hbs from "hbs";

const readFile = promisify(fs.readFile);

const sendEmail = async (options) => {
  const { qrCode, email,subject,id } = options;

  // const content = await readFile(`view/${htmlFile}`, "utf8");
  // const template = hbs.compile(content);
  // const html = template({ qrCode });

  const transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    // host: process.env.SMPT_HOST,
    port: 587,
    // port: process.env.SMTP_PORT,
    auth: {
      // user: process.env.SMPT_MAIL,
      user: 'paragdevtest12345@gmail.com',
      pass: 'zgyvcaakdzuhblgv',
      // pass: process.env.SMPT_PASSWORD,
    },
  });
  console.log(qrCode, "inside mail");

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: email,
    subject: subject,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Pass QR Code</title>
</head>
<body>
  <p>Dear Sir / Mam,</p>

  <p>Excited for the upcoming event! Your personalized QR code is attached for quick access. Please ensure to scan it at the event for verification.</p>

  <p>${process.env.APP_URL}?id=${id}</p>

  <p>Looking forward to seeing you there!</p>
  <p>Best regards,</p>
</body>
</html>`,
    text: "Please find below the Event Pass Qr Code",
    attachments: [
      {
        filename: "qrcode.png",
        content: qrCode,
        encoding: "base64",
      },
    ], // Use 'html' instead of 'text' for HTML content
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
