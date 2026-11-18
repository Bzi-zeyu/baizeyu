/*
 * 作者: 白赜宇
 * 创建时间: 2026-11-13 14:01
 * 使用模型: Trae AI Assistant
 * 功能: 本地数据服务器（端口 3004）
 *       接口一 /api/poems   读取 db/db.json 中的 poems 诗词列表
 *       接口二 /api/authors 汇总 poems 中的作者列表（含每人作品数）
 *       接口三 /api/pic     图片代理，绕过图床防盗链
 *       同时托管项目根目录下的静态文件，方便直接预览 poem-gallery.html
 *
 * 启动方式（在项目根目录执行）: node db/server.js
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const BZY_PORT = 3004;
// 图片代理请求超时时间（毫秒）
const BZY_PIC_TIMEOUT = 8000;
// 静态资源根目录：db 文件夹的上一级（即项目根目录）
const BZY_ROOT = path.resolve(__dirname, '..');
const BZY_DB_FILE = path.join(__dirname, 'db.json');

// 常见文件类型与 Content-Type 对照表
const BZY_MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4'
};

/**
 * 向客户端返回 JSON 数据
 * @param {http.ServerResponse} bzyRes - 响应对象
 * @param {number} bzyStatus - HTTP 状态码
 * @param {*} bzyData - 要序列化为 JSON 的数据
 * @returns {void}
 */
function bzy_sendJson(bzyRes, bzyStatus, bzyData) {
  bzyRes.writeHead(bzyStatus, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store'
  });
  bzyRes.end(JSON.stringify(bzyData));
}

/**
 * 读取 db.json 并取出其中的 poems 数组（每次请求都重新读，改完数据刷新页面即可生效）
 * @returns {Promise<Array>} poems 数组，结构为 [{ title, content, pic }, ...]
 */
function bzy_readPoems() {
  return new Promise((bzyResolve, bzyReject) => {
    fs.readFile(BZY_DB_FILE, 'utf8', (bzyErr, bzyText) => {
      if (bzyErr) {
        bzyReject(bzyErr);
        return;
      }
      try {
        const bzyData = JSON.parse(bzyText);
        bzyResolve(Array.isArray(bzyData.poems) ? bzyData.poems : []);
      } catch (bzyParseErr) {
        bzyReject(bzyParseErr);
      }
    });
  });
}

/**
 * 读取 db.json 并汇总作者列表：按作品数量降序，数量相同按姓名排序
 * 对应 Express 写法 app.get('/api/authors', ...)，本项目用原生 http 实现
 * @returns {Promise<Array>} 作者数组，结构为 [{ name: '李白', count: 1 }, ...]
 */
function bzy_readAuthors() {
  return new Promise((bzyResolve, bzyReject) => {
    fs.readFile(BZY_DB_FILE, 'utf8', (bzyErr, bzyText) => {
      if (bzyErr) {
        bzyReject(bzyErr);
        return;
      }
      try {
        const bzyData = JSON.parse(bzyText);
        const bzyPoems = Array.isArray(bzyData.poems) ? bzyData.poems : [];
        const bzyCounter = new Map();

        bzyPoems.forEach((bzyPoem) => {
          const bzyName = (bzyPoem.author || '佚名').trim() || '佚名';
          bzyCounter.set(bzyName, (bzyCounter.get(bzyName) || 0) + 1);
        });

        const bzyAuthors = Array.from(bzyCounter, ([bzyName, bzyCount]) => ({ name: bzyName, count: bzyCount }));
        bzyAuthors.sort((bzyA, bzyB) => bzyB.count - bzyA.count || bzyA.name.localeCompare(bzyB.name, 'zh'));
        bzyResolve(bzyAuthors);
      } catch (bzyParseErr) {
        bzyReject(bzyParseErr);
      }
    });
  });
}

/**
 * 托管项目根目录下的静态文件（HTML / CSS / JS / 图片等）
 * @param {http.ServerResponse} bzyRes - 响应对象
 * @param {string} bzyPathname - 请求的 URL 路径，例如 /poem-gallery.html
 * @returns {void}
 */
function bzy_serveStatic(bzyRes, bzyPathname) {
  const bzyRelPath = decodeURIComponent(bzyPathname === '/' ? '/index.html' : bzyPathname);
  const bzyFile = path.join(BZY_ROOT, path.normalize(bzyRelPath).replace(/^[/\\]+/, ''));

  // 防止 ../ 越权访问项目根目录之外的文
  if (!bzyFile.startsWith(BZY_ROOT)) {
    bzyRes.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    bzyRes.end('403 禁止访问');
    return;
  }

  fs.readFile(bzyFile, (bzyErr, bzyBuffer) => {
    if (bzyErr) {
      bzyRes.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      bzyRes.end('404 找不到文件: ' + bzyRelPath);
      return;
    }
    bzyRes.writeHead(200, {
      'Content-Type': BZY_MIME[path.extname(bzyFile).toLowerCase()] || 'application/octet-stream'
    });
    bzyRes.end(bzyBuffer);
  });
}

