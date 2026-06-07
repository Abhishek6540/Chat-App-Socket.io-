export const registrationBody =(name) =>  `
  <div style="font-family: Arial, sans-serif; background-color:#f4f4f4; padding:20px;">
    <div style="max-width:500px; margin:auto; background:#ffffff; padding:20px; border-radius:10px; text-align:center;">

      <h2 style="color:#4CAF50;">🎉 Registration Successful</h2>

      <p style="font-size:16px; color:#333;">
        Hello <b>${name}</b>,
      </p>

      <p style="font-size:14px; color:#555;">
        Your account has been created successfully. You can now login and start using our services.
      </p>

      <div style="margin:20px 0;">
        <a href="#" 
          style="background:#4CAF50; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
          Login Now
        </a>
      </div>

      <p style="font-size:12px; color:#999;">
        If you did not sign up for this account, please ignore this email.
      </p>

    </div>
  </div>
  `;
