import sys,numpy as np
from PIL import Image
for n,y0,y1 in [("p01",551,649),("p02",515,666),("p04",507,660),("p08",531,635)]:
    a=np.asarray(Image.open(f"plates/{n}.jpg").convert('L'),float)+4
    band=a[y0+8:y1-8]
    r=np.median(band[:,3:]/band[:,:-3],axis=0)
    xs=[(i+3,round(v,2)) for i,v in enumerate(r) if (v<0.72 or v>1.38)]
    print(n,[x for x in xs if x[0]<200 or x[0]>1080])
