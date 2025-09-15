require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const mongoUri = process.env.MONGO_URI || null;
if (!mongoUri) {
  console.warn("⚠️ MONGO_URI not set. Please create backend/.env with your MongoDB Atlas connection string.");
} else {
  mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB connection error:', err.message));
}

// ---------------- Ledger Schema ----------------
const ledgerSchema = new mongoose.Schema({
  index: Number,
  timestamp: { type: Date, default: Date.now },
  data: mongoose.Schema.Types.Mixed,
  prevHash: String,
  hash: String
}, { collection: 'ledger' });

const Ledger = mongoose.model('Ledger', ledgerSchema);

// ---------------- File Fallback ----------------
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const FILE = path.join(__dirname, 'ledger.json');

function sha(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

async function getLastBlock() {
  if (mongoUri && mongoose.connection.readyState === 1) {
    const last = await Ledger.findOne().sort({ index: -1 }).lean();
    return last;
  } else {
    if (!fs.existsSync(FILE)) {
      const genesis = { index: 0, timestamp: new Date().toISOString(), data: "GENESIS", prevHash: "0" };
      genesis.hash = sha(JSON.stringify(genesis));
      fs.writeFileSync(FILE, JSON.stringify([genesis], null, 2));
    }
    const raw = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
    return raw[raw.length - 1];
  }
}

async function appendBlock(data) {
  const last = await getLastBlock();
  const nextIndex = (last && last.index != null) ? last.index + 1 : 1;

  const block = {
    index: nextIndex,
    timestamp: new Date().toISOString(),
    data,
    prevHash: last && last.hash ? last.hash : "0"
  };

  block.hash = sha(JSON.stringify(block));

  if (mongoUri && mongoose.connection.readyState === 1) {
    const doc = new Ledger(block);
    await doc.save();
    return doc.toObject();
  } else {
    const raw = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
    raw.push(block);
    fs.writeFileSync(FILE, JSON.stringify(raw, null, 2));
    return block;
  }
}

// ---------------- API Routes ----------------
app.post('/api/ledger', async (req, res) => {
  try {
    console.log("📩 Incoming request:", req.body);

    const { action, meta, tx } = req.body || {};

    // ✅ Safe fallback even if tx is missing
    const transactionHash = tx && tx.hash ? tx.hash : "pending-" + Date.now();

    const entry = {
      action: action || "UNKNOWN",
      meta: meta || {},
      txHash: transactionHash,
      receivedAt: new Date().toISOString()
    };

    const block = await appendBlock(entry);
    res.json({ success: true, block });

  } catch (e) {
    console.error("❌ Error in /api/ledger:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/ledger', async (req, res) => {
  try {
    if (mongoUri && mongoose.connection.readyState === 1) {
      const all = await Ledger.find().sort({ index: 1 }).lean();
      res.json(all);
    } else {
      if (!fs.existsSync(FILE)) return res.json([]);
      const raw = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
      res.json(raw);
    }
  } catch (e) {
    console.error("❌ Error in /api/ledger GET:", e);
    res.status(500).json({ error: e.message });
  }
});

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("🚀 Backend listening on port", PORT));
