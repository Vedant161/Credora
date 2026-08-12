import os
import json
import shutil

root_dir = "c:/Users/Vedant/Desktop/credscore/credora"

# 1. Move requirements.txt
backend_req = os.path.join(root_dir, "backend", "requirements.txt")
root_req = os.path.join(root_dir, "requirements.txt")
if os.path.exists(backend_req):
    shutil.move(backend_req, root_req)

# 2. Update package.json install script
pkg_path = os.path.join(root_dir, "package.json")
with open(pkg_path, "r", encoding="utf-8") as f:
    pkg = json.load(f)

# The script currently is:
# "npm install && cd backend && python -m venv venv && .\\venv\\Scripts\\Activate.ps1 && pip install -r requirements.txt"
install_script = pkg["scripts"].get("install:all", "")
if "pip install -r requirements.txt" in install_script:
    # Since we moved requirements.txt to root, but the command `cd backend` happens first, we need to point back to root.
    # Actually, let's just run pip install -r ../requirements.txt
    new_install_script = install_script.replace("pip install -r requirements.txt", "pip install -r ../requirements.txt")
    pkg["scripts"]["install:all"] = new_install_script

with open(pkg_path, "w", encoding="utf-8") as f:
    json.dump(pkg, f, indent=2)

# 3. Update vercel.json
vercel_json_path = os.path.join(root_dir, "vercel.json")
vercel_data = {
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    }
  ]
}
with open(vercel_json_path, "w", encoding="utf-8") as f:
    json.dump(vercel_data, f, indent=2)
