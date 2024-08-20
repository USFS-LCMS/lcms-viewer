import subprocess, os, shutil
from glob import glob

folders = [
    r"Z:\Projects\06_LCMS_4_NFS\Scripts\landscape-change-data-explorer\src\gee\gee-run",
    r"Z:\Projects\06_LCMS_4_NFS\Scripts\landscape-change-data-explorer\src\js",
    r"Z:\Projects\06_LCMS_4_NFS\Scripts\landscape-change-data-explorer\src\services",
]
for folder in folders:
    files = glob(os.path.join(folder, "*.js"))
    files = [f for f in files if f.find("_es5") == -1]
    # print(files)

    for file in files:
        es5 = os.path.splitext(file)[0] + "_es5.js"
        shutil.copy(file, es5)
        cmd = f"lebab {es5} -o {file} --transform let"
        print(cmd)

        # call = subprocess.Popen(cmd)
        # call.wait()
