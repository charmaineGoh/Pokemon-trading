import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { userFile, readJson, writeJson, ensureDir } from "./utils/fileStore.js";
import { extractCardNameFromImage } from "./services/ocr.js";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// --- Cloudinary Configuration ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- ESM-safe __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// --- Uploads: save to Cloudinary ---
const UPLOADS_DIR = path.join(__dirname, "../uploads");
ensureDir(UPLOADS_DIR);

// Multer storage (for temporary local storage before uploading to Cloudinary)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({ storage });

// Helper function to upload to Cloudinary
async function uploadToCloudinary(filePath, folder) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `pokemon-trading/${folder}`,
      resource_type: "auto",
    });
    // Delete local file after upload
    fs.unlinkSync(filePath);
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}

function getUser(usernameRaw) {
  const username = usernameRaw.trim().toLowerCase();
  const file = userFile(username);
  return readJson(file);
}

function createUser(usernameRaw, profilePic = "eevee") {
  const username = usernameRaw.trim().toLowerCase();
  const file = userFile(username);
  if (fs.existsSync(file)) return null;
  const data = { username, cards: [], trades: [], profilePic };
  writeJson(file, data);
  return data;
}

function saveUser(user) {
  writeJson(userFile(user.username), user);
}

// --- Users ---
function handleLogin(req, res) {
  const { username } = req.body || {};
  if (!username || !username.trim()) {
    return res.status(400).json({ error: "Username is required" });
  }
  const uname = username.trim().toLowerCase();
  const user = getUser(uname);
  if (!user)
    return res.status(404).json({ error: "User not found. Please sign up first." });
  res.json({ user });
}

function handleSignup(req, res) {
  const { username, profilePic } = req.body || {};
  if (!username || !username.trim()) {
    return res.status(400).json({ error: "Username is required" });
  }
  const created = createUser(username, profilePic || "eevee");
  if (!created) return res.status(409).json({ error: "Username already taken" });
  res.status(201).json({ user: created });
}

app.post(["/api/users/login", "/users/login"], handleLogin);
app.post(["/api/users/signup", "/users/signup"], handleSignup);

app.get("/api/users/:username", (req, res) => {
  const uname = req.params.username.trim().toLowerCase();
  const file = userFile(uname);
  const data = readJson(file);
  if (!data) return res.status(404).json({ error: "User not found" });
  res.json({ user: data });
});

// --- Cards ---
app.post("/api/cards/add", upload.single("image"), async (req, res) => {
  try {
    const { username, price, condition, name: providedName } = req.body;

    if (!username) return res.status(400).json({ error: "username required" });

    const user = getUser(username);
    if (!user) return res.status(404).json({ error: "User not found" });

    const imgPath = req.file ? req.file.path : null;
    if (!imgPath) return res.status(400).json({ error: "image required" });

    const detectedName =
      providedName && providedName.trim()
        ? providedName.trim()
        : await extractCardNameFromImage(imgPath);

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(imgPath, username);

    const id = uuidv4();


    const card = {
      id,
      name: detectedName,
      price: Number(price || 0),
      condition: Number(condition || 5),
      imageUrl,
      createdAt: new Date().toISOString(),
    };

    user.cards.push(card);
    saveUser(user);

    const totalValue = user.cards.reduce(
      (sum, c) => sum + (Number(c.price) || 0),
      0
    );

    res.json({ card, totalValue });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to add card" });
  }
});

// OCR only: extract name from uploaded image without saving a card
app.post("/api/cards/recognize", upload.single("image"), async (req, res) => {
  try {
    const imgPath = req.file ? req.file.path : null;
    if (!imgPath) return res.status(400).json({ error: "image required" });

    const name = await extractCardNameFromImage(imgPath);
    res.json({ name });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to recognize card" });
  }
});

// --- Sharing ---
app.get("/api/share/:username", (req, res) => {
  const uname = req.params.username.trim().toLowerCase();
  const data = readJson(userFile(uname));
  if (!data) return res.status(404).json({ error: "User not found" });

  res.json({ collection: { username: data.username, cards: data.cards } });
});

