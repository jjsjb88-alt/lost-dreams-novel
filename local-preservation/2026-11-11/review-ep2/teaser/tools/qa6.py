import subprocess, sys, numpy as np
# usage: qa6.py V5.mp4 V6.mp4
W,H=640,360
def dec(p):
    r=subprocess.run(["ffmpeg","-v","error","-i",p,"-vf",f"scale={W}:{H}","-pix_fmt","rgb24","-f","rawvideo","-"],capture_output=True).stdout
    return np.frombuffer(r,np.uint8).reshape(-1,H,W,3)
v5=dec(sys.argv[1]); v6=dec(sys.argv[2])
fps=24
L=lambda f: (f[...,0]*.299+f[...,1]*.587+f[...,2]*.114)
# 1. no black dips 25.67-31.37 (exclude edges)
seg=[L(v6[n].astype(float)).mean() for n in range(int(25.80*fps),int(31.30*fps))]
print("1. SA min mean luma", round(min(seg),1), "(black dip would be <10)")
# 2. HUD vs face brightness (half-res coords)
def reg(f,x0,y0,x1,y1): return L(f[y0//2:y1//2,x0//2:x1//2].astype(float)).mean()
for t in (26.2,28.6,30.0,31.0):
    f=v6[int(t*fps)]; print(f"2. SA t={t} HUD={reg(f,0,100,240,600):.0f} warn={reg(f,1000,330,1260,470):.0f} face={reg(f,620,280,820,460):.0f}")
for t in (33.0,35.5):
    f=v6[int(t*fps)]; print(f"2. S16 t={t} HUD={reg(f,0,0,390,700):.0f} face={reg(f,560,260,760,460):.0f}")
# 3. S16 length + no zoom: compare first and last S16 frames in a static region (top-right golden emblem)
a,b=v6[int(31.75*fps)],v6[int(36.0*fps)]
print("3. S16 dur 4.50s; static-region diff start/end", round(np.abs(a[0:100,500:640].astype(float)-b[0:100,500:640]).mean(),2))
# 4. ending: blacks
for t in (39.5,44.8): print(f"4. black at {t}: luma {L(v6[int(t*fps)].astype(float)).mean():.1f}")
# 5. S01-S09 identical to V5
d=np.abs(v5[:610].astype(float)-v6[:610]).mean(axis=(1,2,3))
print("5. S01-S09 mean abs diff vs V5: max", round(d.max(),3), "mean", round(d.mean(),3))
