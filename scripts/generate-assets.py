import math,wave,struct,os,random
base=os.path.join(os.path.dirname(__file__),'..','public')
os.makedirs(base+'/audio',exist_ok=True)
palettes=[('peach',84,['#efc9ae','#e3a7a0','#d97d78','#688472','#3c6358'],[60,57,65,67]),('tide',72,['#c6dedc','#a8cbd7','#6094ab','#547f91','#345a76'],[62,59,67,69]),('orchid',96,['#cabedb','#ac92b9','#d49eb4','#655477','#3e405e'],[57,53,60,55]),('citrus',112,['#f4df9f','#edba6b','#e7905e','#9b9d60','#5b7956'],[65,60,62,58]),('fern',80,['#e3e7b2','#b6c48f','#83a585','#567d6e','#355c56'],[60,64,57,65]),('rose',76,['#edd0c4','#dbaab5','#ba839e','#8b718f','#574e73'],[59,55,62,57])]
for idx,(name,bpm,colors,chords) in enumerate(palettes):
 random.seed(idx)
 rects=''.join(f'<rect x="{x}" y="{y}" width="{random.choice([2,4,6])}" height="2" fill="{colors[1]}" opacity=".7"/>' for y in range(10,83,5) for x in range(random.randint(0,10),128,17))
 hills=''
 for layer,y in enumerate([65,79,94]):
  pts=[f'0,128',f'0,{y}']
  for x in range(0,133,4):pts.append(f'{x},{int(y+math.sin(x/23+idx+layer)*9)//2*2}')
  pts.append('132,128');hills+=f'<polygon points="{" ".join(pts)}" fill="{colors[layer+2]}"/>'
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" shape-rendering="crispEdges"><rect width="128" height="128" fill="{colors[0]}"/>{rects}<path d="M82 23h18v4h6v6h4v18h-4v6h-6v4H82v-4h-6v-6h-4V33h4v-6h6z" fill="#fff0c7"/>{hills}<path d="M58 128h16v-6H63v-5h-9v-5h-7v-5H37v-4h-8v-3h-8v-3h-8v-3H5v4h7v4h8v4h8v4h8v4h8v5h7v5h7z" fill="{colors[0]}" opacity=".65"/></svg>'
 open(base+'/art/'+name+'.svg','w').write(svg)
 sr=22050;beat=60/bpm;duration=beat*64;frames=bytearray();notes=[0,7,12,16,14,7,4,12]
 for i in range(int(duration*sr)):
  t=i/sr;b=t/beat;root=chords[int(b//16)%4];bar=b%4
  def hz(n):return 440*2**((n-69)/12)
  pad=sum(math.sin(2*math.pi*hz(root+n)*t)*(1+.15*math.sin(t*2))/(j+2) for j,n in enumerate([0,4,7,11]))*.115
  p=(b%1)*beat;nn=root+12+notes[int(b)%len(notes)];mel=math.sin(2*math.pi*hz(nn)*p)*math.exp(-p*6)*.16
  bass=math.sin(2*math.pi*hz(root-24)*t)*.13*(.7+.3*math.exp(-p*5))
  kick=math.sin(2*math.pi*(48*p+7*(1-math.exp(-p*22))))*math.exp(-p*16)*.24 if int(b)%4 in [0,2] else 0
  hat=(random.random()*2-1)*math.exp(-(b%.5)*beat*100)*(.035 if name!='tide' else .012)
  sn=(random.random()*2-1)*math.exp(-p*25)*.065 if int(b)%4 in [1,3] else 0
  env=min(t/0.08,1,(duration-t)/.1)
  val=math.tanh((pad+mel+bass+kick+hat+sn)*env)*.72
  frames.extend(struct.pack('<h',int(val*32767)))
 with wave.open(base+'/audio/'+name+'.wav','wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr);f.writeframes(frames)
print('Generated six original tracks and pixel covers.')
