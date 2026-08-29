import os
import re

root_dir = "/home/evans/repos/Tindi-Holdings-"
exclude_dirs = {".git", ".git-portable", "node_modules", "dist", ".system_generated"}

files_to_process = []
for dirpath, dirnames, filenames in os.walk(root_dir):
    dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
    for f in filenames:
        if f.endswith((".ts", ".tsx", ".html", ".json", ".md")):
            files_to_process.append(os.path.join(dirpath, f))

# Replacement rules (ordered from most specific to least specific)
replacements = [
    ("Tindi Group Holdings Limited", "Tindi Holdings Ltd"),
    ("Tindi Group Holdings Ltd", "Tindi Holdings Ltd"),
    ("Tindi Group Holdings", "Tindi Holdings Ltd"),
    ("Tindi Group Limited", "Tindi Holdings Ltd"),
    ("Tindi Holdings Limited", "Tindi Holdings Ltd"),
    ("Tindi Group Ltd", "Tindi Holdings Ltd"),
    ("TINDI GROUP HOLDINGS (Central Board)", "TINDI HOLDINGS LTD (Central Board)"),
    ("TINDI GROUP HOLDINGS", "TINDI HOLDINGS LTD"),
    ("TINDI GROUP", "TINDI HOLDINGS LTD"),
    ("JOIN TINDI GROUP", "JOIN TINDI HOLDINGS LTD"),
    ("Tindi Group", "Tindi Holdings Ltd"),
    ("tindi group", "Tindi Holdings Ltd"),
    ("Tindi group", "Tindi Holdings Ltd"),
    ("Tindi Holdings Ltd Limited", "Tindi Holdings Ltd"),
    ("Tindi Holdings Ltd Ltd", "Tindi Holdings Ltd"),
]

changed_files = 0
for fpath in files_to_process:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    new_content = content
    for pattern, repl in replacements:
        new_content = new_content.replace(pattern, repl)

    if new_content != content:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(new_content)
        changed_files += 1
        print(f"Updated: {fpath}")

print(f"Total files updated: {changed_files}")
