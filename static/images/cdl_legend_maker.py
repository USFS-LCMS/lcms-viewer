import math
cdl = ee.Image('USDA/NASS/CDL/2014').select([0])
d = cdl.toDictionary();

l1 = ee.List(d.get('cropland_class_names'))
l2 = ee.List(d.get('cropland_class_values'))
l3 = ee.List(d.get('cropland_class_palette'))
l = l1.zip(l2).zip(l3)
l = l.map(lambda i:  ee.List(i).flatten()).getInfo()


l = [[str(i[0]),str(i[1]),str(i[2])] for i in l]
ln = len(l)
firstHalf = int(math.floor(ln/4))
secondHalf = int(math.ceil(ln/2))
print ln,firstHalf*4
##
out_text = '<body>\
            <div>\
            <p style = "background-color:#866;color:#fff;width:890px;margin:0px;text-align: center;font-size: 20pt;">CDL Legend</p>\
            <table>'

def hex_to_rgb(value):
    """Return (red, green, blue) for the color given as #rrggbb."""
    value = value.lstrip('#')
    lv = len(value)
    return tuple(int(value[i:i + lv // 3], 16) for i in range(0, lv, lv // 3))

for i in range(int(firstHalf)):
    c1 =l[i]
    c2 =l[i+firstHalf]
    c3 =l[i+firstHalf*2]
    c4 =l[i+firstHalf*3]

    c1RGB,c2RGB,c3RGB,c4RGB = hex_to_rgb(c1[2]),hex_to_rgb(c2[2]),hex_to_rgb(c3[2]),hex_to_rgb(c4[2])
    isDark = [sum(i)<255 for i in [c1RGB,c2RGB,c3RGB,c4RGB]]

    def getColor(i):

        if i:
            return '#FFF'
        else:
            return '#000'
    colors = map(getColor,isDark)



    out = '<tr>\n\
    <th style = "color:'+colors[0]+';background-color: #'+c1[2]+'">'+c1[1]+'</th>\n\
    <th style = "color:'+colors[0]+';background-color: #'+c1[2]+'">'+c1[0]+'</th>\n\
    <th style = "width:10px"></th>\n\
    <th style = "color:'+colors[1]+';background-color: #'+c2[2]+'">'+c2[1]+'</th>\n\
    <th style = "color:'+colors[1]+';background-color: #'+c2[2]+'">'+c2[0]+'</th>\n\
    <th style = "width:10px"></th>\n\
    <th style = "color:'+colors[2]+';background-color: #'+c3[2]+'">'+c3[1]+'</th>\n\
    <th style = "color:'+colors[2]+';background-color: #'+c3[2]+'">'+c3[0]+'</th>\n\
    <th style = "width:10px"></th>\n\
    <th style = "color:'+colors[3]+';background-color: #'+c4[2]+'">'+c4[1]+'</th>\n\
    <th style = "color:'+colors[3]+';background-color: #'+c4[2]+'">'+c4[0]+'</th>\n\
  	</tr>\n'
    out_text += out

out_text += '</table>\n</div>\n</body>'

oo = open('C:/app_engine_practice/master/rsac-ee-simple-template/static/images/cdl_legend_html.html','w')
oo.writelines(out_text)
oo.close()
