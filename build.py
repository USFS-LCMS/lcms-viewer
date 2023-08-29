# from css_html_js_minify import  process_single_js_file
import glob,os,shutil
##############################################


# js_min_folder = 'js-min'
which_ones =['1variables.js','2templates.js','3template-adder.js','4map-manager.js','5chart-manager.js','6tools-toggle-manager.js']#,'7gee-lib-manager.js']
lcmsViewerFolder = r'C:\RCR\lcms-viewer'
geeViewFolder = r'C:\RCR\geeViz\geeView'
js_folder = os.path.join(lcmsViewerFolder,'js')
combined_filename = os.path.join(geeViewFolder,r"js\lcms-viewer.min.js")
in_css = os.path.join(lcmsViewerFolder,r"css\style.css")

out_css = os.path.join(geeViewFolder,r"css\style.min.css")

##############################################
# if not os.path.exists(js_min_folder):os.makedirs(js_min_folder)

js_files = glob.glob(os.path.join(js_folder,'*.js'))
js_files = [i for i in js_files if os.path.basename(i).find('.min.js') == -1]
js_files = [i for i in js_files if os.path.basename(i) in which_ones]
print(js_files)
combined = ''
for js_file in js_files:
	print(js_file)
	# process_single_js_file(js_file, overwrite=False)
	o  = open(js_file,'r',encoding='utf-8')
	combined += o.read()
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
o = open(combined_filename,'w',encoding='utf-8')
o.write(combined)
o.close()

shutil.copy(in_css,out_css)


	
