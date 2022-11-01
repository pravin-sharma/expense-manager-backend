const nodemailer = require("nodemailer");

const mailer = async (
  userName,
  userEmail,
  categoryName,
  budget,
  overBudgetByAmount
) => {
  const transporter = nodemailer.createTransport({
    service: process.env.email_service,
    auth: {
      user: process.env.admin_user,
      pass: process.env.admin_pass,
    },
  });

  //Send mail to User
  const mailOptionsUser = {
    from: `Admin <${process.env.emailFrom}>`, //admin
    to: userEmail, //user
    subject: `Category: ${categoryName} is over budget`,
    text: `Dear ${userName},\nThe Category: "${categoryName}" is over buget by INR ${overBudgetByAmount} Rs.\nKindly update your Category wise budget(INR ${budget}) or spend more carefully`,
  };

  try {
    const sendMailToUser = await transporter.sendMail(mailOptionsUser);
    console.log("Email sent to user: " + sendMailToUser.response);
  } catch (error) {
    console.log(error);
  }
};

module.exports = mailer;