/**
 * 图片代理：由服务器代替浏览器去拉取远程图片，再原样转发给页面
 * 用于绕过 Gitee 等图床的防盗链（浏览器带的 localhost Referer 会被拒绝）
 * @param {http.ServerResponse} bzyRes - 响应对象
 * @param {string} bzyTarget - 目标图片地址，例如 https://gitee.com/xxx/img/6.jpg
 * @param {number} [bzyDepth] - 当前重定向层数，防止死循环
 * @returns {void}
 */
function bzy_proxyPic(bzyRes, bzyTarget, bzyDepth) {
  const bzyDepthNow = bzyDepth || 0;
  let bzyUrl;

  try {
    bzyUrl = new URL(bzyTarget);
  } catch (bzyErr) {
    bzy_sendJson(bzyRes, 400, { message: 'url 参数不合法' });
    return;
  }

  if (bzyUrl.protocol !== 'http:' && bzyUrl.protocol !== 'https:') {
    bzy_sendJson(bzyRes, 400, { message: '只支持 http / https 图片地址' });
    return;
  }

  if (bzyDepthNow > 3) {
    bzy_sendJson(bzyRes, 502, { message: '图片重定向次数过多' });
    return;
  }

  const bzyClient = bzyUrl.protocol === 'https:' ? https : http;

  // 关键点：不带 Referer，并且伪装成普通浏览器 UA，避免被图床识别为盗链
  const bzyUpstream = bzyClient.get(bzyUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/*,*/*;q=0.8'
    },
    timeout: BZY_PIC_TIMEOUT
  }, (bzyRemote) => {
    const bzyStatus = bzyRemote.statusCode || 502;

    // 处理 3xx 重定向：拿到 Location 后用同样的方式再请求一次
    if (bzyStatus >= 300 && bzyStatus < 400 && bzyRemote.headers.location) {
      bzyRemote.resume();
      bzy_proxyPic(bzyRes, new URL(bzyRemote.headers.location, bzyUrl).href, bzyDepthNow + 1);
      return;
    }

    if (bzyStatus !== 200) {
      bzyRemote.resume();
      bzy_sendJson(bzyRes, 502, { message: '图片源站返回状态码 ' + bzyStatus });
      return;
    }

    // 只转发真正的图片，避免把 HTML 报错页当作图片返回
    const bzyType = bzyRemote.headers['content-type'] || '';
    if (!bzyType.startsWith('image/')) {
      bzyRemote.resume();
      bzy_sendJson(bzyRes, 502, { message: '目标地址不是图片，Content-Type 为 ' + (bzyType || '空') });
      return;
    }

    const bzyHeaders = {
      'Content-Type': bzyType,
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    };
    if (bzyRemote.headers['content-length']) {
      bzyHeaders['Content-Length'] = bzyRemote.headers['content-length'];
    }

    bzyRes.writeHead(200, bzyHeaders);
    bzyRemote.pipe(bzyRes);
  });

  bzyUpstream.on('timeout', () => {
    bzyUpstream.destroy(new Error('请求图片超时'));
  });

  bzyUpstream.on('error', (bzyErr) => {
    if (!bzyRes.headersSent) {
      bzy_sendJson(bzyRes, 502, { message: '拉取图片失败', detail: bzyErr.message });
    } else {
      bzyRes.end();
    }
  });
}

const bzyServer = http.createServer((bzyReq, bzyRes) => {
  const bzyUrl = new URL(bzyReq.url, 'http://' + (bzyReq.headers.host || 'localhost'));

  // 数据接口：返回 db.json 中的 poems 数组
  if (bzyUrl.pathname === '/api/poems') {
    bzy_readPoems()
      .then((bzyPoems) => bzy_sendJson(bzyRes, 200, bzyPoems))
      .catch((bzyErr) => bzy_sendJson(bzyRes, 500, { message: '读取 db.json 失败', detail: bzyErr.message }));
    return;
  }

  // 作者列表接口：从 poems 中汇总作者与作品数量
  if (bzyUrl.pathname === '/api/authors') {
    bzy_readAuthors()
      .then((bzyAuthors) => bzy_sendJson(bzyRes, 200, { total: bzyAuthors.length, authors: bzyAuthors }))
      .catch((bzyErr) => bzy_sendJson(bzyRes, 500, { message: '读取作者列表失败', detail: bzyErr.message }));
    return;
  }

  // 图片代理：/api/pic?url=远程图片地址
  if (bzyUrl.pathname === '/api/pic') {
    const bzyTarget = bzyUrl.searchParams.get('url');
    if (!bzyTarget) {
      bzy_sendJson(bzyRes, 400, { message: '缺少 url 参数，用法：/api/pic?url=图片地址' });
      return;
    }
    bzy_proxyPic(bzyRes, bzyTarget);
    return;
  }

  // 其余请求按静态文件处理
  bzy_serveStatic(bzyRes, bzyUrl.pathname);
});

bzyServer.on('error', (bzyErr) => {
  if (bzyErr.code === 'EADDRINUSE') {
    console.error('端口 ' + BZY_PORT + ' 已被占用，请先关闭占用该端口的程序再启动。');
  } else {
    console.error('服务器启动失败:', bzyErr.message);
  }
});

bzyServer.listen(BZY_PORT, () => {
  console.log('数据服务器已启动');
  console.log('页面地址: http://localhost:' + BZY_PORT + '/poem-gallery.html');
  console.log('数据接口: http://localhost:' + BZY_PORT + '/api/poems');
});
