const sgMail = require("@sendgrid/mail");

exports.sendMail = (options) => {
  const { SENDGRID_API_KEY } = process.env;
  sgMail.setApiKey(SENDGRID_API_KEY);

  const passwordString = options.password
    ? `${options.password} is your current password. <br><br>`
    : "";

  const msg = {
    from: process.env.email,
    to: options.email,
    subject: options.emailSubject,
    html: `<p> Hello ${options.username}, <br>
    
    ${options.emailBody}</p>
    ${options.routeString}<br><br>
    ${passwordString}
    
    Kind Regards,<br> 
    NOYZ`,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};

//${process.env.aws}/${options.routeString}/${options.email}/${options.confirmationCode}

// <a href =  https://noyzapp/logins/${options.email}/${options.confirmationCode}>Click Here</a> <br><br>
