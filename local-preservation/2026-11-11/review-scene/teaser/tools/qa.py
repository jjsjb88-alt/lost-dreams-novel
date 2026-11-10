import sys,subprocess,numpy as np
W,H=320,180
raw=subprocess.run(["ffmpeg","-v","error","-i",sys.argv[1],"-vf",f"scale={W}:{H},format=gray","-f","rawvideo","-"],capture_output=True).stdout
f=np.frombuffer(raw,np.uint8).reshape(-1,H,W).astype(float)
d=np.abs(np.diff(f,axis=0)).mean(axis=(1,2))
print("frames",len(f))
for i,v in enumerate(d):
    if v>6: print(f"jump {(i+1)/24:6.3f}s diff={v:.1f} mean={f[i+1].mean():.0f}")
import itertools
med=np.median(d); print("median diff",round(med,2))
