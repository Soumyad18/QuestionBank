# npm install troubleshooting (403 Forbidden)

If `npm install` fails with `403 Forbidden` in restricted environments, the issue is usually registry/proxy policy, not project code.

## 1) Check active npm/proxy configuration

```bash
npm config list
env | grep -i proxy
npm config get registry
```

## 2) If your organization provides an internal npm registry

```bash
npm config set registry https://<your-internal-registry>/
npm config set //<your-internal-registry>/:_authToken=${NPM_TOKEN}
npm ping
npm install
```

## 3) If you need public npmjs access

Ask network/security to allow access to:

- `https://registry.npmjs.org`
- `https://registry.npmjs.org/-/ping`

## 4) If proxy variables are incorrect

Temporarily run without proxy env vars:

```bash
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy -u npm_config_http_proxy -u npm_config_https_proxy npm install
```

## 5) If custom certificates are required

```bash
npm config set cafile /path/to/your-org-ca.crt
```

## Verification

```bash
npm ping --registry=$(npm config get registry)
npm view react version
```
