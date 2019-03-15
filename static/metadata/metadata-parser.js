metadata_parser_dict ={'STUDYAREA': [ 'BTNF', 'FNF' ],
'STUDYAREA_LONGNAME': {'BTNF':'Bridger-Teton National Forest','FNF': 'Flathead National Forest'},

'STUDYAREA_URL' :  'https://lcms-data-explorer-beta.appspot.com/',
'VERSION' : 'v2019.1',
'SUMMARYMETHOD' :{'year':'Most recent observation above specified threshold', 'prob':'Highest probability observation'},
'GAINORLOSS' :['Gain' , 'Loss'],
'LCORLU' : ['Cover' , 'Use'],


//(OOB_ACCURACY and OOB_KAPPA in html file)
'Gain_ACC':{'OOB_ACCURACY': 0.993, 'OOB_KAPPA':0.931,'THRESHOLD':0.35},
'Loss_ACC':{'OOB_ACCURACY': 0.985, 'OOB_KAPPA':0.752,'THRESHOLD':0.35},
'Landcover_ACC':{'OOB_ACCURACY': 0.984, 'OOB_KAPPA':0.978,'THRESHOLD':'NA'},
'Landuse_ACC':{'OOB_ACCURACY': 0.991, 'OOB_KAPPA':0.978,'THRESHOLD':'NA'},

'Gain Year_Description':'SUMMARY_METHOD (0.35). Each year has a modelled probability of gain using TimeSync model calibration data in a Random Forest model.<br>The modelled probability is then thresholded.  SUMMARY_METHOD is then selected for the final map output.',
'Loss Year_Description':'SUMMARY_METHOD (0.35). Each year has a modelled probability of loss using TimeSync model calibration data in a Random Forest model.<br>The modelled probability is then thresholded.  SUMMARY_METHOD is then selected for the final map output.',

'Gain Duration_Description':'SUMMARY_METHOD (0.35). Each year has a modelled probability of gain using TimeSync model calibration data in a Random Forest model.<br>The modelled probability is then thresholded.  Any observation above the specified threshold is then counted toward duration.',
'Loss Duration_Description':'SUMMARY_METHOD (0.35). Each year has a modelled probability of loss using TimeSync model calibration data in a Random Forest model.<br>The modelled probability is then thresholded.  Any observation above the specified threshold is then counted toward duration.',

'Gain Probability_Description':'SUMMARY_METHOD (0.35). Each year has a modelled probability of gain using TimeSync model calibration data in a Random Forest model.<br>The modelled probability is then thresholded.  SUMMARY_METHOD is then selected for the final map output.',
'Loss Probability_Description':'SUMMARY_METHOD (0.35). Each year has a modelled probability of gain using TimeSync model calibration data in a Random Forest model.<br>The modelled probability is then thresholded.  SUMMARY_METHOD is then selected for the final map output.',

'Landcover MODE_Description':'SUMMARY_METHOD. Each year has a modelled landcover class using TimeSync model calibration data in a Random Forest model.<br>The MODE of the landcover classes across the years is then selected for the final map output.',
'Landuse MODE_Description':'SUMMARY_METHOD. Each year has a modelled landuse class using TimeSync model calibration data in a Random Forest model.<br>The MODE of the landuse classes across the years is then selected for the final map output.',



//-Definitions and Descriptions
//(LCORLU_ONELINE_DEFINITION in html file)
'LANDCOVER_ONELINE_DEFINITION' : 'The vegetation, water, rock, or man-made constructions occurring on the earth’s surface. ',
'LANDUSE_ONELINE_DEFINITION' : 'The way in which land cover resources are used. ',

// //(CONFUSIONMATRIX in html file)
'Gain_CONFUSIONMATRIX':  '<table width = "300"><tr><th></th> <th>Reference</th>  </tr> <tr>  <td><b>Prediction</b></td> <td>  No Gain </td> <td>   Gain   </td> </tr>  <tr> <td>  No Gain   </td> <td>  71565   </td>  <td>    270   </td> </tr> <tr> <td>   Gain </td> <td>    296   </td>  <td>   4054   </td> </tr> </table>',
 

'Loss_CONFUSIONMATRIX' :'<table width = "300"><tr><th></th><th>Reference</th> </tr><tr> <td><b>Prediction</b></td> <td>   Loss   </td> <td>  No Loss </td> </tr><tr> <td>   Loss   </td><td>   1780   </td> <td>    500   </td></tr><tr><td>  No Loss </td><td>    628   </td> <td>   73277  </td></tr></table>',

'Landcover_CONFUSIONMATRIX':
'<table width = "500"><tr><th></th><th>Reference</th></tr><tr><td><b>Prediction</b></td><td>Barren</td><td>Grass/Forb/Herb</td><td>Impervious</td><td>Shrubs</td><td>Trees</td><td>Water</td></tr><tr><td>Barren</td><td>7282</td><td>66</td><td>0</td><td>12</td><td>22</td><td>10</td></tr><tr><td>Grass/Forb/Herb</td><td>144</td><td>19311</td><td>2</td>\
    <td>123</td><td>90</td><td>11</td></tr><tr><td>Impervious</td><td>0</td><td>0</td><td>178</td><td>0</td><td>0</td><td>0</td></tr><tr><td>Shrubs</td><td>29</td><td>154</td><td>0</td> <td>22771</td><td>76</td><td>7</td></tr><tr><td>Trees</td><td>102</td><td>194</td><td>0</td><td>180</td><td>24577</td><td>8</td></tr><tr><td>Water</td><td>0</td><td>1</td><td>0</td><td>1</td><td>3</td><td>831</td> </tr></table>',


'Landuse_CONFUSIONMATRIX':
'<table width = "500"><tr><th></th><th>Reference</th></tr><tr><td><b>Prediction</b></td><td>Agriculture</td><td>Developed</td><td>Forest</td>\
    <td>Non_forest_Wetland</td><td>Other</td><td>Rangeland</td></tr><tr><td>Agriculture</td><td>812</td><td>0</td><td>0</td><td>3</td><td>0</td><td>1</td></tr><tr>\
    <td>Developed</td><td>0</td><td>506</td><td>0</td><td>0</td><td>0</td><td>1</td></tr><tr><td>Forest</td><td>19</td><td>5</td><td>37698</td><td>82</td>\
    <td>26</td><td>215</td></tr><tr><td>Non_forest_Wetland</td><td>2</td><td>1</td><td>5</td><td>2276</td><td>2</td><td>1</td></tr><tr><td>Other</td><td>0</td><td>0</td> \
    <td>5</td><td>1</td><td>6579</td><td>8</td></tr><tr><td>Rangeland</td><td>48</td><td>14</td><td>118</td><td>71</td><td>25</td><td>27661</td></tr></table>'

}