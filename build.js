const fs = require("fs");
const path = require("path");
const http = require("http");

const file = process.argv[2] || "output.txt";
const watch = process.argv.includes("--watch");
const serve = process.argv.includes("--serve");

function parse(content) {
  const blocks = {};
  const regex = /===== (.+?) =====\s*([\s\S]*?)(?=====|$)/g;

  let match;
  while ((match = regex.exec(content))) {
    const name = match[1].trim();
    const body = match[2].trim();
    blocks[name] = body;
  }

  return blocks;
}

function build() {
  console.log("[v5-lite] reading", file);

  const raw = fs.readFileSync(file, "utf-8");
  const blocks = parse(raw);

  if (!blocks["index.html"]) {
    console.log("❌ missing index.html");
    return;
  }

  fs.mkdirSync("dist", { recursive: true });

  Object.keys(blocks).forEach((k) => {
    fs.writeFileSync(path.join("dist", k), blocks[k], "utf-8");
    console.log("[v5-lite] write", k);
  });

  console.log("[v5-lite] build done");
}

function startServer() {
  const server = http.createServer((req, res) => {
    let filePath = path.join(
      "dist",
      req.url === "/" ? "index.html" : req.url
    );

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end("Not found");
      }

      const ext = path.extname(filePath);
      const type = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "text/javascript",
      }[ext] || "text/plain";

      res.writeHead(200, { "Content-Type": type });
      res.end(data);
    });
  });

  server.listen(3000, () => {
    console.log("[v5-lite] server http://localhost:3000");
  });
}

build();

if (serve) startServer();

if (watch) {
  console.log("[v5-lite] watching...");
  fs.watchFile(file, { interval: 500 }, () => {
    console.log("[v5-lite] change detected");
    build();
  });
}