// --- Trades ---
app.get("/api/trades/:username", (req, res) => {
  const uname = req.params.username.trim().toLowerCase();
  const user = readJson(userFile(uname));
  if (!user) return res.status(404).json({ error: "User not found" });

  // Only show pending trades so handled offers disappear from notifications
  res.json({
    trades: (user.trades || []).filter(
      (t) => t.to === uname && t.status === "pending"
    ),
  });
});

app.post("/api/trades/create", upload.single("offeredImage"), async (req, res) => {
  try {
    const {
      ownerUsername,
      requesterUsername,
      ownerCardId,
      offeredCardId,
      offeredPrice,
      offeredCondition,
      offeredName,
    } = req.body;

    if (!ownerUsername || !requesterUsername || !ownerCardId) {
      return res.status(400).json({ error: "Missing trade fields" });
    }

    const owner = getUser(ownerUsername);
    const requester = getUser(requesterUsername);

    if (!owner || !requester) {
      return res.status(404).json({ error: "Owner or requester not found" });
    }

    const ownerCard = owner.cards.find((c) => c.id === ownerCardId);
    if (!ownerCard) return res.status(404).json({ error: "Owner card not found" });

    let offeredCard;

    // Check if user selected existing card from their collection
    if (offeredCardId) {
      const existingCard = requester.cards.find((c) => c.id === offeredCardId);
      if (!existingCard) {
        return res
          .status(404)
          .json({ error: "Offered card not found in your collection" });
      }
      offeredCard = { ...existingCard }; // Clone the card
    } else {
      // User uploaded new card
      let offeredImageUrl = null;
      let derivedName = offeredName || "Unknown Card";

      if (req.file) {
        const imgPath = req.file.path;
        
        // Try extracting name from image BEFORE uploading (file will be deleted after)
        if (!offeredName) derivedName = await extractCardNameFromImage(imgPath);
        
        // Upload to Cloudinary
        offeredImageUrl = await uploadToCloudinary(imgPath, requester.username);
      }

      offeredCard = {
        id: uuidv4(),
        name: derivedName,
        price: Number(offeredPrice || 0),
        condition: Number(offeredCondition || 5),
        imageUrl: offeredImageUrl,
        createdAt: new Date().toISOString(),
      };
    }

    const trade = {
      id: uuidv4(),
      from: requester.username,
      to: owner.username,
      ownerCardId,
      offeredCard,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    owner.trades = owner.trades || [];
    owner.trades.push(trade);
    saveUser(owner);

    res.json({ trade });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create trade" });
  }
});

app.post("/api/trades/:username/:tradeId/accept", (req, res) => {
  const uname = req.params.username.trim().toLowerCase();
  const tradeId = req.params.tradeId;

  const owner = readJson(userFile(uname));
  if (!owner) return res.status(404).json({ error: "Owner not found" });

  const trade = (owner.trades || []).find((t) => t.id === tradeId);
  if (!trade) return res.status(404).json({ error: "Trade not found" });
  if (trade.status !== "pending")
    return res.status(400).json({ error: "Trade already handled" });

  const requester = readJson(userFile(trade.from));
  if (!requester) return res.status(404).json({ error: "Requester not found" });

  // Exchange cards
  const ownerCardIdx = owner.cards.findIndex((c) => c.id === trade.ownerCardId);
  if (ownerCardIdx === -1)
    return res.status(404).json({ error: "Owner card missing" });

  const ownerCard = owner.cards[ownerCardIdx];

  owner.cards.splice(ownerCardIdx, 1);
  requester.cards.push(ownerCard);

  const offered = trade.offeredCard;
  requester.cards = requester.cards.filter((c) => c.id !== offered.id); // ensure not duplicate
  owner.cards.push(offered);

  trade.status = "accepted";
  saveUser(owner);
  writeJson(userFile(requester.username), requester);

  res.json({ trade, owner, requester });
});

app.post("/api/trades/:username/:tradeId/decline", (req, res) => {
  const uname = req.params.username.trim().toLowerCase();
  const tradeId = req.params.tradeId;

  const owner = readJson(userFile(uname));
  if (!owner) return res.status(404).json({ error: "Owner not found" });

  const trade = (owner.trades || []).find((t) => t.id === tradeId);
  if (!trade) return res.status(404).json({ error: "Trade not found" });
  if (trade.status !== "pending")
    return res.status(400).json({ error: "Trade already handled" });

  trade.status = "declined";
  saveUser(owner);

  res.json({ trade });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
