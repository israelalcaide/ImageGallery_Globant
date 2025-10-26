// server.js — Node 18+ (sin npm i)
const http = require("http");
const { URL } = require("url");

// === Ajusta estos valores ===
const CLIENT_ID     = "dcsFT30KGGIStWRqJ1-pGXoWgMZD0EEGhTufldiPxJc";
const CLIENT_SECRET = "3g4S-A8dz6oqIPFF14UHT2gmpaSen5x4_tFJzNYVwLk";
const REDIRECT_URI  = "http://localhost:3000/callback";
const FRONT_ORIGIN  = "http://localhost:5500";
const FRONT_INDEX   = "/ex00/public/index.html";

function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", FRONT_ORIGIN);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
}

async function exchangeCodeForToken(code) {
  const r = await fetch("https://unsplash.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json(); 
}

async function proxyUnsplash(method, path, query, token, body, contentType) {
  const url = new URL("https://api.unsplash.com/");
  url.pathname = path.replace(/^\/api\//, ""); // /api/me -> /me
  url.search   = query;
  const r = await fetch(url, {
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept-Version": "v1",
      ...(body ? { "Content-Type": contentType || "application/json" } : {})
    },
    body: body && ["POST","PUT","PATCH","DELETE"].includes(method) ? body : undefined
  });
  return {
    status: r.status,
    type: r.headers.get("content-type") || "application/json",
    text: await r.text()
  };
}

http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://localhost:3000");

  // CORS preflight
  if (req.method === "OPTIONS") {
    setCORS(res);
    res.statusCode = 204; return res.end();
  }

  // 1) Callback OAuth
  if (u.pathname === "/callback" && req.method === "GET") {
    try {
      const code = u.searchParams.get("code");
      if (!code) { res.statusCode = 400; return res.end("Missing ?code"); }
      const { access_token } = await exchangeCodeForToken(code);

      // Cookie httpOnly
      res.setHeader("Set-Cookie", `unsplash_token=${access_token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`);
      res.statusCode = 302;
      res.setHeader("Location", `${FRONT_ORIGIN}${FRONT_INDEX}`);
      return res.end();
    } catch (e) {
      res.statusCode = 400; return res.end("Token exchange failed: " + e.message);
    }
  }

  // 2) Logout (opcional): borra cookie (GET o POST)
  if (u.pathname === "/logout" && (req.method === "GET" || req.method === "POST")) {
    res.setHeader("Set-Cookie", "unsplash_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
    res.statusCode = 200; return res.end("ok");
  }

  // 3) Proxy Unsplash: GET/POST/DELETE
  if (u.pathname.startsWith("/api/")) {
    setCORS(res);

    // Lee token de cookie
    const cookie = req.headers.cookie || "";
    const m = cookie.match(/(?:^|;\s*)unsplash_token=([^;]+)/);
    if (!m) { res.statusCode = 401; return res.end(JSON.stringify({ error: "No token" })); }
    const token = decodeURIComponent(m[1]);

    // Body opcional
    let body = "";
    req.on("data", c => body += c);
    req.on("end", async () => {
      try {
        const { status, type, text } = await proxyUnsplash(
          req.method, u.pathname, u.search, token, body || null, req.headers["content-type"]
        );
        res.statusCode = status;
        res.setHeader("Content-Type", type);
        res.end(text);
      } catch (e) {
        res.statusCode = 500; res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }


  // 4) Archivos estáticos: /ex00/public y /ex00/assets
  const fs = require("fs");
  const path = require("path");
  const serveStatic = (filePath, contentType) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 404;
        return res.end("Not found");
      }
      res.statusCode = 200;
      if (contentType) res.setHeader("Content-Type", contentType);
      res.end(data);
    });
  };

  // Sirve /ex00/public/index.html y otros archivos públicos
  if (u.pathname.startsWith("/ex00/public/")) {
    const file = path.join(__dirname, u.pathname);
    const ext = path.extname(file).toLowerCase();
    const types = { ".html": "text/html", ".css": "text/css", ".js": "application/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
    return serveStatic(file, types[ext] || "application/octet-stream");
  }
  // Sirve /ex00/assets/*
  if (u.pathname.startsWith("/ex00/assets/")) {
    const file = path.join(__dirname, u.pathname);
    const ext = path.extname(file).toLowerCase();
    const types = { ".html": "text/html", ".css": "text/css", ".js": "application/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
    return serveStatic(file, types[ext] || "application/octet-stream");
  }

  // 404
  res.statusCode = 404; res.end("Not found");
}).listen(3000, () => console.log("Backend en http://localhost:3000"));
