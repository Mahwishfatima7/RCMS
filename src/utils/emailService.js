const fs = require("fs");
const path = require("path");
const { Resend } = require("resend");

// Initialize Resend
let resend;
let resendAvailable = false;

function initializeResend() {
  if (process.env.RESEND_API_KEY) {
    try {
      resend = new Resend(process.env.RESEND_API_KEY);
      resendAvailable = true;
    } catch (err) {
      console.error("Resend initialization failed:", err.message);
      resendAvailable = false;
      resend = null;
    }
  } else {
    console.error("Resend API key not configured");
    resend = null;
  }
}

// Initialize on startup
initializeResend();

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Send agent credentials email
exports.sendAgentCredentialsEmail = async (agentEmail, agentName, agentPassword) => {
  // Validate email
  if (!isValidEmail(agentEmail)) {
    console.error("Invalid email address format");
    return {
      success: false,
      message: "Invalid email address",
      details: "Please provide a valid email address"
    };
  }

  const emailContent = {
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: agentEmail,
    replyTo: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    subject: "RCMS Account Credentials - DXB Technologies",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0;">Welcome to RCMS</h2>
          <p style="color: #666; margin: 10px 0 0 0;">Replacement Case Management System</p>
        </div>
        
        <p style="color: #333; font-size: 16px;">Dear ${agentName},</p>
        
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          Your agent account has been successfully created in the RCMS system. Please use the following credentials to log in:
        </p>
        
        <div style="background-color: #e3f2fd; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 8px 0; color: #333;"><strong>Email:</strong> ${agentEmail}</p>
          <p style="margin: 8px 0; color: #333;"><strong>Password:</strong> ${agentPassword}</p>
        </div>
        
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          You can log in to RCMS at: <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}" style="color: #2196F3; text-decoration: none;">RCMS Portal</a>
        </p>
        
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          For security purposes, we recommend changing your password after your first login.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          This email was sent from DXB Technologies RCMS System. Please do not share your credentials with anyone.
        </p>
      </div>
    `,
    text: `Dear ${agentName},\n\nYour agent account has been successfully created in the RCMS system. Please use the following credentials to log in:\n\nEmail: ${agentEmail}\nPassword: ${agentPassword}\n\nYou can log in to RCMS at: ${process.env.FRONTEND_URL || 'http://localhost:8080'}\n\nFor security purposes, we recommend changing your password after your first login.\n\nThis email was sent from DXB Technologies RCMS System. Please do not share your credentials with anyone.`,
    tags: [
      { name: "category", value: "agent-onboarding" },
      { name: "type", value: "credentials" }
    ]
  };

  // If Resend not available, log to file
  if (!resend || !resendAvailable) {
    const emailLog = {
      timestamp: new Date().toISOString(),
      from: emailContent.from,
      to: agentEmail,
      subject: emailContent.subject,
      agentName,
      agentPassword,
      status: "PENDING - Resend unavailable"
    };
    
    const logFile = path.join(__dirname, "../../email-queue.json");
    let queue = [];
    
    try {
      if (fs.existsSync(logFile)) {
        queue = JSON.parse(fs.readFileSync(logFile, 'utf8'));
      }
      queue.push(emailLog);
      fs.writeFileSync(logFile, JSON.stringify(queue, null, 2));
    } catch (err) {
      console.error("Failed to queue email:", err.message);
    }

    console.warn("Resend service unavailable - email queued for later delivery");

    return { 
      success: false,
      message: "Resend service unavailable - email queued for manual delivery",
      queued: true,
      agentEmail,
      agentName,
      agentPassword,
      details: "Agent account created successfully. Email will be sent once Resend is configured."
    };
  }

  try {
    const response = await resend.emails.send(emailContent);
    
    if (response.error) {
      throw new Error(response.error.message || "Failed to send email");
    }
    
    return { 
      success: true, 
      message: "Email sent successfully",
      messageId: response.data.id
    };
  } catch (error) {
    console.error("Email sending failed:", error.message);
    
    return {
      success: false,
      message: error.message,
      details: "Agent created but email delivery failed"
    };
  }
};

