const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// ✅ Railway 必须使用这个端口
const PORT = process.env.PORT || 3000;

app.use(express.json());

// =====================
// 静态文件（前端 dist）
// =====================
app.use(express.static(path.join(__dirname, "dist")));

// =====================
// 数据文件路径
// =====================
const DATA_FILE = path.join(__dirname, "data.json");

// =====================
// 初始化数据文件
// =====================
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]", "utf-8");
}

// =====================
// 工具函数
// =====================
function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw || "[]");
  } catch (err) {
    console.log("readData error:", err);
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// =====================
// API：获取列表
// =====================
app.get("/api/list", (req, res) => {
  res.json(readData());
});

// =====================
// API：新增记录
// =====================
app.post("/api/add", (req, res) => {
  const data = readData();
  data.push(req.body);
  writeData(data);
  res.json({ ok: true });
});

// =====================
// API：删除记录
// =====================
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
// 前端路由兜底（关键！避免刷新404）
// =====================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// =====================
// 启动服务（Railway标准写法）
// =====================
app.listen(PORT, () => {
  console.log("🚀 Life Memo running on port:", PORT);
});