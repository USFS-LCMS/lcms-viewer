import os,glob,gzip

files = os.listdir(os.getcwd())
files = filter(lambda i:os.path.splitext(i)[1] == '.svgz',files)
print(files)

for file in files:
	out = os.path.splitext(file)[0] + '.svg'
	o = gzip.open(file,'rb')
	content = o.read()
	o.close()
	oo = open(out,'w')
	oo.write(content)
	oo.close()
