import sys, subprocess, numpy as np, glob, os
V, SD = sys.argv[1], sys.argv[2]
W,H=64,36
def raw(args):
    return subprocess.run(["ffmpeg","-v","error"]+args+["-vf",f"scale={W}:{H},format=gray","-f","rawvideo","-"],capture_output=True).stdout
fr=np.frombuffer(raw(["-i",V]),np.uint8).reshape(-1,H,W).astype(float)
names=sorted(glob.glob(SD+"/*.jpg"))
st=np.stack([np.frombuffer(raw(["-i",n]),np.uint8).reshape(H,W).astype(float) for n in names])
top=slice(0,int(H*0.72))  # skip subtitle band
prev=None; cur=None; start=0
lab=[]
for i,f in enumerate(fr):
    d=np.abs(st[:,top]-f[top]).mean(axis=(1,2)); j=d.argmin()
    m=f.mean()
    lab.append((os.path.basename(names[j])[:16] if d[j]<12 else "~mix", round(d[j],1), round(m,1)))
segs=[];s=0
for i in range(1,len(lab)+1):
    if i==len(lab) or lab[i][0]!=lab[s][0]:
        segs.append((s/24,i/24,lab[s][0],min(l[1] for l in lab[s:i]),min(l[2] for l in lab[s:i]))); s=i
for a,b,n,dmin,mmin in segs: print(f"{a:6.3f}-{b:6.3f} ({b-a:5.2f}s) {n} dmin={dmin} lumamin={mmin}")
