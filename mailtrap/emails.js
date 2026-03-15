import { mailtrapClient, sender } from "../mailtrapConfig.js";

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify your email",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Verify Your Email Address</h2>
                    <p>Thank you for signing up! Your verification code is:</p>
                    <div style="font-size: 24px; font-weight: bold; background-color: #f4f4f4; padding: 10px; text-align: center; border-radius: 5px; margin: 20px 0;">
                        ${verificationToken}
                    </div>
                    <p>Enter this code on the verification page to complete your registration.</p>
                    <p>This code will expire in 24 hours.</p>
                </div>
            `,
            category: "Email Verification",
        });

        console.log("Email sent successfully", response);
    } catch (error) {
        console.error(`Error sending verification email`, error);
        throw new Error(`Error sending verification email: ${error}`);
    }
};

export const sendWelcomeEmail = async (email, name) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Welcome to Our Platform!",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Welcome, ${name}!</h2>
                    <p>We are thrilled to have you on board.</p>
                    <p>Your email has been successfully verified, and your account is now fully active.</p>
                    <p>Enjoy exploring all the features we have to offer.</p>
                    <br>
                    <p>Best regards,</p>
                    <p>The Team</p>
                </div>
            `,
            category: "Welcome Email",
        });

        console.log("Welcome email sent successfully", response);
    } catch (error) {
        console.error(`Error sending welcome email`, error);
        throw new Error(`Error sending welcome email: ${error}`);
    }
};
