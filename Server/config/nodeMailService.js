import nodemailer from "nodemailer";

const SendMail = async (userEmail, subject, body) => {
  try {
    const transport = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
      },
    });
    const options = {
      from: process.env.AUTH_EMAIL,
      to: userEmail,
      subject,
      html: body,
    };

    transport.sendMail(options, () => {
      console.log(`Email is sent to ${userEmail}`);
    });
    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (error) {
    console.log(error.message);
  }
};
export default SendMail;
