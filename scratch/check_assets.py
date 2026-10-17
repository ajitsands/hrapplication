import base64
import os
import subprocess

print("Checking assets...")
uniglobal_white_path = r"e:\hrsolution\UniGlobal\UniGlobalWhite.png"
uniglobal_final_path = r"e:\hrsolution\UniGlobal\UNIGLOBAL_CONSULTANCY_LOGO_FINAL.png"
sandslab_logo_path = r"e:\hrsolution\assets\SaNDSLab_Logo.png"

with open(uniglobal_white_path, "rb") as f:
    b64_uniglobal_white = base64.b64encode(f.read()).decode("utf-8")

with open(uniglobal_final_path, "rb") as f:
    b64_uniglobal_final = base64.b64encode(f.read()).decode("utf-8")

with open(sandslab_logo_path, "rb") as f:
    b64_sandslab = base64.b64encode(f.read()).decode("utf-8")

print(f"Loaded logos: White={len(b64_uniglobal_white)}, Final={len(b64_uniglobal_final)}, SaNDSLab={len(b64_sandslab)}")
