const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// =====================
// 静态文件（安全版）
// =====================
const distPath = path.join(__dirname, "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// =====================
// 健康检查（Railway推荐）
// =====================
app.get("/health", (req, res) => {
  res.send("ok");
});

// =====================
// 数据文件
// =====================
const DATA_FILE = path.join(__dirname, "data.json");

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]", "utf-8");
}

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// =====================
// API
// =====================
app.get("/api/list", (req, res) => {
  res.json(readData());
});

app.post("/api/add", (req, res) => {
  const data = readData();
  data.push(req.body);
  writeData(data);
  res.json({ ok: true });
});

app.post("/api/delete", (req, res) => {
  const data = readData();
  const index = req.body.index;

  if (index >= 0 && index < data.length) {
    data.splice(index, 1);
    writeData(data);
  }

  res.json({ ok: true });
});

// =====================
// 启动
// =====================
app.listen(PORT, () => {
  console.log("🚀 Life Memo running on port:", PORT);
});