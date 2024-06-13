# Proxmox sidecar
Turn VMs on/off. Proxmox simplified remote control for VMs. Expose proxmox VE api using reverse proxy(using nginx), and expose a remote control like page.

## Example
<img src="docs/screen.png" width="256">

## Configuration
Before installation, you need to generate an API token and fill it inside the `index.js` file. Also fill in the correct proxmox api base url(the one that will be exposed by the Nginx configuration).

![Javascript configuration header](docs/header.png)

## Installation

1. Install nginx
```bash
apt-get install nginx
``` 

2. Create nginx server config file
```bash
nano /etc/nginx/sites-available/default
``` 

3. Edit nginx server config file
```bash
server {
    listen 8080;
    server_name pve.local.com;      

    location / {
        proxy_pass https://0.0.0.0:8006;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Enable CORS
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, DELETE, PUT';
        add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    }
}

server {
    listen 8081 default_server;
    listen [::]:8081 default_server;
    server_name _;
    root /media/proxmox-sidecar;
    autoindex on;
}
```

4. Create proxmox-sidecar public folder, and put the files from this project inside it:
```bash
mkdir /media/proxmox-sidecar

# add "index.html, index.css, index.js" inside the folder
```

5. Reload nginx
```bash
systemctl reload nginx
```