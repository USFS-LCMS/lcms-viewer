# from css_html_js_minify import  process_single_js_file
import glob, os, shutil, sys, json
import uglipyjs
from jsmin import jsmin
from pathlib import Path

sys.stdin.reconfigure(encoding="utf-8")
sys.stdout.reconfigure(encoding="utf-8")
##############################################


# js_min_folder = 'js-min'
which_ones = [
    "js/1variables.js",
    "js/2templates.js",
    "js/3template-adder.js",
    "js/4map-manager.js",
    "js/5chart-manager.js",
    "services/area-charting.js",
    "js/6tools-toggle-manager.js",
]  # ,'7gee-lib-manager.js']


current_path = Path(os.path.dirname(__file__))

lcmsViewerFolder = os.path.join(current_path,'src')
geeViewFolder = os.path.join(current_path.parent,r"geeViz\geeView")
print(current_path,geeViewFolder)

# js_folder = lcmsViewerFolder  # os.path.join(lcmsViewerFolder, "src\js")
combined_filename = os.path.join(geeViewFolder, r"src\js\lcms-viewer.min.js")
combined_min_filename = os.path.join(geeViewFolder, r"src\js\lcms-viewer.min.js")

in_css = os.path.join(lcmsViewerFolder, r"styles\style.css")

out_css = os.path.join(geeViewFolder, r"src\styles\style.min.css")

# Handle js libraries
js_lib_folder_in = os.path.join(lcmsViewerFolder,r"gee\gee-libraries")
js_lib_folder_out = os.path.join(geeViewFolder, r"src\gee\gee-libraries")
if not os.path.exists(js_lib_folder_out):
    os.makedirs(js_lib_folder_out)
which_js_libs = ["getImagesLib.js", "changeDetectionLib.js"]

print(lcmsViewerFolder,js_lib_folder_in,js_lib_folder_out)
##############################################
def combine_scripts():

    combined = ""
    for js_file in which_ones:
        js_file = os.path.join(lcmsViewerFolder, js_file)
        print(js_file)
        # process_single_js_file(js_file, overwrite=False)
        o = open(js_file, "r", encoding="utf-8")
        combined += jsmin(o.read(), quote_chars="'\"`")
        o.close()
        # # try:
        # minified = jsmin(o.read())
        # # print(minified)
        # out_file = os.path.join(js_min_folder,os.path.basename(js_file))
        # o2 = open(out_file,'w')
        # o2.write(minified)
        # o2.close()
        # print(out_file)
        # # except Exception as e:
        # # 	print(e)
        o.close()

    for js_file in which_js_libs:
        js_file_in = os.path.join(js_lib_folder_in, js_file)
        js_file_out = os.path.join(js_lib_folder_out, js_file)
        print(js_file_in)
        # process_single_js_file(js_file, overwrite=False)
        o = open(js_file_in, "r", encoding="utf-8")
        l = jsmin(o.read(), quote_chars="'\"`")
        o.close()

        o = open(js_file_out, "w")
        o.write(l)
        o.close()
    o = open(combined_filename, "w", encoding="utf-8")
    o.write(combined)
    o.close()


combine_scripts()


# shutil.copy(in_css, out_css)
