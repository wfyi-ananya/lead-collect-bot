import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

const {
  PORT,
  GTWY_AUTH_SECRET,
  GTWY_ORG_ID,
  GTWY_CHATBOT_ID,
  GTWY_BRIDGE_NAME
} = process.env;

if (!GTWY_AUTH_SECRET) {
  throw new Error("Missing GTWY_AUTH_SECRET in .env");
}

app.post("/api/chatbot-token", async (req, res) => {
  try {
    const {
      user_id,
      email,
      page,
      source,
      userType,
      interestedService,
      leadStage,
      campaign
    } = req.body || {};

    const threadId = user_id || uuidv4();

    const payload = {
      org_id: GTWY_ORG_ID,
      chatbot_id: GTWY_CHATBOT_ID,
      user_id: threadId,
      variables: {
        source: source || "website",
        page: page || "unknown",
        userEmail: email || "",
        userType: userType || "unknown",
        interestedService: interestedService || "",
        leadStage: leadStage || "new",
        campaign: campaign || ""
      }
    };

    const embedToken = jwt.sign(payload, GTWY_AUTH_SECRET);

    return res.json({
      success: true,
      embedToken,
      threadId,
      bridgeName: GTWY_BRIDGE_NAME
    });
  } catch (error) {
    console.error("Chatbot token generation failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate chatbot token"
    });
  }
});

app.listen(PORT || 3000, () => {
  console.log(`Server running on http://localhost:${PORT || 3000}`);
});
