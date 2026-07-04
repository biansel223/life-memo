const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 👉 静态文件目录（你的 dist）
app.use(express.static("dist"));

// 👉 数据文件
const DATA_FILE = "./data.json";

// 初始化数据
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]", "utf-8");
}

// 读取数据
function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

// 写入数据
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 👉 获取全部记录
app.get("/api/list", (req, res) => {
  res.json(readData());
});

// 👉 添加记录
app.post("/api/add", (req, res) => {
  const data = readData();
  data.push(req.body);
  writeData(data);
  res.json({ ok: true });
});

// 👉 删除记录
app.post("/api/delete", (req, res) => {
  const data = readData();
  data.splice(req.body.index, 1);
  writeData(data);
  res.json({ ok: true });
});

// 👉 启动服务器（关键）
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Life Memo running on", PORT);
});