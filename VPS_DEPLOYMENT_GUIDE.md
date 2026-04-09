## Updating the Right‑Stay site on the VPS (GitHub + Next.js)

This guide explains how to pull new code from GitHub on your VPS, handle common git merge issues, and fix the typical Next.js build permission and module errors you’ve hit in production.

---

### 1. Connect to the VPS and go to the app folder

```bash
ssh richard@rightstay-production01     # or your server host
cd /home/richard/app                   # or /home/richard/app5 etc.
```

All commands in this guide assume you run them from the app directory.

---

### 2. Pull latest changes from GitHub

```bash
git fetch origin
git status          # optional: see what will change
git pull origin main
```

If `git pull` succeeds, go to **section 4** to install dependencies and build.

If you see a **merge conflict / local changes** message (like the one you saw for `package-lock.json`), follow the next section.

---

### 3. Fixing git merge issues (e.g. `package-lock.json`)

Example error:

```text
From github.com:HanSolo4203/Right-Stay
 * branch            main       -> FETCH_HEAD
Updating cd3f44a..41376fd
error: Your local changes to the following files would be overwritten by merge:
        package-lock.json
Please commit your changes or stash them before you merge.
Aborting
```

This means you have local modifications that would be overwritten by the incoming changes.

You have three main options:

- **A. Discard local changes and use GitHub’s version**  
  (Recommended for `package-lock.json` on the VPS.)

  ```bash
  # Reset just package-lock.json to the version from main
  git checkout -- package-lock.json

  # Or reset all local changes in the working tree
  git reset --hard HEAD

  # Then pull again
  git pull origin main
  ```

- **B. Stash your local changes, pull, then (optionally) re‑apply**

  ```bash
  git stash
  git pull origin main

  # If you really need your old changes back:
  git stash pop
  ```

- **C. Commit then pull (rarely needed on the VPS)**  
  Only use this if you intentionally edited files directly on the VPS and want to keep those edits in git.

  ```bash
  git add .
  git commit -m "Local changes on VPS"
  git pull origin main
  ```

Once `git pull` completes successfully, continue to dependencies & build.

---

### 4. Install / update dependencies

Whenever you’ve pulled new code (especially when `package.json` or `package-lock.json` changed), run:

```bash
cd /home/richard/app   # ensure you are in the app dir
npm install
```

If `npm install` fails, fix that first (network issues, permissions, etc.) before continuing.

---

### 5. Fixing Next.js build permission errors (`EACCES`)

Example error you hit:

```text
> next build

> Build error occurred
Error: EACCES: permission denied, unlink '/home/richard/app/.next/server/app-paths-manifest.json'
  errno: -13,
  code: 'EACCES',
  syscall: 'unlink',
  path: '/home/richard/app/.next/server/app-paths-manifest.json'
```

This means the user running `npm run build` doesn’t have permission to delete files in the `.next` folder (often because a previous build ran as `root`).

**Fix ownership and clear the build folder:**

```bash
cd /home/richard/app

# Remove the existing .next folder
sudo rm -rf .next

# Ensure the app directory is owned by your normal user
sudo chown -R richard:richard /home/richard/app

# Re‑install deps (optional but safe if things were run as root)
npm install

# Try building again (as user richard, NOT with sudo)
npm run build
```

Key rules:
- Run `npm run build` **without** `sudo`.
- Only use `sudo` for ownership/permission fixes, not for normal app commands.

---

### 6. Fixing missing module errors during build

Example Webpack/Next.js error:

```text
Module not found: Can't resolve 'react-dropzone'
  at /app/admin/reviews/import/page.tsx
```

This happens when the code imports a package that either:
- Isn’t installed in `node_modules`, or
- `npm install` hasn’t been run since that dependency was added.

**Fix:**

```bash
cd /home/richard/app
npm install
npm run build
```

If it still fails, do a clean install:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

You can verify the module exists:

```bash
ls node_modules/react-dropzone
```

If the directory exists, Webpack should be able to resolve it.

---

### 7. Running the production server

Once the build succeeds:

- **If you use a process manager (e.g. pm2, systemd, or a custom script):**

  Restart the service that runs your Next.js app, for example:

  ```bash
  # Example with a custom script
  ./serve.sh
  ```

  or, if using `pm2` (example name):

  ```bash
  pm2 restart rightstay
  pm2 status
  ```

- **If you’re running `next start` manually:**

  ```bash
  npm run start
  ```

Make sure you run the server as `richard` (or the appropriate non‑root user) so file permissions stay consistent.

---

### 8. Quick “standard update” checklist

From `/home/richard/app`:

```bash
# 1. Get latest code
git fetch origin
git pull origin main

# If you get merge errors about local changes (e.g. package-lock.json),
# use either:
#   git checkout -- package-lock.json
#   git reset --hard HEAD
#   git pull origin main
# or:
#   git stash
#   git pull origin main
#   git stash pop

# 2. Install / update dependencies
npm install

# 3. Fix permissions if needed (only if you see EACCES errors)
sudo rm -rf .next
sudo chown -R richard:richard /home/richard/app

# 4. Build
npm run build

# 5. Restart your server / process manager
./serve.sh      # or pm2/systemd/etc.
```

With these steps, you can reliably pull from GitHub, resolve merge conflicts on the VPS, and fix the common permission and module‑resolution build errors.

