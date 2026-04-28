# 腾讯云部署说明

推荐使用腾讯云轻量应用服务器或 CVM，系统选择 Ubuntu 22.04/24.04。项目会以一个 Node 服务同时提供前端页面和 `/api` 后端接口。

## 服务器准备

安装 Node.js 18+、Git、PM2 和 Nginx：

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx
sudo npm i -g pm2
```

## 拉取和配置项目

```bash
git clone https://github.com/liuhongyu14/hhjz.git
cd hhjz
npm ci
```

创建 `.env`：

```bash
POSTGRES_URL=你的数据库连接地址
JWT_SECRET=你的JWT密钥
NODE_ENV=production
PORT=3000
```

## 构建和启动

```bash
npm run build:tencent
pm2 start npm --name hhjz -- run start:tencent
pm2 save
pm2 startup
```

本机验证：

```bash
curl http://127.0.0.1:3000/api/me
```

未登录时返回 `{"message":"登录后继续"}` 说明后端正常。

## Nginx 反向代理

创建配置：

```bash
sudo nano /etc/nginx/sites-available/hhjz
```

写入：

```nginx
server {
    listen 80;
    server_name hhdsh.icu www.hhdsh.icu;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/hhjz /etc/nginx/sites-enabled/hhjz
sudo nginx -t
sudo systemctl reload nginx
```

## 域名解析

在域名 DNS 控制台添加：

- `@` A 记录 -> 腾讯云服务器公网 IP
- `www` A 记录 -> 腾讯云服务器公网 IP

## HTTPS 证书

域名解析生效后，可用 Certbot 申请免费证书：

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d hhdsh.icu -d www.hhdsh.icu
```

## 更新部署

以后每次更新代码：

```bash
git pull
npm ci
npm run build:tencent
pm2 restart hhjz
```
