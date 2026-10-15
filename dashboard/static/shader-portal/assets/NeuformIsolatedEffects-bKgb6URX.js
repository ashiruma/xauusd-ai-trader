import{r as g,j as E}from"./index-BfQBnk_y.js";const N=`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Aetheris Labs</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital@1&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"><\/script>
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"><\/script>
</head>
<body class="bg-[#020208] text-white h-[100dvh] w-screen overflow-hidden font-['Inter'] relative flex flex-col justify-between selection:bg-[#00d2ff]/30 select-none antialiased" style="font-family: 'Inter', sans-serif;">
    
    <!-- Ambient Background WebGL -->
    <canvas id="bg-gl" class="absolute inset-0 w-full h-full z-0 opacity-0 transition-opacity duration-1000 ease-in" aria-hidden="true"></canvas>
    
    <!-- Vignette / Gradient Overlay -->
    <div class="absolute inset-0 z-0 pointer-events-none" style="background: radial-gradient(circle at 50% 50%, transparent 0%, #020208 100%); mix-blend-mode: multiply;"></div>

    <!-- Navigation -->
    <nav class="relative z-10 w-full px-8 py-6 flex justify-between items-center gs-fade">
        <div class="font-['Playfair_Display'] italic text-xl tracking-tight text-[#e2f1ff]">Aetheris.</div>
        
        <!-- Premium Gradient Border Pill -->
        <div style="padding: 1px; background: linear-gradient(180deg, rgba(226,241,255,0.15) 0%, rgba(226,241,255,0) 100%); border-radius: 9999px;">
            <div class="bg-[#080a14]/80 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-2" style="box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.05);">
                <div class="w-1.5 h-1.5 rounded-full bg-[#00d2ff]" style="animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
                <span class="text-xs font-normal text-[#e2f1ff]/60 tracking-widest uppercase">Drive Engaged</span>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4">
        
        <div class="gs-fade font-mono text-xs tracking-[0.3em] text-[#00d2ff] uppercase mb-8" style="font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;">
            SYS 09 / Cosmic Void
        </div>

        <!-- Masked Reveal Title -->
        <h1 class="text-5xl md:text-7xl font-medium tracking-tighter text-[#e2f1ff] mb-14 flex flex-col items-center gap-1 md:gap-3 drop-shadow-2xl">
            <div class="overflow-hidden pb-2"><span class="block translate-y-full gs-word">Access</span></div>
            <div class="overflow-hidden pb-2"><span class="block translate-y-full gs-word text-white/90">The Cosmos.</span></div>
        </h1>

        <div class="gs-scale-up">
            <!-- Quantum Aether Button -->
            <button id="btn" type="button" class="group relative flex items-center justify-center w-[250px] h-[70px] border-0 p-0 rounded-2xl overflow-hidden cursor-pointer bg-[#050b1a] outline-none transition-all duration-[220ms] ease-[cubic-bezier(0.34,1.4,0.5,1)] hover:-translate-y-[2px] active:translate-y-[1px] active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00d2ff] focus-visible:outline-offset-[5px]" style="box-shadow: 0 24px 48px rgba(4, 98, 126, 0.2), 0 3px 10px rgba(2, 6, 20, 0.35);">
                <canvas id="gl" class="absolute inset-0 w-full h-full block group-[.nogl]:hidden" aria-hidden="true"></canvas>
                <div class="absolute inset-0 hidden group-[.nogl]:block" style="background: radial-gradient(130% 170% at 50% 118%, #61d3ff 0%, #33a7ff 24%, #084c8e 56%, #050a19 88%);"></div>
                <span class="relative z-10 pointer-events-none font-semibold text-sm tracking-[.26em] indent-[.26em] text-[#e2f1ff]" style="text-shadow: 0 1px 12px rgba(0, 16, 40, .85);">AETHER DRIVE</span>
            </button>
        </div>

        <p class="gs-fade text-sm text-[#e2f1ff]/40 tracking-wide mt-10 max-w-sm" style="line-height: 1.6;">
            Hover to accelerate the drive, press to initiate hyper jump.
        </p>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 w-full px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4 gs-fade text-xs text-[#e2f1ff]/30 tracking-wider">
        <span>© 2025 Aetheris Labs</span>
        <div class="flex items-center gap-6">
            <a href="#" class="hover:text-[#e2f1ff]/70 transition-colors flex items-center gap-1.5">
                <iconify-icon icon="solar:document-text-linear" stroke-width="1.5" class="text-sm"></iconify-icon>
                Terms
            </a>
            <a href="#" class="hover:text-[#e2f1ff]/70 transition-colors flex items-center gap-1.5">
                <iconify-icon icon="solar:lock-keyhole-linear" stroke-width="1.5" class="text-sm"></iconify-icon>
                Privacy
            </a>
        </div>
    </footer>

    <!-- GSAP Animations -->
    <script>
        document.addEventListener("DOMContentLoaded", () => {
            gsap.set(".gs-word", { y: "100%" });
            gsap.set(".gs-fade", { opacity: 0, y: 15 });
            gsap.set(".gs-scale-up", { opacity: 0, scale: 0.85, y: 20 });

            const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

            // Reveal words
            tl.to(".gs-word", {
                y: "0%",
                duration: 1.2,
                stagger: 0.15,
                delay: 0.2
            })
            // Fade in nav and tag
            .to(".gs-fade", {
                opacity: 1,
                y: 0,
                duration: 1,
                stagger: 0.1
            }, "-=0.8")
            // Pop in the button
            .to(".gs-scale-up", {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 1.2,
                ease: "back.out(1.2)"
            }, "-=0.6");

            // Fade in ambient background
            document.getElementById('bg-gl').style.opacity = '0.45';
        });
    <\/script>

    <!-- WebGL Ambient Cosmic Background -->
    <script>
    (function () {
        var canvas = document.getElementById('bg-gl');
        var gl = canvas.getContext('webgl');
        if (!gl) return;

        var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
        var FS = [
            'precision highp float;',
            'uniform vec2 u_res;',
            'uniform float u_time;',
            'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}',
            'float noise(vec2 p){',
            '  vec2 i=floor(p), f=fract(p);',
            '  vec2 u=f*f*(3.0-2.0*f);',
            '  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),',
            '             mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);',
            '}',
            'float fbm(vec2 p){',
            '  float v=0.0; float a=0.5;',
            '  for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.02+vec2(17.3,9.1); a*=0.5; }',
            '  return v;',
            '}',
            'void main(){',
            '  vec2 uv = gl_FragCoord.xy / u_res;',
            '  vec2 p = uv * vec2(u_res.x/u_res.y, 1.0) * 1.5;',
            '  float t = u_time * 0.12;',
            '  vec2 q = vec2(fbm(p + vec2(0.0, t*0.28)), fbm(p + vec2(4.1, t*0.23)));',
            '  vec2 r = vec2(fbm(p + 1.5*q + vec2(2.1, 7.2) + t*0.1),',
            '                fbm(p + 1.4*q + vec2(5.3, 3.1) + t*0.07));',
            '  float v = fbm(p + 1.9*r);',
            '  float m = v*1.3;',
            '  vec3 c1 = vec3(0.002, 0.004, 0.015);',
            '  vec3 c2 = vec3(0.006, 0.018, 0.05);',
            '  vec3 c3 = vec3(0.02, 0.07, 0.18);',
            '  vec3 col = mix(c1, c2, smoothstep(0.1, 0.6, m));',
            '  col = mix(col, c3, smoothstep(0.6, 1.0, m));',
            '  float vein = exp(-abs(q.x - q.y) * 5.0);',
            '  col += c3 * vein * 0.12;',
            '  gl_FragColor = vec4(col, 1.0);',
            '}'
        ].join('\\n');

        function compile(type, src) {
            var s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            return s;
        }
        var prog = gl.createProgram();
        gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
        gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
        gl.linkProgram(prog);
        gl.useProgram(prog);

        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        var locP = gl.getAttribLocation(prog, 'p');
        gl.enableVertexAttribArray(locP);
        gl.vertexAttribPointer(locP, 2, gl.FLOAT, false, 0, 0);

        var uRes = gl.getUniformLocation(prog, 'u_res');
        var uTime = gl.getUniformLocation(prog, 'u_time');

        function resize() {
            var w = canvas.clientWidth;
            var h = canvas.clientHeight;
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                gl.viewport(0, 0, w, h);
            }
        }
        window.addEventListener('resize', resize);
        resize();

        function frame(now) {
            resize();
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform1f(uTime, now / 1000);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    })();
    <\/script>

    <!-- WebGL Aether Engine Button -->
    <script>
    (function () {
        var btn = document.getElementById('btn');
        var canvas = document.getElementById('gl');
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var gl = canvas.getContext('webgl');
        if (!gl) { btn.classList.add('nogl'); return; }

        var hoverStyles = "0 30px 60px rgba(0, 150, 220, 0.35), 0 4px 12px rgba(2, 6, 20, 0.4)";
        var defaultStyles = "0 24px 48px rgba(4, 98, 126, 0.2), 0 3px 10px rgba(2, 6, 20, 0.35)";
        
        btn.addEventListener('mouseenter', () => { if(!reduced) btn.style.boxShadow = hoverStyles; });
        btn.addEventListener('mouseleave', () => { if(!reduced) btn.style.boxShadow = defaultStyles; });
        btn.addEventListener('focus', () => { if(!reduced) btn.style.boxShadow = hoverStyles; });
        btn.addEventListener('blur', () => { if(!reduced) btn.style.boxShadow = defaultStyles; });

        var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
        var FS = [
            'precision highp float;',
            'uniform vec2 u_res;',
            'uniform float u_time;',
            'uniform float u_heat;',
            'uniform float u_flash;',
            'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}',
            'float noise(vec2 p){',
            '  vec2 i=floor(p), f=fract(p);',
            '  vec2 u=f*f*(3.0-2.0*f);',
            '  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),',
            '             mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);',
            '}',
            'float fbm(vec2 p){',
            '  float v=0.0; float a=0.5;',
            '  for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.02+vec2(17.3,9.1); a*=0.5; }',
            '  return v;',
            '}',
            'void main(){',
            '  vec2 uv = gl_FragCoord.xy / u_res;',
            '  vec2 p = uv * vec2(u_res.x/u_res.y, 1.0) * 2.1;',
            '  float t = u_time;',
            '  float heat = u_heat + u_flash * 1.3;',
            '  vec2 q = vec2(fbm(p + vec2(0.0, t*0.32)), fbm(p + vec2(5.2, t*0.27)));',
            '  vec2 r = vec2(fbm(p + 1.7*q + vec2(1.7, 9.2) + t*0.12),',
            '                fbm(p + 1.6*q + vec2(8.3, 2.8) + t*0.09));',
            '  float v = fbm(p + 2.1*r);',
            '  float m = v*1.4 + heat*0.22;',
            '  vec3 c1 = vec3(0.004, 0.008, 0.035);',
            '  vec3 c2 = vec3(0.04, 0.08, 0.35);',
            '  vec3 c3 = vec3(0.0, 0.6, 1.0);',
            '  vec3 c4 = vec3(0.7, 0.9, 1.0);',
            '  vec3 col = mix(c1, c2, smoothstep(0.2, 0.52, m));',
            '  col = mix(col, c3, smoothstep(0.52, 0.8, m));',
            '  col = mix(col, c4, smoothstep(0.82, 1.02, m));',
            '  float vein = exp(-abs(q.x - q.y) * 9.0);',
            '  col += c3 * vein * (0.12 + heat * 0.25);',
            '  vec2 e = uv * (1.0 - uv);',
            '  float vig = pow(e.x * e.y * 16.0, 0.28);',
            '  col *= mix(0.5, 1.0, vig);',
            '  col *= 0.78 + heat * 0.5;',
            '  col += vec3(0.82, 0.94, 1.0) * u_flash * 0.4 * (0.3 + v);',
            '  gl_FragColor = vec4(col, 1.0);',
            '}'
        ].join('\\n');

        function compile(type, src) {
            var s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            return s;
        }
        var prog = gl.createProgram();
        gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
        gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
        gl.linkProgram(prog);
        gl.useProgram(prog);

        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        var locP = gl.getAttribLocation(prog, 'p');
        gl.enableVertexAttribArray(locP);
        gl.vertexAttribPointer(locP, 2, gl.FLOAT, false, 0, 0);

        var uRes = gl.getUniformLocation(prog, 'u_res');
        var uTime = gl.getUniformLocation(prog, 'u_time');
        var uHeat = gl.getUniformLocation(prog, 'u_heat');
        var uFlash = gl.getUniformLocation(prog, 'u_flash');

        function resize() {
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            var w = Math.max(1, Math.round(canvas.clientWidth * dpr));
            var h = Math.max(1, Math.round(canvas.clientHeight * dpr));
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                gl.viewport(0, 0, w, h);
            }
        }
        window.addEventListener('resize', resize);
        resize();

        var heat = 0, heatTarget = 0, erupt = 0;
        var churn = 0;
        var last = performance.now();

        btn.addEventListener('mouseenter', function () { heatTarget = 1; });
        btn.addEventListener('mouseleave', function () { heatTarget = 0; });
        btn.addEventListener('focus', function () { heatTarget = 1; });
        btn.addEventListener('blur', function () { heatTarget = 0; });
        btn.addEventListener('mousedown', function () { erupt = 1; });
        btn.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') erupt = 1;
        });

        function frame(now) {
            var dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            heat += (heatTarget - heat) * Math.min(1, dt * 6);
            erupt *= Math.exp(-3.2 * dt);
            churn += dt * (0.35 + heat * 1.1 + erupt * 2.2);
            resize();
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform1f(uTime, reduced ? 6.0 : churn);
            gl.uniform1f(uHeat, heat);
            gl.uniform1f(uFlash, erupt);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    })();
    <\/script>
</body>
</html>`,G="<!DOCTYPE html><html><head></head><body></body></html>",U="<!DOCTYPE html><html><head></head><body></body></html>",q="<!DOCTYPE html><html><head></head><body></body></html>",Y="<!DOCTYPE html><html><head></head><body></body></html>",j="<!DOCTYPE html><html><head></head><body></body></html>",V="<!DOCTYPE html><html><head></head><body></body></html>",X="<!DOCTYPE html><html><head></head><body></body></html>",K="<!DOCTYPE html><html><head></head><body></body></html>",$="<!DOCTYPE html><html><head></head><body></body></html>",Z="<!DOCTYPE html><html><head></head><body></body></html>",J="<!DOCTYPE html><html><head></head><body></body></html>",Q="<!DOCTYPE html><html><head></head><body></body></html>",ee=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ignition Button</title>
<script src="https://cdn.tailwindcss.com"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"><\/script>
<script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"><\/script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
</head>
<body class="h-screen w-screen flex items-center justify-center overflow-hidden text-stone-800 bg-[#f4f1ea] selection:bg-[#d43d17] selection:text-white" style="font-family: 'Inter', sans-serif;">

  <!-- Ambient WebGL Background -->
  <canvas id="bg-gl" class="absolute inset-0 w-full h-full -z-10 block pointer-events-none" aria-hidden="true"></canvas>

  <main class="relative z-10 flex flex-col items-center text-center w-full max-w-md px-6">
    
    <!-- Company Header -->
    <div class="mb-16 overflow-hidden">
      <div class="reveal-element text-sm font-normal tracking-tight text-stone-700 opacity-0 translate-y-full">
        AETHER SYSTEMS
      </div>
    </div>

    <!-- Component Area -->
    <div class="mb-8 stagger-word text-xs font-mono tracking-[0.3em] uppercase text-[#d43d17] font-normal">
      SYS 07 / IGNITE
    </div>

    <div class="intro-wrapper opacity-0 scale-[0.55] blur-[8px]">
      <button id="btn" type="button" class="group relative block w-[264px] h-[78px] border-0 p-[7px] rounded-[24px] cursor-pointer outline-none transition-all duration-300 ease-[cubic-bezier(.34,1.4,.5,1)] hover:-translate-y-[2px] active:translate-y-[1px] active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-[#d43d17] focus-visible:outline-offset-[5px] bg-[linear-gradient(180deg,#3c3f46_0%,#15171b_55%,#2a2d33_100%)] shadow-[0_26px_52px_rgba(15,12,10,.35),0_3px_10px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.14)] hover:shadow-[0_32px_64px_rgba(160,60,12,.3),0_4px_12px_rgba(0,0,0,.4),inset_0_1px_0_rgba(255,255,255,.16)]">
        <span class="relative block w-full h-full rounded-[17px] overflow-hidden bg-[#06050a] flex items-center justify-center shadow-[inset_0_2px_8px_rgba(0,0,0,.9)]">
          <canvas id="gl" class="absolute inset-0 w-full h-full block" aria-hidden="true"></canvas>
          <span class="relative z-10 pointer-events-none font-medium text-sm tracking-[0.34em] indent-[0.34em] text-[#fdf6ee]" style="text-shadow: 0 0 14px rgba(255, 170, 100, .55), 0 1px 6px rgba(0, 0, 0, .9);">LAUNCH</span>
        </span>
      </button>
    </div>

    <div class="mt-8 stagger-word text-xs text-stone-500 tracking-wide font-light leading-relaxed max-w-[280px]">
      Hover to prime the core accelerator, click to execute initialization.
    </div>

  </main>

  <script>
    // --- GSAP Animations ---
    gsap.registerPlugin(ScrollTrigger);

    // Prepare text for masked staggered reveal
    document.querySelectorAll('.stagger-word').forEach(el => {
      const words = el.innerText.trim().split(' ');
      el.innerHTML = words.map(w => \`<span class="inline-block overflow-hidden align-top"><span class="reveal-word inline-block translate-y-full opacity-0">\${w}&nbsp;</span></span>\`).join('');
    });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Header reveal
    tl.to(".reveal-element", {
      y: "0%",
      opacity: 1,
      duration: 1,
      ease: "expo.out"
    }, "+=0.2");

    // Masked staggered word reveal
    tl.to(".reveal-word", {
      y: "0%",
      opacity: 1,
      duration: 0.8,
      stagger: 0.04,
      ease: "power4.out"
    }, "-=0.6");

    // Intro Button Sequence
    tl.to(".intro-wrapper", {
      scale: 1.05,
      opacity: 1,
      duration: 0.8,
      ease: "back.out(1.5)",
      onUpdate: function() {
        let progress = this.progress();
        let blurAmount = Math.max(0, 8 * (1 - progress * 1.5));
        gsap.set(".intro-wrapper", { filter: \`blur(\${blurAmount}px)\` });
      }
    }, "-=0.8");

    tl.to(".intro-wrapper", {
      scale: 1,
      duration: 0.4,
      ease: "power2.out"
    });

    // Subtle Ambient Parallax
    document.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      gsap.to(".intro-wrapper", {
        x: x,
        y: y,
        duration: 2,
        ease: "power2.out"
      });
    });


    // --- Ambient Background WebGL ---
    (function() {
      var canvas = document.getElementById('bg-gl');
      var gl = canvas.getContext('webgl');
      if (!gl) return;

      var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
      var FS = \`
        precision highp float;
        uniform vec2 u_res;
        uniform float u_time;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
        float noise(vec2 p){
          vec2 i=floor(p), f=fract(p);
          vec2 u=f*f*(3.0-2.0*f);
          return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),
                     mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);
        }
        void main(){
          vec2 uv = gl_FragCoord.xy / u_res;
          float n = noise(uv * 2.5 + vec2(u_time * 0.015, u_time * 0.025));
          n += noise(uv * 5.0 - vec2(u_time * 0.01, u_time * 0.02)) * 0.5;
          // Soft ambient cream tones
          vec3 col1 = vec3(0.957, 0.945, 0.918);
          vec3 col2 = vec3(0.925, 0.910, 0.880);
          vec3 finalCol = mix(col1, col2, n * 0.6 + 0.2);
          gl_FragColor = vec4(finalCol, 1.0);
        }
      \`;

      function compile(type, src) {
        var s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      }
      var prog = gl.createProgram();
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      gl.useProgram(prog);

      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var locP = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(locP);
      gl.vertexAttribPointer(locP, 2, gl.FLOAT, false, 0, 0);

      var uRes = gl.getUniformLocation(prog, 'u_res');
      var uTime = gl.getUniformLocation(prog, 'u_time');

      function resize() {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var w = window.innerWidth * dpr;
        var h = window.innerHeight * dpr;
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          gl.viewport(0, 0, w, h);
        }
      }
      window.addEventListener('resize', resize);
      resize();

      function frame(now) {
        resize();
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, now / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    })();


    // --- Portal Button WebGL ---
    (function () {
      var btn = document.getElementById('btn');
      var canvas = document.getElementById('gl');
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var gl = canvas.getContext('webgl');
      if (!gl) { document.body.classList.add('nogl'); return; }

      var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
      var FS = [
        'precision highp float;',
        'uniform vec2 u_res;',
        'uniform float u_time;',
        'uniform float u_warp;',
        'uniform float u_flash;',
        'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}',
        'float noise(vec2 p){',
        '  vec2 i=floor(p), f=fract(p);',
        '  vec2 u=f*f*(3.0-2.0*f);',
        '  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),',
        '             mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);',
        '}',
        'float fbm(vec2 p){',
        '  float v=0.0; float a=0.5;',
        '  for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.07+vec2(13.1,5.7); a*=0.5; }',
        '  return v;',
        '}',
        'void main(){',
        '  vec2 sc = gl_FragCoord.xy / u_res;',
        '  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;',
        '  float r = length(uv);',
        '  float rr = max(r, 0.08);',
        '  float a = atan(uv.y, uv.x);',
        '  float t = u_time;',
        '  vec3 col = vec3(0.012, 0.011, 0.014);',
        '  float hz = fbm(uv * 2.6 + vec2(t * 0.35, 1.7));',
        '  col += vec3(0.13, 0.06, 0.032) * hz * (0.7 + 0.6 * u_warp);',
        '  for (int i = 0; i < 3; i++) {',
        '    float fi = float(i);',
        '    float ringN = 26.0 + fi * 9.0;',
        '    vec2 sp = vec2((a / 6.28318 + 0.5) * ringN,',
        '                   (0.3 + fi * 0.22) / rr + t * (2.0 + fi * 1.2));',
        '    vec2 cell = floor(sp);',
        '    vec2 f = fract(sp);',
        '    float h = hash(cell + fi * 17.31);',
        '    float on = step(0.68, h);',
        '    vec2 c = vec2(0.2 + 0.6 * hash(cell + 4.7), 0.5);',
        '    vec2 dlt = f - c;',
        '    float sy = mix(130.0, 8.0, u_warp);',
        '    float star = on * exp(-(dlt.x * dlt.x * 150.0 + dlt.y * dlt.y * sy));',
        '    float tw = 0.7 + 0.3 * sin(h * 81.0 + t * 9.0);',
        '    tw = mix(tw, 1.0, u_warp);',
        '    vec3 sCol = mix(vec3(1.0, 0.94, 0.85), vec3(1.0, 0.6, 0.33), step(0.9, h));',
        '    float fade = smoothstep(0.02, 0.25, r);',
        '    col += sCol * star * tw * fade * (1.1 + 0.7 * u_warp);',
        '  }',
        '  col += vec3(1.0, 0.8, 0.58) * u_warp * 0.32 * exp(-r * 4.0);',
        '  vec2 e = sc * (1.0 - sc);',
        '  col *= 0.3 + 0.7 * pow(e.x * e.y * 16.0, 0.3);',
        '  col = mix(col, vec3(1.0, 0.97, 0.92), clamp(u_flash, 0.0, 1.0));',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\\n');

      function compile(type, src) {
        var s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          console.error('shader compile failed:', gl.getShaderInfoLog(s));
        }
        return s;
      }
      var prog = gl.createProgram();
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      gl.useProgram(prog);

      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var locP = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(locP);
      gl.vertexAttribPointer(locP, 2, gl.FLOAT, false, 0, 0);

      var uRes = gl.getUniformLocation(prog, 'u_res');
      var uTime = gl.getUniformLocation(prog, 'u_time');
      var uWarp = gl.getUniformLocation(prog, 'u_warp');
      var uFlash = gl.getUniformLocation(prog, 'u_flash');

      function resize() {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var w = Math.max(1, Math.round(canvas.clientWidth * dpr));
        var h = Math.max(1, Math.round(canvas.clientHeight * dpr));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          gl.viewport(0, 0, w, h);
        }
      }
      window.addEventListener('resize', resize);
      resize();

      var warp = 0, warpTarget = 0, flash = 0, z = 0;
      var last = performance.now();

      btn.addEventListener('mouseenter', function () { warpTarget = 1; });
      btn.addEventListener('mouseleave', function () { warpTarget = 0; });
      btn.addEventListener('focus', function () { warpTarget = 1; });
      btn.addEventListener('blur', function () { warpTarget = 0; });
      btn.addEventListener('click', function () {
        flash = 1;
        warp = 0;
        z = 0;
      });

      function frame(now) {
        var dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        warp += (warpTarget - warp) * Math.min(1, dt * 2.6);
        flash *= Math.exp(-4.5 * dt);
        z += dt * (0.05 + warp * 1.35);
        resize();
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, reduced ? 4.0 : z);
        gl.uniform1f(uWarp, warp);
        gl.uniform1f(uFlash, flash);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    })();
  <\/script>
</body>
</html>`,te="<!DOCTYPE html><html><head></head><body></body></html>",ne=`<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Imaginie — Stay close to your imagination.</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"><\/script>
  <!-- Iconify Icons -->
  <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"><\/script>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&amp;family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&amp;display=swap" rel="stylesheet">
  <style>
    .font-serif {
      font-family: 'Playfair Display', Georgia, serif;
    }
    .font-sans {
      font-family: 'Inter', sans-serif;
    }
    /* Smooth custom animations */
    .word-span {
      display: inline-block;
      opacity: 0;
      transform: translateY(12px) translateZ(0);
      filter: blur(4px);
      transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .word-span.visible {
      opacity: 1;
      transform: translateY(0) translateZ(0);
      filter: blur(0);
    }
    /* Holographic button glow */
    .holo-btn {
      position: relative;
      background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,220,205,0.9) 50%, rgba(220,240,255,0.9) 100%);
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6);
      transition: all 0.4s ease;
    }
    .holo-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 0 30px rgba(255, 220, 180, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.8);
    }
  </style>
</head>
<body class="bg-[#030303] text-[#f4f4f6] font-sans antialiased overflow-x-hidden min-h-screen flex flex-col justify-between" style="background-image: radial-gradient(circle at 10% 20%, rgba(15, 11, 28, 0.6) 0%, rgba(3, 3, 3, 1) 80%);">

  <!-- Interactive Background Canvas (WebGL/Nebula simulation) -->
  <canvas id="ambient-starfield" class="absolute inset-0 pointer-events-none z-0" style="opacity: 0.45;"></canvas>

  <!-- Header Navigation -->
  <header class="relative z-50 w-full max-w-7xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
    <div class="flex items-center gap-12">
      <!-- Logo -->
      <a href="#" class="text-xl font-semibold tracking-tight text-white hover:opacity-90 transition-opacity">
        Imaginie
      </a>
      <!-- Nav Links -->
      <nav class="hidden md:flex items-center gap-8">
        <a href="#" class="text-[13px] text-[#9a9a9f] hover:text-white transition-colors duration-200">How it works</a>
        <a href="#" class="text-[13px] text-[#9a9a9f] hover:text-white transition-colors duration-200">Features</a>
        <a href="#" class="text-[13px] text-[#9a9a9f] hover:text-white transition-colors duration-200">Pricing</a>
      </nav>
    </div>
    <!-- Log In CTA -->
    <div>
      <a href="#" class="px-5 py-2 text-[13px] font-medium text-white bg-[#ffffff0a] border border-[#ffffff10] rounded-full hover:bg-[#ffffff15] transition-all duration-300">
        Log in
      </a>
    </div>
  </header>

  <!-- Main Hero Workspace Section -->
  <main class="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center my-auto py-8">
    
    <!-- Left Copy Column -->
    <div class="lg:col-span-5 flex flex-col space-y-8 text-left max-w-xl lg:max-w-none">
      
      <!-- High-fidelity Headline (Letter/Word animated) -->
      <h1 id="hero-title" class="text-5xl md:text-6xl lg:text-[64px] font-serif leading-[1.08] tracking-tight text-white py-1">
        Stay close to your imagination.
      </h1>

      <!-- Description Subhead -->
      <p id="hero-desc" class="text-[14px] md:text-[15px] text-[#94949a] leading-relaxed max-w-[430px] opacity-0 translate-y-4 transition-all duration-1000 ease-out delay-500">
        Where ideas begin as sparks and emerge as living experiences through the power of AI. We transform what doesn't exist yet into something unforgettable.
      </p>

      <!-- Action Buttons -->
      <div id="hero-actions" class="flex flex-wrap items-center gap-4 pt-2 opacity-0 translate-y-4 transition-all duration-1000 ease-out delay-700">
        <a href="#" class="px-5 py-3 text-[13px] font-medium text-white bg-[#0e0e11] border border-[#ffffff12] rounded-full hover:bg-[#16161b] hover:border-[#ffffff1c] transition-all duration-300 flex items-center gap-2">
          See how it works
        </a>
        <a href="#" class="holo-btn px-6 py-3 text-[13px] font-semibold text-[#0d0a12] rounded-full flex items-center gap-1.5 transition-transform duration-300">
          Begin the journey
          <iconify-icon icon="solar:arrow-right-linear" class="text-base font-semibold" style="stroke-width: 2;"></iconify-icon>
        </a>
      </div>

      <!-- Social Proof / Creators Indicator -->
      <div id="hero-proof" class="flex items-center gap-3.5 pt-8 opacity-0 translate-y-4 transition-all duration-1000 ease-out delay-900">
        <!-- Avatars Stack -->
        <div class="flex -space-x-3.5">
          <img class="w-7 h-7 rounded-full border border-black object-cover filter brightness-95" src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/2f563338-39fa-47ea-9761-658d4f3f84db_1600w.jpg" alt="Creator">
          <img class="w-7 h-7 rounded-full border border-black object-cover filter brightness-95" src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4f5668c5-fc4a-44e0-bc5e-a664189d3c31_1600w.jpg" alt="Creator">
          <img class="w-7 h-7 rounded-full border border-black object-cover filter brightness-95" src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/eca707cc-a5b7-439a-b4fd-247f6106c2e1_1600w.jpg" alt="Creator">
          <img class="w-7 h-7 rounded-full border border-black object-cover filter brightness-95" src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/77415a2e-dcbc-4748-a29d-fced4821881a_1600w.jpg" alt="Creator">
        </div>
        <!-- Copy text -->
        <p class="text-[12px] text-[#86868b] tracking-normal">
          Used by <span class="text-white font-medium">12,000+</span> builders, creators, and professionals
        </p>
      </div>

    </div>

    <!-- Right Artistic Cosmic Portal Column -->
    <div class="lg:col-span-7 flex justify-center lg:justify-end relative w-full h-[480px] md:h-[620px] lg:h-[680px]">
      
      <!-- Outer glowing bronze border frame (Portal Container) -->
      <div class="relative w-full max-w-[500px] h-full rounded-t-[180px] rounded-b-[40px] p-[5px] bg-gradient-to-tr from-[#1b120f] via-[#a3704c] to-[#e6c29e] shadow-[0_0_80px_rgba(163,112,76,0.15)] overflow-hidden flex items-center justify-center transition-transform duration-700 hover:scale-[1.01]">
        
        <!-- Inner shadow & ambient overlay wrapper -->
        <div class="relative w-full h-full rounded-t-[176px] rounded-b-[36px] overflow-hidden bg-black flex items-center justify-center">
          
          <!-- Background Cosmic Dust Image (Aura Asset) -->
          <video src="https://wypspaektjjiccarxrgy.supabase.co/storage/v1/object/public/generated-page-media/302e86e0-80d8-4ba5-82e8-004220675655/2026-05-20/1779252781481-eabde810-981e-4ee8-a143-4bee829a788c.mp4" poster="https://wypspaektjjiccarxrgy.supabase.co/storage/v1/object/public/generated-page-media/302e86e0-80d8-4ba5-82e8-004220675655/2026-05-20/1779245193658-07a4020a-dced-499d-ac91-36b6037f907e.png" data-neuform-generated-video="true" data-neuform-video-preset="loop-in-view" muted="" playsinline="" preload="metadata" loop="" aria-label="Cosmic Window" class="absolute inset-0 w-full h-full object-cover opacity-85 mix-blend-lighten filter brightness-110 saturate-[1.1]"></video>

          <!-- Interactive Star/Nebula Field Canvas inside the window -->
          <canvas id="portal-stars" class="absolute inset-0 w-full h-full z-10 mix-blend-screen pointer-events-none"></canvas>

          <!-- Cosmic Horizon Layer Glow -->
          <div class="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#0e0c15] via-transparent to-transparent z-20"></div>

          <!-- Futuristic Figure Silhouette sitting in deep observation -->
          <div class="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
            
            <!-- Glow around head / focal aura -->
            <div class="absolute -top-3 w-10 h-10 rounded-full bg-orange-400 opacity-40 blur-md animate-pulse"></div>
            <div class="absolute -top-1 w-6 h-6 rounded-full bg-yellow-100 opacity-60 blur-sm"></div>

            <!-- Sleek SVG silhouette (Person in circular ergonomic egg-chair) -->
            <svg class="w-24 h-24 text-black filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]" viewBox="0 0 100 100" fill="currentColor">
              <!-- Pod / Chair -->
              <path d="M50,15 C30,15 20,30 20,55 C20,75 32,85 50,85 C68,85 80,75 80,55 C80,30 70,15 50,15 Z" fill="#060608"></path>
              <!-- Inner Cushion Cutout -->
              <path d="M50,22 C35,22 26,33 26,55 C26,70 34,78 50,78 C66,78 74,70 74,55 C74,33 65,22 50,22 Z" fill="#010102"></path>
              <!-- Person Silhouette inside -->
              <!-- Torso & Arms -->
              <path d="M46,68 L54,68 L54,58 L52,50 L48,50 L46,58 Z" fill="#08080c"></path>
              <!-- Head -->
              <circle cx="50" cy="45" r="4.5" fill="#08080c"></circle>
              <!-- Glow back rim on seat -->
              <path d="M26,55 C26,62 30,70 38,74" stroke="#e6c29e" stroke-width="1" fill="none" opacity="0.4"></path>
              <path d="M74,55 C74,62 70,70 62,74" stroke="#a3704c" stroke-width="1" fill="none" opacity="0.3"></path>
            </svg>

          </div>

          <!-- Glass reflection light glare on the screen -->
          <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-20" style="mix-blend-mode: overlay;"></div>

        </div>
      </div>

      <!-- Left Bottom soft dark gradient blend for natural shadow -->
      <div class="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#030303] to-transparent z-40 pointer-events-none"></div>

    </div>

  </main>

  <!-- Fine Footer Branding -->
  <footer class="relative z-50 w-full max-w-7xl mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between border-t border-[#ffffff05] text-[11px] text-[#636366] gap-4">
    <div class="flex items-center gap-1.5">
      <span>© 2026 Imaginie Inc. All rights reserved.</span>
    </div>
    <div class="flex items-center gap-6">
      <a href="#" class="hover:text-white transition-colors duration-200">Terms of Service</a>
      <a href="#" class="hover:text-white transition-colors duration-200">Privacy Policy</a>
      <a href="#" class="hover:text-white transition-colors duration-200">System Status</a>
    </div>
  </footer>

  <!-- Script for Animations & Live Cosmic Canvas Simulation (WebGL Quality 2D Context) -->
  <script>
    // 1. Text Animation: Splitting the header words cleanly and fading in one by one.
    const title = document.getElementById('hero-title');
    const titleText = title.textContent.trim();
    title.innerHTML = '';
    
    // Split text into words safely
    const words = titleText.split(/\\s+/);
    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'word-span';
      span.innerHTML = word + '&nbsp;';
      span.style.transitionDelay = \`\${index * 80}ms\`;
      title.appendChild(span);
    });

    // Trigger animations when content loaded
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        const spans = document.querySelectorAll('.word-span');
        spans.forEach(span => span.classList.add('visible'));
      }, 100);

      setTimeout(() => {
        document.getElementById('hero-desc').style.opacity = '1';
        document.getElementById('hero-desc').style.transform = 'translateY(0)';
      }, 400);

      setTimeout(() => {
        document.getElementById('hero-actions').style.opacity = '1';
        document.getElementById('hero-actions').style.transform = 'translateY(0)';
      }, 650);

      setTimeout(() => {
        document.getElementById('hero-proof').style.opacity = '1';
        document.getElementById('hero-proof').style.transform = 'translateY(0)';
      }, 850);
    });

    // 2. Interactive Starfield Canvas inside the Portal Frame
    const portalCanvas = document.getElementById('portal-stars');
    const ctxPortal = portalCanvas.getContext('2d');
    
    let stars = [];
    let portalWidth = 0;
    let portalHeight = 0;

    function resizePortalCanvas() {
      const rect = portalCanvas.getBoundingClientRect();
      portalWidth = rect.width;
      portalHeight = rect.height;
      portalCanvas.width = portalWidth;
      portalCanvas.height = portalHeight;
      initStars();
    }

    function initStars() {
      stars = [];
      const count = 45;
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * portalWidth,
          y: Math.random() * portalHeight,
          radius: Math.random() * 1.5 + 0.5,
          color: getRandomColor(),
          speed: Math.random() * 0.15 + 0.05,
          angle: Math.random() * Math.PI * 2,
          pulse: Math.random() * 0.02
        });
      }
    }

    function getRandomColor() {
      const colors = [
        'rgba(230, 194, 158, ', // Bronze/gold matches frame
        'rgba(244, 244, 246, ', // Pure soft white
        'rgba(173, 140, 255, ', // Purple starlight
        'rgba(135, 206, 250, '  // Cool space blue
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    function drawStars() {
      ctxPortal.clearRect(0, 0, portalWidth, portalHeight);
      
      stars.forEach(s => {
        // Drift movement
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        
        // Bounce bounds inside space window
        if (s.x < 0 || s.x > portalWidth) s.angle = Math.PI - s.angle;
        if (s.y < 0 || s.y > portalHeight) s.angle = -s.angle;

        // Sparkle fade
        s.speed += (Math.random() - 0.5) * 0.01;
        s.speed = Math.max(0.02, Math.min(s.speed, 0.25));

        // Pulsing glow alpha
        const alpha = 0.3 + Math.abs(Math.sin(Date.now() * s.pulse)) * 0.7;
        ctxPortal.beginPath();
        ctxPortal.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctxPortal.fillStyle = s.color + alpha + ')';
        ctxPortal.shadowBlur = s.radius * 4;
        ctxPortal.shadowColor = s.color + '0.8)';
        ctxPortal.fill();
      });

      requestAnimationFrame(drawStars);
    }

    // 3. Ambient Starfield on Page Background
    const ambientCanvas = document.getElementById('ambient-starfield');
    const ctxAmbient = ambientCanvas.getContext('2d');
    let ambientStars = [];

    function resizeAmbientCanvas() {
      ambientCanvas.width = window.innerWidth;
      ambientCanvas.height = window.innerHeight;
      initAmbientStars();
    }

    function initAmbientStars() {
      ambientStars = [];
      const count = 70;
      for (let i = 0; i < count; i++) {
        ambientStars.push({
          x: Math.random() * ambientCanvas.width,
          y: Math.random() * ambientCanvas.height,
          size: Math.random() * 0.8 + 0.2,
          opacity: Math.random() * 0.6 + 0.1,
          drift: Math.random() * 0.02 + 0.01
        });
      }
    }

    function drawAmbientStars() {
      ctxAmbient.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);
      ambientStars.forEach(s => {
        s.y -= s.drift;
        if (s.y < 0) s.y = ambientCanvas.height;
        ctxAmbient.fillStyle = \`rgba(255, 255, 255, \${s.opacity})\`;
        ctxAmbient.fillRect(s.x, s.y, s.size, s.size);
      });
      requestAnimationFrame(drawAmbientStars);
    }

    window.addEventListener('resize', () => {
      resizePortalCanvas();
      resizeAmbientCanvas();
    });

    // Initial setups
    resizePortalCanvas();
    resizeAmbientCanvas();
    drawStars();
    drawAmbientStars();
  <\/script>

<script data-neuform-video-controller="true">
(function () {
  function playVideo(video) {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }
  function setupVideo(video) {
    if (video.__neuformVideoReady === true) return;
    video.__neuformVideoReady = true;
    video.muted = true;
    video.playsInline = true;
    var preset = video.dataset.neuformVideoPreset || "loop-in-view";
    if (preset === "hover") {
      video.addEventListener("mouseenter", function () { playVideo(video); });
      video.addEventListener("mouseleave", function () {
        video.pause();
        video.currentTime = 0;
      });
      return;
    }
    if (!("IntersectionObserver" in window)) {
      playVideo(video);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (preset === "play-once" && video.__neuformVideoPlayed === true) return;
          playVideo(video);
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.35 });
    if (preset === "play-once") {
      video.addEventListener("ended", function () {
        video.__neuformVideoPlayed = true;
      }, { once: true });
    }
    observer.observe(video);
  }
  function setupVideos() {
    document.querySelectorAll("video[data-neuform-video-preset]").forEach(setupVideo);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupVideos);
  } else {
    setupVideos();
  }
})();<\/script></body></html>`,ae=`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>N E X U S &mdash; Tactile Fluidics</title>
    
    <script src="https://cdn.tailwindcss.com"><\/script>
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"><\/script>
    
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
</head>
<body class="bg-[#02040a] text-neutral-200 h-screen w-screen overflow-hidden font-['Inter',sans-serif] selection:bg-[#06b6d4] selection:text-black relative">

    <!-- Ambient WebGL Background -->
    <canvas id="bg-canvas" class="absolute inset-0 w-full h-full block pointer-events-none z-0 opacity-0" aria-hidden="true"></canvas>

    <!-- Top Navigation / Logo -->
    <header class="absolute top-0 left-0 w-full p-6 sm:p-10 z-20 flex justify-between items-center opacity-0 nav-reveal">
        <div class="font-light text-sm tracking-[0.4em] uppercase text-neutral-400">
            N E X U S
        </div>
        <div class="flex gap-4">
            <div class="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse" style="animation-duration: 3s;"></div>
        </div>
    </header>

    <!-- Main Content Layer -->
    <main class="content-layer relative z-10 w-full h-full flex flex-col items-center justify-center px-4">
        
        <div class="tag font-mono text-xs tracking-[0.3em] uppercase text-[#06b6d4] mb-8 sm:mb-12 opacity-0 transform translate-y-4">
            System 07 / Viscosity
        </div>

        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight font-normal text-neutral-100 flex flex-wrap justify-center gap-x-3 gap-y-2 max-w-4xl text-center mb-6 overflow-hidden">
            <span class="overflow-hidden inline-block"><span class="reveal-word inline-block translate-y-full will-change-transform">Viscous</span></span>
            <span class="overflow-hidden inline-block"><span class="reveal-word inline-block translate-y-full will-change-transform text-neutral-400">Fields.</span></span>
            <span class="overflow-hidden inline-block"><span class="reveal-word inline-block translate-y-full will-change-transform">Reengineered.</span></span>
        </h1>

        <p class="subhead text-sm sm:text-base text-neutral-400 font-light tracking-wide max-w-md text-center mb-12 sm:mb-16 opacity-0 transform translate-y-4">
            Delve into high-fidelity tactile feedback arrays. Engineered for continuous adaptive state manipulation.
        </p>

        <!-- CTA Component -->
        <div class="intro opacity-0 transform translate-y-[-20px] scale-95 will-change-transform">
            <!-- Subtle Cyan Gradient Border Wrapper -->
            <div class="p-[1px] rounded-[19px] bg-gradient-to-b from-cyan-500/30 via-neutral-800/20 to-cyan-950/40 shadow-2xl">
                <button class="relative flex items-center justify-center w-[250px] h-[70px] border-0 p-0 rounded-[18px] overflow-hidden cursor-pointer bg-[#050b11] transition-all duration-300 ease-out shadow-[0_22px_44px_rgba(4,24,36,0.35),0_3px_9px_rgba(5,10,15,0.4),inset_0_0_0_1px_rgba(255,255,255,0.05)] hover:-translate-y-[2px] hover:shadow-[0_28px_56px_rgba(6,182,212,0.25),0_4px_11px_rgba(5,10,15,0.45)] active:translate-y-[1px] active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#06b6d4] focus-visible:outline-offset-[5px]" id="btn" type="button">
                    <canvas id="gl" aria-hidden="true" class="absolute inset-0 w-full h-full block"></canvas>
                    <span class="relative z-10 pointer-events-none font-normal text-sm tracking-[0.3em] indent-[0.3em] text-[#e0faff] drop-shadow-[0_1px_10px_rgba(0,18,25,0.85)] flex items-center gap-2">
                        SURGE
                        <iconify-icon icon="solar:arrow-right-linear" width="18" height="18" stroke-width="1.5" class="ml-1 opacity-80"></iconify-icon>
                    </span>
                </button>
            </div>
        </div>

        <p class="note font-light text-xs text-neutral-500 tracking-wide mt-8 sm:mt-10 opacity-0 transform translate-y-4">
            Sweep the cursor to generate turbulence, click to discharge.
        </p>
    </main>

    <script>
        // --------------------------------------------------------
        // GSAP Animations & Parallax
        // --------------------------------------------------------
        document.addEventListener("DOMContentLoaded", () => {
            const tl = gsap.timeline();

            // Background Fade In
            tl.to("#bg-canvas", { opacity: 1, duration: 2, ease: "power2.inOut" }, 0);
            
            // Nav Reveal
            tl.to(".nav-reveal", { opacity: 1, duration: 1, ease: "power2.out" }, 0.5);

            // Tag Reveal
            tl.to(".tag", { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.8);

            // Masked Word Stagger
            tl.to(".reveal-word", {
                y: "0%",
                duration: 1,
                stagger: 0.12,
                ease: "power4.out"
            }, 0.9);

            // Subhead Reveal
            tl.to(".subhead", { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 1.4);

            // Button Drop/Bounce Effect (Replicating CSS Keyframes)
            tl.to(".intro", {
                y: 0,
                scale: 1,
                opacity: 1,
                duration: 1.2,
                ease: "elastic.out(1, 0.6)"
            }, 1.6);

            // Note Reveal
            tl.to(".note", { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 1.8);

            // Subtle Mouse Parallax
            document.addEventListener("mousemove", (e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * 15;
                const y = (e.clientY / window.innerHeight - 0.5) * 15;
                
                gsap.to(".content-layer", {
                    x: x,
                    y: y,
                    duration: 1.5,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });
        });

        // --------------------------------------------------------
        // Ambient Background WebGL
        // --------------------------------------------------------
        (function initAmbientBG() {
            const canvas = document.getElementById('bg-canvas');
            const gl = canvas.getContext('webgl');
            if (!gl) return;

            const vs = 'attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }';
            const fs = \`
                precision mediump float;
                uniform vec2 u_res;
                uniform float u_time;

                float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
                float noise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
                }
                float fbm(vec2 p) {
                    float v = 0.0, a = 0.5;
                    for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.0; a *= 0.5; }
                    return v;
                }

                void main() {
                    vec2 uv = gl_FragCoord.xy / u_res;
                    uv.x *= u_res.x / u_res.y;
                    
                    float t = u_time * 0.15;
                    
                    // Slow moving dark liquid
                    vec2 q = vec2(fbm(uv + t), fbm(uv + vec2(1.0) + t));
                    vec2 r = vec2(fbm(uv + 1.0*q + vec2(1.7, 9.2) + 0.15*t),
                                  fbm(uv + 1.0*q + vec2(8.3, 2.8) + 0.126*t));
                    
                    float f = fbm(uv + r);
                    
                    // Core dark colors, subtle icy/cyan hints replacing fiery shades
                    vec3 col = mix(vec3(0.01, 0.02, 0.03), vec3(0.01, 0.04, 0.07), f);
                    col = mix(col, vec3(0.02, 0.07, 0.12), clamp(length(q) * 0.5, 0.0, 1.0));
                    
                    // Vignette
                    vec2 e = gl_FragCoord.xy / u_res * (1.0 - gl_FragCoord.xy / u_res);
                    col *= 0.5 + 0.5 * pow(e.x * e.y * 15.0, 0.3);
                    
                    gl_FragColor = vec4(col, 1.0);
                }
            \`;

            function compile(type, src) {
                const s = gl.createShader(type);
                gl.shaderSource(s, src);
                gl.compileShader(s);
                return s;
            }

            const prog = gl.createProgram();
            gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
            gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
            gl.linkProgram(prog);
            gl.useProgram(prog);

            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
            
            const locP = gl.getAttribLocation(prog, 'p');
            gl.enableVertexAttribArray(locP);
            gl.vertexAttribPointer(locP, 2, gl.FLOAT, false, 0, 0);

            const uRes = gl.getUniformLocation(prog, 'u_res');
            const uTime = gl.getUniformLocation(prog, 'u_time');

            function resize() {
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                canvas.width = window.innerWidth * dpr;
                canvas.height = window.innerHeight * dpr;
                gl.viewport(0, 0, canvas.width, canvas.height);
            }
            window.addEventListener('resize', resize);
            resize();

            const start = performance.now();
            function render(now) {
                gl.uniform2f(uRes, canvas.width, canvas.height);
                gl.uniform1f(uTime, (now - start) / 1000);
                gl.drawArrays(gl.TRIANGLES, 0, 3);
                requestAnimationFrame(render);
            }
            requestAnimationFrame(render);
        })();

        // --------------------------------------------------------
        // Interactive Liquid Button WebGL (from reference)
        // --------------------------------------------------------
        (function initButtonWebGL() {
            var btn = document.getElementById('btn');
            var canvas = document.getElementById('gl');
            var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            var gl = canvas.getContext('webgl');
            
            if (!gl) { 
                btn.style.background = 'linear-gradient(to top, #0284c7 0%, #06b6d4 52%, #a5f3fc 55%, #050b11 56%)';
                canvas.style.display = 'none';
                return; 
            }

            var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
            var FS = [
                'precision highp float;',
                'uniform vec2 u_res;',
                'uniform float u_time;',
                'uniform float u_level;',
                'uniform float u_tilt;',
                'uniform float u_slosh;',
                'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}',
                'float noise(vec2 p){',
                '  vec2 i=floor(p), f=fract(p);',
                '  vec2 u=f*f*(3.0-2.0*f);',
                '  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),',
                '             mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);',
                '}',
                'float fbm(vec2 p){',
                '  float v=0.0; float a=0.5;',
                '  for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.04+vec2(11.3,7.1); a*=0.5; }',
                '  return v;',
                '}',
                'void main(){',
                '  vec2 uv = gl_FragCoord.xy / u_res;',
                '  float ar = u_res.x / u_res.y;',
                '  float x = uv.x * ar;',
                '  float t = u_time;',
                '  float amp = 0.012 + u_slosh * 0.045;',
                '  float surf = u_level',
                '    + u_tilt * (uv.x - 0.5) * 0.34',
                '    + amp * sin(x * 5.1 + t * 4.6)',
                '    + amp * 0.62 * sin(x * 9.7 + t * (-6.8) + 1.7)',
                '    + amp * 0.38 * sin(x * 14.3 + t * 8.9 + 4.2);',
                '  float d = surf - uv.y;',
                '  vec3 col = mix(vec3(0.03, 0.06, 0.1), vec3(0.05, 0.09, 0.15), uv.y);',
                '  col += vec3(0.02, 0.05, 0.1) * pow(max(0.0, 1.0 - abs(uv.y - 0.88) * 6.0), 2.0);',
                '  float inside = smoothstep(0.0, 0.012, d);',
                '  float depth = clamp(d / max(u_level, 0.001), 0.0, 1.0);',
                '  vec3 liq = mix(vec3(0.0, 0.9, 1.0), vec3(0.02, 0.15, 0.45), depth);',
                '  float caust = fbm(vec2(x * 4.2, (uv.y + t * 0.14) * 4.2));',
                '  liq *= 0.8 + 0.42 * caust;',
                '  liq += vec3(0.02, 0.25, 0.35) * pow(max(0.0, d * 3.0), 1.5) * u_slosh;',
                '  col = mix(col, liq, inside);',
                '  col += vec3(0.4, 0.9, 1.0) * exp(-abs(d) * 80.0) * 0.85;',
                '  col += vec3(0.8, 0.98, 1.0) * exp(-abs(d) * 220.0) * 0.5;',
                '  vec2 e = uv * (1.0 - uv);',
                '  col *= 0.55 + 0.45 * pow(e.x * e.y * 16.0, 0.22);',
                '  gl_FragColor = vec4(col, 1.0);',
                '}'
            ].join('\\n');

            function compile(type, src) {
                var s = gl.createShader(type);
                gl.shaderSource(s, src);
                gl.compileShader(s);
                return s;
            }
            
            var prog = gl.createProgram();
            gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
            gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
            gl.linkProgram(prog);
            gl.useProgram(prog);

            var buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
            var locP = gl.getAttribLocation(prog, 'p');
            gl.enableVertexAttribArray(locP);
            gl.vertexAttribPointer(locP, 2, gl.FLOAT, false, 0, 0);

            var uRes = gl.getUniformLocation(prog, 'u_res');
            var uTime = gl.getUniformLocation(prog, 'u_time');
            var uLevel = gl.getUniformLocation(prog, 'u_level');
            var uTilt = gl.getUniformLocation(prog, 'u_tilt');
            var uSlosh = gl.getUniformLocation(prog, 'u_slosh');

            function resize() {
                var dpr = Math.min(window.devicePixelRatio || 1, 2);
                var w = Math.max(1, Math.round(canvas.clientWidth * dpr));
                var h = Math.max(1, Math.round(canvas.clientHeight * dpr));
                if (canvas.width !== w || canvas.height !== h) {
                    canvas.width = w;
                    canvas.height = h;
                    gl.viewport(0, 0, w, h);
                }
            }
            window.addEventListener('resize', resize);
            resize();

            var BASE = 0.56;
            var level = BASE, gulp = 0;
            var slosh = 0.4, tilt = 0, tiltTarget = 0;
            var lastX = null;
            var last = performance.now();

            btn.addEventListener('mousemove', function (e) {
                var rect = btn.getBoundingClientRect();
                var x = (e.clientX - rect.left) / Math.max(1, rect.width);
                if (lastX !== null) {
                    slosh = Math.min(1.4, slosh + Math.abs(x - lastX) * 2.6);
                }
                lastX = x;
                tiltTarget = Math.max(-1, Math.min(1, (x - 0.5) * 2));
            });
            btn.addEventListener('mouseleave', function () { lastX = null; tiltTarget = 0; });
            btn.addEventListener('focus', function () { slosh = Math.min(1.4, slosh + 0.5); });
            btn.addEventListener('click', function () {
                gulp = 1;
                slosh = Math.min(1.4, slosh + 0.7);
            });

            function frame(now) {
                var dt = Math.min(0.05, (now - last) / 1000);
                last = now;
                slosh *= Math.exp(-1.5 * dt);
                gulp *= Math.exp(-1.1 * dt);
                tilt += (tiltTarget - tilt) * Math.min(1, dt * 5);
                var levelTarget = BASE - 0.36 * gulp;
                level += (levelTarget - level) * Math.min(1, dt * 5.5);
                
                resize();
                gl.uniform2f(uRes, canvas.width, canvas.height);
                gl.uniform1f(uTime, reduced ? 2.0 : now / 1000);
                gl.uniform1f(uLevel, level);
                gl.uniform1f(uTilt, tilt);
                gl.uniform1f(uSlosh, reduced ? 0.25 : slosh);
                gl.drawArrays(gl.TRIANGLES, 0, 3);
                requestAnimationFrame(frame);
            }
            requestAnimationFrame(frame);
        })();
    <\/script>
</body>
</html>`,re="<!DOCTYPE html><html><head></head><body></body></html>",oe="<!DOCTYPE html><html><head></head><body></body></html>",ie="<!DOCTYPE html><html><head></head><body></body></html>",se="<!DOCTYPE html><html><head></head><body></body></html>",le=`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Uploading — glowing border microinteraction</title>
<style>
  :root{ color-scheme: dark; }
  html,body{ margin:0; height:100%; background:#1d1d1d; }
  body{
    display:flex; align-items:center; justify-content:center;
    overflow:hidden; -webkit-font-smoothing:antialiased;
  }
  #stage{
    position:relative;
    width:min(100vw,100svh); height:min(100vw,100svh);
    background:#1d1d1d;
  }
  #c{ position:absolute; inset:0; width:100%; height:100%; display:block; }
</style>
</head>
<body>
<div id="stage"><canvas id="c"></canvas></div>
<script>
(function(){
  'use strict';

  /* ---------- reference frame: everything authored in a 2048px square ---------- */
  var REF = 2048;
  var CX = 1024 - 22, CY = 1024 + 11.5;   /* button centre in the source recording */
  var PW = 976, PH = 345, PR = 100;       /* plate */
  var GAP = 50;                            /* plate edge -> track centre */
  var TW = PW + 2*GAP, TH = PH + 2*GAP, TR = PR + GAP;
  var TRACK_W = 13, CORE_W = 14, GLOW_W = 12;

  var DUR = 2.70;                          /* one lap of the trace = one loop */
  var TAIL = 0.389;                        /* comet length, in laps */
  var SHIM_OFF = 0.898;                    /* lap phase where the text sweep turns at the left */
  var TXT_W = 778, TXT_CAP = 120, TXT_BASE = 1093;
  var FONT = '300 100px -apple-system, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Inter, system-ui, "Segoe UI", Roboto, sans-serif';

  var cv = document.getElementById('c'), ctx = cv.getContext('2d');
  var gl = document.createElement('canvas'), gx = gl.getContext('2d');   /* comet, glow tint */
  var co = document.createElement('canvas'), cox = co.getContext('2d');  /* comet, core tint */
  var S = 0, k = 1, dpr = 1;
  var canFilter = (function(){ var t=document.createElement('canvas').getContext('2d'); t.filter='blur(2px)'; return t.filter!=='none'; })();

  /* ---------- geometry: rounded rect sampled by arc length ---------- */
  function rrPath(c, cx, cy, w, h, r){
    var x = cx - w/2, y = cy - h/2;
    c.beginPath();
    c.moveTo(x+r, y);
    c.lineTo(x+w-r, y);   c.arcTo(x+w, y,     x+w, y+r,     r);
    c.lineTo(x+w, y+h-r); c.arcTo(x+w, y+h,   x+w-r, y+h,   r);
    c.lineTo(x+r, y+h);   c.arcTo(x,   y+h,   x,   y+h-r,   r);
    c.lineTo(x, y+r);     c.arcTo(x,   y,     x+r, y,       r);
    c.closePath();
  }

  /* point on the track outline at arc length s, starting at the top-left corner
     tangent point and running clockwise */
  var SW = TW - 2*TR, SH = TH - 2*TR, ARC = Math.PI*TR/2;
  var PERIM = 2*SW + 2*SH + 4*ARC;
  var L = CX - TW/2, T = CY - TH/2, R = CX + TW/2, B = CY + TH/2;
  function ptAt(s){
    s = s - Math.floor(s/PERIM)*PERIM;
    var a;
    if(s < SW)  return [L+TR+s, T];
    s -= SW;
    if(s < ARC){ a = s/TR; return [R-TR+TR*Math.sin(a), T+TR-TR*Math.cos(a)]; }
    s -= ARC;
    if(s < SH)  return [R, T+TR+s];
    s -= SH;
    if(s < ARC){ a = s/TR; return [R-TR+TR*Math.cos(a), B-TR+TR*Math.sin(a)]; }
    s -= ARC;
    if(s < SW)  return [R-TR-s, B];
    s -= SW;
    if(s < ARC){ a = s/TR; return [L+TR-TR*Math.sin(a), B-TR+TR*Math.cos(a)]; }
    s -= ARC;
    if(s < SH)  return [L, B-TR-s];
    s -= SH;
    a = s/TR; return [L+TR-TR*Math.cos(a), T+TR-TR*Math.sin(a)];
  }

  /* brightness along the comet, sampled off the source clip every 0.0139 lap:
     a hot head, a flat core, then a long uneven fade */
  var TAPER = [1.16,1.09,1.03,1.00,1.02,1.00,1.00,1.00,1.00,0.98,0.97,0.94,0.91,0.89,
               0.84,0.77,0.74,0.65,0.61,0.52,0.43,0.40,0.27,0.23,0.17,0.12,0.075,0.02,0];
  var TSTEP = TAIL/(TAPER.length-1);
  function taper(u){                        /* u = laps behind the head */
    if(u < 0 || u >= TAIL) return 0;
    var f = u/TSTEP, i = Math.floor(f);
    return TAPER[i] + (TAPER[i+1]-TAPER[i])*(f-i);
  }

  /* ---------- sizing ---------- */
  function resize(){
    var st = document.getElementById('stage');
    S = st.clientWidth || 1;
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    cv.width = gl.width = co.width = Math.round(S*dpr);
    cv.height = gl.height = co.height = Math.round(S*dpr);
    k = S*dpr/REF;
    fitText();
    render(now);
  }

  /* ---------- text: fit cap-height and total width to the recording ---------- */
  var glyphs = [], fontPx = 169, tracking = 0, textX = 0;
  function fitText(){
    var word = 'Uploading', n = word.length, probe = 200;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.font = FONT.replace('100px', probe+'px');
    var cap = ctx.measureText('U').actualBoundingBoxAscent || probe*0.7;
    fontPx = probe * (TXT_CAP*k) / cap;                 /* cap height matches the source */
    ctx.font = FONT.replace('100px', fontPx+'px');
    glyphs = [];
    var advSum = 0, m;
    for(var i=0;i<n;i++){
      m = ctx.measureText(word[i]);
      glyphs.push({ch:word[i], w:m.width});
      if(i < n-1) advSum += m.width;
    }
    /* the source was measured as ink extents, so lay out to ink, not to advances */
    var lead = ctx.measureText(word[0]).actualBoundingBoxLeft;
    var trail = ctx.measureText(word[n-1]).actualBoundingBoxRight;
    tracking = (TXT_W*k - trail - lead - advSum) / (n-1);
    textX = (CX + 4)*k - TXT_W*k/2 + lead;
  }

  /* ---------- painting ---------- */
  /* the comet is painted opaque into its own layer, then added over the scene, so
     overlapping segments never double-blend */
  function paintComet(c, head, col, hot, width){
    c.setTransform(1,0,0,1,0,0);
    c.clearRect(0,0,c.canvas.width,c.canvas.height);
    c.lineCap = 'round';
    c.lineWidth = width*k;
    var step = 6;                                   /* ref px per segment */
    var n = Math.ceil(TAIL*PERIM/step);
    for(var i=n;i>=1;i--){
      var s1 = head - i*step, s0 = head - (i-1)*step;
      var a = taper((i*step)/PERIM);
      if(a <= 0.002) continue;
      var f = Math.min(a, 1.30), x = Math.max(0, f-1);
      var r = Math.round(Math.min(255, col[0]*f + hot[0]*x));
      var g = Math.round(Math.min(255, col[1]*f + hot[1]*x));
      var b = Math.round(Math.min(255, col[2]*f + hot[2]*x));
      var p1 = ptAt(s1), mid = ptAt((s1+s0)/2), p0 = ptAt(s0);
      c.strokeStyle = 'rgb('+r+','+g+','+b+')';
      c.beginPath();
      c.moveTo(p1[0]*k, p1[1]*k);
      c.lineTo(mid[0]*k, mid[1]*k);
      c.lineTo(p0[0]*k, p0[1]*k);
      c.stroke();
    }
  }

  function plate(c){
    var x = CX - PW/2, y = CY - PH/2;
    var grd = c.createLinearGradient(0, y*k, 0, (y+PH)*k);
    grd.addColorStop(0, '#2e3242');
    grd.addColorStop(0.55, '#2b2f3c');
    grd.addColorStop(1, '#272c36');
    rrPath(c, CX*k, CY*k, PW*k, PH*k, PR*k);
    c.fillStyle = grd;
    c.fill();

    /* neumorphic edges: a hairline of white light just inside the top, a cool
       bounce just inside the bottom */
    c.lineWidth = 5*k;
    var hg = c.createLinearGradient(0, y*k, 0, (y+PH)*k);
    hg.addColorStop(0,    'rgba(226,233,255,0.125)');
    hg.addColorStop(0.10, 'rgba(226,233,255,0)');
    hg.addColorStop(0.90, 'rgba(80,100,255,0)');
    hg.addColorStop(1,    'rgba(80,100,255,0.22)');
    rrPath(c, CX*k, CY*k, (PW-13)*k, (PH-13)*k, (PR-6.5)*k);
    c.strokeStyle = hg;
    c.stroke();
  }

  function label(c, ph){
    /* shimmer: a soft band ping-pongs across the word, twice per lap */
    var q = ph - SHIM_OFF; q -= Math.floor(q);
    var u = q < 0.5 ? q/0.5 : (1-q)/0.5;
    var x0 = textX, w = TXT_W*k;
    var bc = x0 + w*(-0.2375 + 1.475*u);   /* sweeps clear of both ends before turning */
    var bw = w*0.22;
    var g = c.createLinearGradient(bc-bw, 0, bc+bw, 0);
    g.addColorStop(0,    'rgb(83,92,135)');
    g.addColorStop(0.30, 'rgb(97,106,150)');
    g.addColorStop(0.5,  'rgb(133,141,189)');
    g.addColorStop(0.70, 'rgb(97,106,150)');
    g.addColorStop(1,    'rgb(83,92,135)');
    c.fillStyle = g;
    c.strokeStyle = g;
    c.font = FONT.replace('100px', fontPx+'px');
    c.textBaseline = 'alphabetic';
    var x = textX;
    for(var i=0;i<glyphs.length;i++){
      if(glyphs[i].ch === 'g') doubleStoreyG(c);
      else{
        /* the source face sits between Light and Regular, so nudge the stems out */
        c.fillText(glyphs[i].ch, x, TXT_BASE*k);
        c.lineWidth = 1.9*k;
        c.strokeText(glyphs[i].ch, x, TXT_BASE*k);
      }
      x += glyphs[i].w + tracking;
    }
  }

  /* the source sets a double-storey g, which no system face here carries, so it is
     drawn as a monoline: upper bowl, ear, link, lower loop */
  function doubleStoreyG(c){
    c.save();
    c.lineWidth = 11.5*k;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(1327*k, 1050*k); c.lineTo(1319*k, 1084*k);              /* link down the left */
    c.stroke();
    c.beginPath();
    c.ellipse(1351.5*k, 1035*k, 30*k, 21*k, 0, 0, Math.PI*2);        /* bowl */
    c.stroke();
    c.beginPath();
    c.ellipse(1353*k, 1100*k, 35*k, 16*k, 0, 0, Math.PI*2);          /* descending loop */
    c.stroke();
    c.beginPath();
    c.moveTo(1352*k, 1011*k);                                        /* ear */
    c.quadraticCurveTo(1382*k, 1003*k, 1390*k, 1017*k);
    c.stroke();
    c.restore();
  }

  function render(t){
    if(!S) return;
    var ph = (t/DUR) % 1; if(ph < 0) ph += 1;
    var head = ph*PERIM;

    ctx.setTransform(1,0,0,1,0,0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.filter = 'none';
    ctx.fillStyle = '#1d1d1d';
    ctx.fillRect(0,0,cv.width,cv.height);

    /* the faint track the light runs on */
    rrPath(ctx, CX*k, CY*k, TW*k, TH*k, TR*k);
    ctx.lineWidth = TRACK_W*k;
    ctx.strokeStyle = 'rgba(120,140,255,0.048)';
    ctx.stroke();

    /* the travelling light: a blue bloom under a pale core */
    paintComet(gx,  head, [95,125,242], [50,70,120], GLOW_W);
    paintComet(cox, head, [82,90,110],  [70,60,40],  CORE_W);
    ctx.globalCompositeOperation = 'lighter';
    if(canFilter){
      ctx.filter = 'blur('+(28*k)+'px)'; ctx.globalAlpha = 0.62; ctx.drawImage(gl,0,0);
      ctx.filter = 'blur('+(8*k)+'px)';  ctx.globalAlpha = 0.45; ctx.drawImage(gl,0,0);
      ctx.filter = 'blur('+(1.8*k)+'px)';ctx.globalAlpha = 1;    ctx.drawImage(co,0,0);
      ctx.filter = 'none';
    }else{
      ctx.shadowColor = 'rgba(88,122,255,0.9)';
      ctx.shadowBlur = 26*k; ctx.globalAlpha = 0.7; ctx.drawImage(gl,0,0);
      ctx.shadowBlur = 8*k;  ctx.globalAlpha = 0.8; ctx.drawImage(gl,0,0);
      ctx.shadowBlur = 0;    ctx.globalAlpha = 1;   ctx.drawImage(co,0,0);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    /* the button sits over the light, so the inner half of the glow is hidden */
    plate(ctx);
    label(ctx, ph);
  }

  /* ---------- clock ---------- */
  var now = 0, playing = true, last = null;
  function frame(ts){
    if(playing){
      if(last != null) now = (now + (ts-last)/1000) % DUR;
      last = ts;
      render(now);
    }else last = ts;
    requestAnimationFrame(frame);
  }

  window.__DUR = DUR;
  window.__seek = function(t){ playing = false; now = ((t % DUR) + DUR) % DUR; render(now); };
  window.__play = function(){ playing = true; last = null; };
  window.__pause = function(){ playing = false; };
  window.__time = function(){ return now; };

  window.addEventListener('resize', resize);
  if(window.ResizeObserver) new ResizeObserver(resize).observe(document.getElementById('stage'));
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ fitText(); render(now); });
  resize();
  requestAnimationFrame(frame);
})();
<\/script>
</body>
</html>
`,_="<!DOCTYPE html><html><head></head><body></body></html>",ce="<!DOCTYPE html><html><head></head><body></body></html>",de="<!DOCTYPE html><html><head></head><body></body></html>",ue="<!DOCTYPE html><html><head></head><body></body></html>",he=`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VALENCE CORE | Kinetic Induction</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"><\/script>

    <!-- Scripts -->
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"><\/script>
</head>
<body class="bg-neutral-950 text-neutral-50 h-screen w-screen overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-50 flex flex-col relative antialiased">

    <!-- Ambient WebGL Background -->
    <canvas id="bg-canvas" class="absolute inset-0 w-full h-full z-0 opacity-60 pointer-events-none" aria-hidden="true"></canvas>

    <!-- Overlay Vignette for depth -->
    <div class="absolute inset-0 z-0 pointer-events-none" style="background: radial-gradient(circle at center, transparent 0%, rgba(10,10,10,0.8) 100%);"></div>

    <!-- Navigation -->
    <nav class="absolute top-0 w-full flex justify-between items-center px-6 py-6 z-20" style="opacity: 0; transform: translateY(-20px);" id="main-nav">
        <div class="flex items-center gap-2">
            <iconify-icon icon="solar:atom-linear" class="text-cyan-500 text-xl" style="stroke-width: 1.5px;"></iconify-icon>
            <span class="font-medium text-sm tracking-tight text-neutral-200">VALENCE SYSTEM</span>
        </div>
        
        <!-- Premium Border Gradient Pill -->
        <div class="hidden sm:flex relative p-[1px] rounded-full overflow-hidden items-center justify-center cursor-pointer group transition-transform duration-300 hover:scale-105">
            <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/50 via-neutral-500/10 to-transparent rounded-full group-hover:from-cyan-500/80 transition-colors duration-500"></div>
            <div class="relative bg-neutral-950 rounded-full px-5 py-2 flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-cyan-500" style="box-shadow: 0 0 8px rgba(6, 182, 212, 0.8);"></div>
                <span class="text-xs font-medium tracking-wide text-neutral-300">Induction Active</span>
            </div>
        </div>
    </nav>

    <!-- Main Content Stage -->
    <main class="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 w-full h-full max-w-4xl mx-auto">
        
        <div class="mb-8 flex flex-col items-center" id="intro-tags">
            <div class="font-mono font-medium text-xs tracking-[0.3em] uppercase text-cyan-500 mb-6" style="opacity: 0; transform: translateY(12px);" id="tag-text">
                SYS 12 // Kinetic Pulse
            </div>
            
            <h1 class="text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight leading-[1.1] text-neutral-50" data-split>
                Command the momentum.
            </h1>
            <p class="mt-6 text-sm sm:text-base text-neutral-400 max-w-md font-normal leading-relaxed" data-split>
                Initialize the valence induction loop. The kinetic perimeter is optimized and standing by for sequence execution.
            </p>
        </div>

        <!-- WebGL Button Component -->
        <div class="mt-10 relative flex justify-center w-full" id="btn-container" style="opacity: 0; transform: scale(0.92);">
            <button class="relative flex items-center justify-center w-[280px] h-[96px] bg-transparent cursor-pointer rounded-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 group" id="btn" type="button" style="transition: transform .22s cubic-bezier(.34, 1.4, .5, 1);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'" onmousedown="this.style.transform='translateY(1px) scale(.99)'" onmouseup="this.style.transform='translateY(-2px)'">
                <canvas id="btn-gl" aria-hidden="true" class="absolute inset-0 w-full h-full block rounded-[18px]"></canvas>
                <span class="relative z-10 pointer-events-none font-medium text-sm tracking-[0.3em] indent-[0.3em] text-[#e0f7f8]" style="text-shadow: 0 0 12px rgba(0, 210, 255, .6), 0 1px 4px rgba(0, 0, 0, .8);">VALENCE CORE</span>
            </button>
        </div>

        <p class="mt-8 text-xs text-neutral-500 tracking-wide font-normal" style="opacity: 0; transform: translateY(12px);" id="note-text">
            Hover to trigger neural arcs, click to unleash a synchronized valence discharge.
        </p>

    </main>

    <script>
        // --- GSAP Animations ---
        document.addEventListener("DOMContentLoaded", () => {
            // Masked Text Splitter
            document.querySelectorAll('[data-split]').forEach(el => {
                const text = el.innerText;
                el.innerHTML = '';
                text.split(' ').forEach(word => {
                    if (word.trim() === '') return;
                    const wrapper = document.createElement('span');
                    wrapper.style.display = 'inline-block';
                    wrapper.style.overflow = 'hidden';
                    wrapper.style.verticalAlign = 'top';
                    wrapper.style.marginRight = '0.25em';
                    wrapper.style.paddingBottom = '0.1em';

                    const inner = document.createElement('span');
                    inner.style.display = 'inline-block';
                    inner.style.transform = 'translateY(100%)';
                    inner.style.opacity = '0';
                    inner.className = 'mask-target';
                    inner.innerText = word;

                    wrapper.appendChild(inner);
                    el.appendChild(wrapper);
                });
            });

            const tl = gsap.timeline();

            // Nav Entrance
            tl.to("#main-nav", { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.2 });

            // Tag Entrance
            tl.to("#tag-text", { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.6");

            // Text Reveal
            tl.to(".mask-target", {
                y: "0%",
                opacity: 1,
                duration: 0.8,
                stagger: 0.04,
                ease: "power3.out"
            }, "-=0.4");

            // Button Flicker Entrance
            tl.to("#btn-container", {
                keyframes: {
                    "0%":   { opacity: 0, scale: 0.92 },
                    "9%":   { opacity: 0.85 },
                    "15%":  { opacity: 0.12 },
                    "24%":  { opacity: 0.92 },
                    "31%":  { opacity: 0.35 },
                    "44%":  { opacity: 1, scale: 1.015 },
                    "100%": { opacity: 1, scale: 1 }
                },
                duration: 1.15,
                ease: "none"
            }, "-=0.2");

            // Note Entrance
            tl.to("#note-text", { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.5");
        });

        // --- Core WebGL Logic ---
        (function () {
            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            function compileShader(gl, type, src) {
                const s = gl.createShader(type);
                gl.shaderSource(s, src);
                gl.compileShader(s);
                if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                    console.error('shader compile failed:', gl.getShaderInfoLog(s));
                }
                return s;
            }

            function createProgram(gl, vsSrc, fsSrc) {
                const prog = gl.createProgram();
                gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, vsSrc));
                gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, fsSrc));
                gl.linkProgram(prog);
                if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                    console.error('program link failed:', gl.getProgramInfoLog(prog));
                }
                return prog;
            }

            const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

            // --- 1. Ambient Background Canvas ---
            function initBackgroundGL() {
                const canvas = document.getElementById('bg-canvas');
                const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
                if (!gl) return;

                const FS_BG = \`
                    precision highp float;
                    uniform vec2 u_res;
                    uniform float u_time;
                    
                    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
                    float noise(vec2 p){
                        vec2 i=floor(p), f=fract(p);
                        vec2 u=f*f*(3.0-2.0*f);
                        return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),
                                   mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);
                    }
                    float fbm(vec2 p){
                        float v=0.0; float a=0.5;
                        for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.05+vec2(9.7,3.1); a*=0.5; }
                        return v;
                    }
                    void main(){
                        vec2 uv = gl_FragCoord.xy / u_res.y;
                        float t = u_time * 0.1;
                        
                        float n1 = fbm(uv * 1.5 + vec2(t * 0.2, t * 0.1));
                        float n2 = fbm(uv * 2.0 - vec2(t * 0.15, -t * 0.2) + n1);
                        
                        vec3 baseCol = vec3(0.039, 0.039, 0.039);
                        // Restyled to Deep Cyan Highlight
                        vec3 highlightCol = vec3(0.01, 0.08, 0.12);
                        
                        vec3 col = mix(baseCol, highlightCol, n2 * 0.4);
                        
                        vec2 grid = fract(uv * 20.0);
                        float line = smoothstep(0.95, 1.0, max(grid.x, grid.y));
                        col += vec3(0.015) * line * (1.0 - n1);
                        
                        gl_FragColor = vec4(col, 1.0);
                    }
                \`;

                const prog = createProgram(gl, VS, FS_BG);
                gl.useProgram(prog);

                const buf = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
                const locP = gl.getAttribLocation(prog, 'p');
                gl.enableVertexAttribArray(locP);
                gl.vertexAttribPointer(locP, 2, gl.FLOAT, false, 0, 0);

                const uRes = gl.getUniformLocation(prog, 'u_res');
                const uTime = gl.getUniformLocation(prog, 'u_time');

                function resize() {
                    const dpr = Math.min(window.devicePixelRatio || 1, 2);
                    const w = Math.round(canvas.clientWidth * dpr);
                    const h = Math.round(canvas.clientHeight * dpr);
                    if (canvas.width !== w || canvas.height !== h) {
                        canvas.width = w; canvas.height = h;
                        gl.viewport(0, 0, w, h);
                    }
                }
                window.addEventListener('resize', resize);
                resize();

                function render(now) {
                    resize();
                    gl.uniform2f(uRes, canvas.width, canvas.height);
                    gl.uniform1f(uTime, reduced ? 0 : now / 1000);
                    gl.drawArrays(gl.TRIANGLES, 0, 3);
                    requestAnimationFrame(render);
                }
                requestAnimationFrame(render);
            }

            // --- 2. Button WebGL (Remixed to Electric Cyan & Emerald) ---
            function initButtonGL() {
                const btn = document.getElementById('btn');
                const canvas = document.getElementById('btn-gl');
                const gl = canvas.getContext('webgl', { alpha: false, antialias: true });
                if (!gl) { 
                    btn.style.background = '#062630';
                    btn.style.boxShadow = '0 0 0 2px #00f2fe, 0 0 24px rgba(0, 242, 254, .5)';
                    return; 
                }

                const FS_BTN = [
                    'precision highp float;',
                    'uniform vec2 u_res;',
                    'uniform float u_time;',
                    'uniform float u_arcs;',
                    'uniform float u_flash;',
                    'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}',
                    'float noise(vec2 p){',
                    '  vec2 i=floor(p), f=fract(p);',
                    '  vec2 u=f*f*(3.0-2.0*f);',
                    '  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),',
                    '             mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);',
                    '}',
                    'float fbm(vec2 p){',
                    '  float v=0.0; float a=0.5;',
                    '  for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.05+vec2(9.7,3.1); a*=0.5; }',
                    '  return v;',
                    '}',
                    'float sdRBox(vec2 p, vec2 b, float r){',
                    '  vec2 q = abs(p) - b + r;',
                    '  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;',
                    '}',
                    'void main(){',
                    '  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;',
                    '  float ar = u_res.x / u_res.y;',
                    '  vec2 hs = vec2(ar * 0.5 - 0.2, 0.5 - 0.2);',
                    '  float d = sdRBox(p, hs, 0.14);',
                    '  float t = u_time;',
                    '  float hover = clamp(u_arcs / 6.0, 0.0, 1.0);',
                    '  vec3 col = vec3(0.039, 0.039, 0.039);',
                    '  float plate = 1.0 - smoothstep(-0.004, 0.004, d);',
                    '  vec3 plateCol = vec3(0.04, 0.05, 0.055);',
                    '  plateCol += vec3(0.014, 0.022, 0.035) * fbm(p * 9.0);',
                    '  plateCol += vec3(0.0, 0.25, 0.3) * exp(d * 9.0) * (0.25 + hover * 0.6);',
                    '  col = mix(col, plateCol, plate);',
                    '  col *= 1.0 + 0.5 * exp(-max(d, 0.0) * 16.0) * (1.0 - plate);',
                    '  float a = atan(p.y, p.x);',
                    '  vec3 arcCol = vec3(0.0);',
                    '  for (int i = 0; i < 6; i++) {',
                    '    float fi = float(i);',
                    '    float w = clamp(u_arcs - fi, 0.0, 1.0);',
                    '    float n1 = fbm(vec2(a * 2.4 + fi * 11.3, t * (1.6 + fi * 0.27) + fi * 53.1));',
                    '    float off = (n1 - 0.5) * (0.11 + u_flash * 0.1);',
                    '    float seg = smoothstep(0.35, 0.75, noise(vec2(a * 1.8 + fi * 7.7, t * (0.9 + fi * 0.13) + fi * 19.0)));',
                    '    seg = 0.3 + 0.7 * seg;',
                    '    float g = 0.0042 / (abs(d + off) + 0.006);',
                    // Remixed with bright cyan/teal and emerald glow profile
                    '    arcCol += (vec3(0.0, 0.75, 0.9) * g + vec3(0.6, 1.0, 0.95) * g * g * 0.55) * w * seg;',
                    '  }',
                    '  float outerMask = 1.0 - smoothstep(0.04, 0.15, d);',
                    '  col += arcCol * (0.6 + 0.4 * hover) * outerMask;',
                    '  float ring = 0.006 / (abs(d) + 0.006);',
                    '  col += vec3(0.8, 0.98, 1.0) * ring * u_flash * 1.5 * outerMask;',
                    '  col += vec3(0.7, 0.95, 1.0) * u_flash * 0.16 * outerMask;',
                    '  gl_FragColor = vec4(col, 1.0);',
                    '}'
                ].join('\\n');

                const prog = createProgram(gl, VS, FS_BTN);
                gl.useProgram(prog);

                const buf = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
                const locP = gl.getAttribLocation(prog, 'p');
                gl.enableVertexAttribArray(locP);
                gl.vertexAttribPointer(locP, 2, gl.FLOAT, false, 0, 0);

                const uRes = gl.getUniformLocation(prog, 'u_res');
                const uTime = gl.getUniformLocation(prog, 'u_time');
                const uArcs = gl.getUniformLocation(prog, 'u_arcs');
                const uFlash = gl.getUniformLocation(prog, 'u_flash');

                function resize() {
                    const dpr = Math.min(window.devicePixelRatio || 1, 2);
                    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
                    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
                    if (canvas.width !== w || canvas.height !== h) {
                        canvas.width = w; canvas.height = h;
                        gl.viewport(0, 0, w, h);
                    }
                }
                window.addEventListener('resize', resize);
                resize();

                let arcs = 2.4, arcsTarget = 2.4, flash = 0, crawl = 0;
                let last = performance.now();

                btn.addEventListener('mouseenter', () => arcsTarget = 5.8);
                btn.addEventListener('mouseleave', () => arcsTarget = 2.4);
                btn.addEventListener('focus', () => arcsTarget = 5.8);
                btn.addEventListener('blur', () => arcsTarget = 2.4);
                btn.addEventListener('click', () => flash = 1);

                function frame(now) {
                    const dt = Math.min(0.05, (now - last) / 1000);
                    last = now;
                    arcs += (arcsTarget - arcs) * Math.min(1, dt * 5);
                    flash *= Math.exp(-3.6 * dt);
                    crawl += dt * (0.6 + (arcs / 6) * 1.1 + flash * 2.0);
                    resize();
                    gl.uniform2f(uRes, canvas.width, canvas.height);
                    gl.uniform1f(uTime, reduced ? 3.0 : crawl);
                    gl.uniform1f(uArcs, arcs);
                    gl.uniform1f(uFlash, flash);
                    gl.drawArrays(gl.TRIANGLES, 0, 3);
                    requestAnimationFrame(frame);
                }
                requestAnimationFrame(frame);
            }

            initBackgroundGL();
            initButtonGL();
        })();
    <\/script>
</body>
</html>`,fe="<!DOCTYPE html><html><head></head><body></body></html>",pe="<!DOCTYPE html><html><head></head><body></body></html>",ge="<!DOCTYPE html><html><head></head><body></body></html>",me=`<svg viewBox="0 0 512 512" aria-hidden="true">
  <defs>
    <mask id="threeui-intro-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
      <rect width="512" height="512" fill="#000"/>
      <circle cx="256" cy="256" r="208" fill="#fff"/>
      <g fill="none" stroke="#000" stroke-linecap="round" stroke-width="28">
        <path d="M36 178C112 252 184 264 260 196C336 128 404 114 482 180"/>
        <path d="M36 292C112 366 184 378 260 310C336 242 404 228 482 294"/>
      </g>
    </mask>
  </defs>
  <rect width="512" height="512" fill="#f5f5f7" mask="url(#threeui-intro-cut)"/>
</svg>`,ve=`<svg width="1600" height="300" viewBox="0 0 1600 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <text x="800" y="235" text-anchor="middle" fill="#F4F4F0" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="240" font-weight="900" letter-spacing="-8">SHADERS</text>
</svg>`,b={mode:"dark",hue:0,saturation:1,brightness:1},C={"rising-diagonal":{title:"Twelve Works in Slow Orbit",headline:["TWELVE WORKS","IN SLOW ORBIT"],headlineWidths:[1846,2e3],axis:25.5,phase:93,direction:1,field:"matte",palette:["#e9e5dd","#20232a","#c25a43","#2f5b4e","#d6cfc2","#3a4763","#dda45c","#14161a","#a7b3a4","#f3f1ec","#5a6670","#8c4b3f"],ink:{dark:["#8d949c","#ffffff","#20232a"],light:["#6b7280","#111827","#e9e5dd"]},type:{font:"sans",weight:"400",headlineSize:1.15,tracking:.1},motion:{spring:!0,ease:.42}},"falling-diagonal":{title:"Signal Lost, Image Holding",headline:["SIGNAL LOST","IMAGE HOLDING"],headlineWidths:[1622,1917],axis:-25.5,phase:87,direction:-1,field:"glitch",palette:["#0b0b12","#ff2f6d","#00e6ff","#13f28a","#f2f2f8","#7a1bff","#101018","#ff7a1a","#141a2e","#e01f52","#1a1a26","#0ac2d8"],ink:{dark:["#ff2f6d","#f2f2f8","#0b0b12"],light:["#c81049","#111827","#f2f2f8"]},type:{font:"sans",weight:"700",headlineSize:1.2,tracking:0},motion:{spring:!1,ease:.12}},"horizontal-sweep":{title:"Prints from the Flat Files",headline:["PRINTS FROM","THE FLAT FILES"],headlineWidths:[1506,1917],axis:0,phase:90,direction:1,field:"riso",palette:["#e0b64a","#b1512a","#6d7638","#ecdfc2","#2f6b66","#8a3a2b","#d69b3e","#3c4630","#c06e3a","#e6d3a8","#546d76","#7a4726"],ink:{dark:["#e0b64a","#f4e9d2","#6d2a16"],light:["#8a3a2b","#2b2018","#e0b64a"]},type:{font:"oldstyle",weight:"700",headlineSize:1.2,tracking:.03},motion:{spring:!1,ease:.9}},"vertical-loop":{title:"One Wall, Twelve Plates",headline:["ONE WALL","TWELVE PLATES"],headlineWidths:[1132,1840],axis:90,phase:0,direction:-1,field:"halftone",palette:["#12110f","#f2efe8","#1c1b18","#e4e0d7","#2b2a26","#d6d1c6","#0a0a09","#faf8f3","#1f1e1a","#eae6dd","#161513","#c0402c"],ink:{dark:["#c0402c","#f2efe8","#12110f"],light:["#c0402c","#12110f","#e4e0d7"]},type:{font:"didone",weight:"400",headlineSize:1.25,tracking:.06},motion:{spring:!1,ease:.55}}},P={serif:'"Times New Roman",Times,"Liberation Serif","Nimbus Roman",serif',didone:'Didot,"Bodoni 72","Bodoni MT","Playfair Display",Georgia,serif',oldstyle:'"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif',sans:'"Helvetica Neue",Helvetica,"Inter",Arial,system-ui,sans-serif'},be=["400","700"],L={...b,variant:"rising-diagonal"};function xe(n,e){const t=e==="light"?"#f4f7fb":"#111318",i=e==="light"?["#60a5fa","#3b82f6","#2563eb"]:["#2563eb","#1d4ed8","#1e40af"];return n.replace("<title>Uploading — glowing border microinteraction</title>","<title>Thinking — glowing border microinteraction</title>").replace("<style>",`<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300&display=swap" rel="stylesheet">
<style>`).replaceAll("#1d1d1d",t).replace("var word = 'Uploading'","var word = 'Thinking'").replace(`var FONT = '300 100px -apple-system, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Inter, system-ui, "Segoe UI", Roboto, sans-serif';`,`var FONT = '300 100px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';`).replace(`      if(glyphs[i].ch === 'g') doubleStoreyG(c);
      else{`,"      {").replace("grd.addColorStop(0, '#2e3242');",`grd.addColorStop(0, '${i[0]}');`).replace("grd.addColorStop(0.55, '#2b2f3c');",`grd.addColorStop(0.55, '${i[1]}');`).replace("grd.addColorStop(1, '#272c36');",`grd.addColorStop(1, '${i[2]}');`).replaceAll("rgb(83,92,135)","rgb(219,234,254)").replaceAll("rgb(97,106,150)","rgb(239,246,255)").replace("rgb(133,141,189)","rgb(255,255,255)").replace("  var CX = 1024 - 22, CY = 1024 + 11.5;   /* button centre in the source recording */",`  var SCL = 0.49;                          /* hero button -> normal button */
  var CX = (1024 - 22)/SCL, CY = (1024 + 11.5)/SCL;`).replace("    k = S*dpr/REF;","    k = S*dpr/REF*SCL;").replace("  var PW = 976, PH = 345, PR = 100;","  var PW = 1010, PH = 345, PR = 100;").replace("  var TXT_W = 778, TXT_CAP = 120, TXT_BASE = 1093;",`  var TXT_W = 450, TXT_CAP = 79, TXT_BASE = CY + 38;
  var BR_R = 13, BR_SP = 40, BR_GAP = 78;   /* braille dot radius, cell pitch, gap to label */
  var BR_W = BR_SP + 2*BR_R, BR_SHIFT = (BR_W + BR_GAP)/2;
  /* the terminal 'dots' spinner, as raised-dot masks: bit 0..2 = left column top->bottom, 3..5 = right */
  var BRAILLE = [0x0B,0x19,0x39,0x38,0x3C,0x34,0x26,0x27,0x07,0x0F];
  var BR_STEPS = 30;                        /* three full spinner cycles per lap, so the loop still joins */`).replace("  var glyphs = [], fontPx = 169, tracking = 0, textX = 0;","  var glyphs = [], fontPx = 169, tracking = 0, textX = 0, brailleX = 0;").replace("    textX = (CX + 4)*k - TXT_W*k/2 + lead;",`    textX = (CX + 4)*k - TXT_W*k/2 + lead + BR_SHIFT*k;
    brailleX = (CX + 4)*k - (BR_W + BR_GAP + TXT_W)*k/2 + BR_R*k;`).replace("  function label(c, ph){",`  /* the spinner is drawn as dots rather than braille glyphs, so it never depends
     on a system face carrying the U+28xx block */
  function braille(c, ph){
    var mask = BRAILLE[Math.floor(ph*BR_STEPS) % BRAILLE.length];
    var cy = (CY - 1.5)*k, r = BR_R*k, sp = BR_SP*k;
    for(var b=0;b<6;b++){
      var on = (mask >> b) & 1;
      c.beginPath();
      c.arc(brailleX + (b < 3 ? 0 : sp), cy + ((b % 3) - 1)*sp, on ? r : r*0.7, 0, Math.PI*2);
      c.fillStyle = on ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.16)';
      c.fill();
    }
  }

  function label(c, ph){`).replace(`    plate(ctx);
    label(ctx, ph);`,`    plate(ctx);
    braille(ctx, ph);
    label(ctx, ph);`)}function we(n,e){return e!=="dark"?n:n.replace("from-black/10 via-black/20 to-black/10","from-white/[0.16] via-white/[0.07] to-white/[0.16]").replace("text-black/60","text-white/70").replace("text-slate-600","text-slate-200").replace('stroke="#666"','stroke="#e5e7eb"').replace("hover:bg-slate-50","hover:bg-white/10")}function ye(n,e){return e!=="light"?n:n.replaceAll("#fffa","#111a").replaceAll("#fffd","#111d").replaceAll("#fff4","#1114").replaceAll("#fff3","#1113").replaceAll("#fff2","#1112")}const ke=/function buildLabels\(\)\{[\s\S]*?\n\}\n\nfunction resize/,Se=/function buildHead\(\)\{[\s\S]*?\n\}\n\nfunction buildLabels/,Ee=/function lin\(x,x0,y0,x1,y1,stops\)\{[\s\S]*?\n\];\n\nfunction roundRectPath/,Re=/    \/\* film grain \*\/\n[\s\S]*?\n    x\.restore\(\);\n    front\.push\(c\);/,_e=/var t0 = performance\.now\(\), tNow = 0, playing = true;[\s\S]*?window\.__play = function\(\)\{ t0 = performance\.now\(\) - tNow\*1000; playing = true; \};/,Ae=`function buildHead(){
  headLayer = mkc(Math.max(1,W), Math.max(1,H));
  var x = headLayer.getContext('2d');
  if (x.letterSpacing !== undefined) x.letterSpacing = (HEAD_TRACK*HEAD_CAP*HEAD_SIZE*K).toFixed(2)+'px';
  if (HEAD_STYLE === 'riso'){
    var off = 0.055*HEAD_CAP*HEAD_SIZE*K;
    headPass(x, off, off, HEAD_SHADOW);
  }
  headPass(x, 0, 0, null);
  if (HEAD_STYLE === 'glitch') headGlitch(x);
}

/* one setting of the two headline lines, optionally displaced and forced to
   a single colour, so a style can stack passes into its treatment */
function headPass(x, dx, dy, tint){
  for (var i=0;i<HEAD.length;i++){
    var h = HEAD[i];
    fitText(x, h.s, SANS, HEAD_WEIGHT, HEAD_CAP*HEAD_SIZE*K, d2sx(1481) + dx,
            d2sy(HEAD_MID + (h.top - HEAD_MID)*HEAD_SIZE) + dy, h.w*HEAD_SIZE*K, tint || h.fill);
  }
}

/* the headline as a picture that lost its signal: a few rows slip sideways
   and two colour channels sit out of register behind the letterforms */
function headGlitch(x){
  var w = headLayer.width, h = headLayer.height, i;
  var snap = mkc(w,h);
  snap.getContext('2d').drawImage(headLayer,0,0);
  var r = rng(0x2E51);
  var top = d2sy(HEAD_MID) - HEAD_CAP*HEAD_SIZE*K*2.1, span = HEAD_CAP*HEAD_SIZE*K*4.2;
  for (i=0;i<7;i++){
    var sy = Math.round(top + r()*span);
    var sh = Math.round((0.03 + r()*0.11)*HEAD_CAP*HEAD_SIZE*K);
    var dx = Math.round((r()-0.5)*0.08*w);
    x.clearRect(0,sy,w,sh);
    x.drawImage(snap, 0,sy,w,sh, dx,sy,w,sh);
  }
  var ghost = function(color){
    var g = mkc(w,h), gx = g.getContext('2d');
    gx.drawImage(snap,0,0);
    gx.globalCompositeOperation = 'source-in';
    gx.fillStyle = color; gx.fillRect(0,0,w,h);
    return g;
  };
  var off = 0.05*HEAD_CAP*HEAD_SIZE*K;
  x.save();
  /* the ghosts go under the letterforms, so the headline stays readable */
  x.globalCompositeOperation = 'destination-over';
  x.globalAlpha = 0.9;
  x.drawImage(ghost(HEAD_GHOST[0]), -off, 0);
  x.drawImage(ghost(HEAD_GHOST[1]), off, 0);
  x.restore();
}

function buildLabels`,Te=`function fill(x,style){ x.fillStyle = style; x.fillRect(0,0,TS,TS); }

function rgbOf(hex){
  var v = parseInt(hex.slice(1),16);
  return [(v>>16)&255,(v>>8)&255,v&255];
}
function mixRGB(a,b,t){
  return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];
}
function cssRGB(c){
  return 'rgb('+(c[0]|0)+','+(c[1]|0)+','+(c[2]|0)+')';
}
function luma(c){ return (c[0]*0.299 + c[1]*0.587 + c[2]*0.114)/255; }

/* value noise on a 64x64 lattice, smoothstep-interpolated and wrapped */
function noiseField(seed){
  var g = new Float32Array(4096), r = rng(seed), i;
  for (i=0;i<4096;i++) g[i] = r();
  return function(x,y){
    var x0 = Math.floor(x), y0 = Math.floor(y);
    var fx = x - x0, fy = y - y0;
    fx = fx*fx*(3-2*fx); fy = fy*fy*(3-2*fy);
    var ra = (y0 & 63)*64, rb = ((y0+1) & 63)*64, ca = x0 & 63, cb = (x0+1) & 63;
    var a = g[ra+ca], b = g[ra+cb], c = g[rb+ca], d = g[rb+cb];
    return a + (b-a)*fx + (c-a)*fy + (a-b-c+d)*fx*fy;
  };
}
function fbm(n,x,y,oct){
  var v = 0, amp = 0.5, f = 1, tot = 0, i;
  for (i=0;i<oct;i++){ v += amp*n(x*f,y*f); tot += amp; amp *= 0.5; f *= 2; }
  return v/tot;
}
function grain(x, alpha){
  x.save();
  x.globalCompositeOperation = 'overlay';
  x.globalAlpha = alpha;
  x.fillStyle = x.createPattern(grainTile,'repeat');
  x.fillRect(0,0,TS,TS);
  x.restore();
}

/* paint a low-resolution field, then blow it up over the whole tile: smooth
   for a matte plate, nearest wherever the noise has to keep its edges */
function fieldBuffer(N, shade){
  var buf = mkc(N,N), bx = buf.getContext('2d'), d = bx.createImageData(N,N), px, py, o, c;
  for (py=0;py<N;py++){
    for (px=0;px<N;px++){
      c = shade((px+0.5)/N, (py+0.5)/N, px, py);
      o = (py*N+px)*4;
      d.data[o] = c[0]|0; d.data[o+1] = c[1]|0; d.data[o+2] = c[2]|0;
      d.data[o+3] = c.length > 3 ? c[3]|0 : 255;
    }
  }
  bx.putImageData(d,0,0);
  return buf;
}
function blowUp(x, buf, smooth, alpha){
  x.save();
  x.imageSmoothingEnabled = smooth;
  if (alpha !== undefined) x.globalAlpha = alpha;
  x.drawImage(buf, 0, 0, TS, TS);
  x.restore();
}

/* matte — a museum plate: flat colour, one slow rise of noise across it,
   and grain fine enough to read as the surface rather than as an effect */
function paintMatte(x, base, i){
  var n = noiseField(0x2C41 + i*9176);
  var hi = mixRGB(base,[255,255,255],0.13), lo = mixRGB(base,[0,0,0],0.15);
  blowUp(x, fieldBuffer(160, function(u,v){
    var s = 0.5 + (fbm(n, u*6.5, v*6.5, 5) - 0.5)*1.9 + (v - 0.5)*0.07;
    s = s < 0 ? 0 : s > 1 ? 1 : s;
    return s < 0.5 ? mixRGB(lo, base, s*2) : mixRGB(base, hi, (s-0.5)*2);
  }), true);
  grain(x, 0.1);
}

/* glitch — a plate that lost the signal: flat blocks torn out of the
   neighbouring colours, rows slipped sideways, two channels off register */
function paintGlitch(x, base, i){
  var r = rng(0x51B7 + i*30011), k;
  fill(x, cssRGB(base));
  for (k=0;k<4;k++){
    x.fillStyle = cssRGB(rgbOf(PLATES[(i + 1 + ((r()*5)|0)) % PLATES.length]));
    x.fillRect(Math.round((r()-0.2)*TS), Math.round(r()*TS),
               Math.round((0.2 + r()*0.55)*TS), Math.round((0.04 + r()*0.2)*TS));
  }
  blowUp(x, fieldBuffer(64, function(){
    var w = r() < 0.5 ? 250 : 6;
    return [w,w,w, r() < 0.2 ? 200 : 0];
  }), false, 0.5);
  /* rows slip sideways, each one wrapped so no edge is ever left empty */
  var snap = mkc(TS,TS);
  snap.getContext('2d').drawImage(x.canvas,0,0);
  for (k=0;k<11;k++){
    var y0 = Math.round(r()*TS), h = Math.round((0.01 + r()*0.06)*TS);
    var dx = Math.round((r()-0.5)*0.36*TS);
    x.clearRect(0,y0,TS,h);
    x.drawImage(snap, 0,y0,TS,h, dx,y0,TS,h);
    x.drawImage(snap, 0,y0,TS,h, dx + (dx < 0 ? TS : -TS),y0,TS,h);
  }
  var channel = function(color){
    var g = mkc(TS,TS), gx = g.getContext('2d');
    gx.drawImage(x.canvas,0,0);
    gx.globalCompositeOperation = 'multiply';
    gx.fillStyle = color; gx.fillRect(0,0,TS,TS);
    return g;
  };
  var red = channel('#ff3050'), cyan = channel('#30e0ff');
  x.save();
  x.globalCompositeOperation = 'lighter';
  x.globalAlpha = 0.3;
  x.drawImage(red, -0.022*TS, 0);
  x.drawImage(cyan, 0.022*TS, 0);
  x.restore();
  x.save();
  x.fillStyle = 'rgba(0,0,0,0.22)';
  for (k=0;k<TS;k+=4) x.fillRect(0,k,TS,1);
  x.restore();
  grain(x, 0.24);
}

/* riso — the printed plate: a lit corner and a noise field quantised to
   three tones through an ordered dither, then scanlines and heavy grain */
var BAYER = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function paintRiso(x, base, i){
  var n = noiseField(0x77A3 + i*15731), k;
  var lo = mixRGB(base,[24,14,6],0.66), hi = mixRGB(base,[255,238,196],0.5);
  var cx = 0.22 + (i % 3)*0.28, cy = 0.2 + ((i/3)|0)*0.2;
  blowUp(x, fieldBuffer(100, function(u,v,px,py){
    var d = Math.sqrt((u-cx)*(u-cx) + (v-cy)*(v-cy));
    var s = (1 - d*1.25)*0.72 + fbm(n, u*3.2, v*3.2, 3)*0.52 - 0.1;
    var band = Math.floor(s*2.4 + (BAYER[(py & 3)*4 + (px & 3)] + 0.5)/16);
    return band <= 0 ? lo : band === 1 ? base : hi;
  }), false);
  x.save();
  x.fillStyle = 'rgba(28,14,4,0.18)';
  for (k=0;k<TS;k+=6) x.fillRect(0,k,TS,2);
  x.restore();
  grain(x, 0.22);
}

/* halftone — one ink on one stock, shaded only by the size of the dots on
   a screen rotated a few degrees further for every tile */
function paintHalftone(x, base, i){
  var n = noiseField(0x3F19 + i*21467), gx, gy;
  fill(x, cssRGB(base));
  var dot = luma(base) > 0.5 ? mixRGB(base,[0,0,0],0.88) : mixRGB(base,[255,255,255],0.9);
  var pitch = TS/30, a = (17 + (i % 4)*9)*Math.PI/180;
  var ca = Math.cos(a), sa = Math.sin(a), span = Math.ceil(TS/pitch);
  x.save();
  x.fillStyle = cssRGB(dot);
  x.translate(TS/2, TS/2);
  x.rotate(a);
  for (gy=-span;gy<=span;gy++){
    for (gx=-span;gx<=span;gx++){
      var wx = gx*pitch, wy = gy*pitch;
      var u = (wx*ca - wy*sa)/TS + 0.5, v = (wx*sa + wy*ca)/TS + 0.5;
      if (u < -0.1 || u > 1.1 || v < -0.1 || v > 1.1) continue;
      var s = fbm(n, u*2.7, v*2.7, 4)*0.95 + (0.55 - v)*0.5;
      var rad = pitch*0.66*(s < 0 ? 0 : s > 1 ? 1 : s);
      if (rad < 0.4) continue;
      x.beginPath(); x.arc(wx, wy, rad, 0, Math.PI*2); x.fill();
    }
  }
  x.restore();
  grain(x, 0.12);
}

var PAINTERS = { matte: paintMatte, glitch: paintGlitch, riso: paintRiso, halftone: paintHalftone };
var ART = (function(){
  var painter = PAINTERS[FIELD] || paintMatte, list = [], i;
  for (i=0;i<PLATES.length;i++){
    list.push((function(index){
      return function(x){ painter(x, rgbOf(PLATES[index]), index); };
    })(i));
  }
  return list;
})();

function roundRectPath`,Me=`var tNow = 0, playing = true, hovering = false, rate = 0, vel = 0, settled = false, last = performance.now();

function setHover(state){
  if (hovering === state) return;
  hovering = state; settled = false;
  /* the host cannot see the pointer arrive over this frame, so tell it — it is
     the one that will see the pointer leave again */
  if (state && window.parent !== window){
    try { window.parent.postMessage({ threeuiPointerOver: true }, '*'); } catch (error) {}
  }
}
var root = document.documentElement;
root.addEventListener('pointerenter', function(){ setHover(true); });
root.addEventListener('pointermove',  function(){ setHover(true); });
root.addEventListener('pointerdown',  function(){ setHover(true); });
root.addEventListener('pointerleave', function(){ setHover(false); });
root.addEventListener('pointercancel',function(){ setHover(false); });
window.addEventListener('blur', function(){ setHover(false); });

function frame(now){
  var dt = Math.min(0.05, Math.max(0, (now - last)/1000));
  last = now;
  if (playing){
    if (SPRING){
      vel += (((hovering ? 1 : 0) - rate)*SPRING_K - vel*SPRING_D)*dt;
      rate += vel*dt;
    } else {
      rate += ((hovering ? 1 : 0) - rate) * (1 - Math.exp(-dt/EASE));
    }
    if (Math.abs(rate) > 0.0004 || Math.abs(vel) > 0.0004){
      tNow = ((tNow + dt*rate) % DUR + DUR) % DUR;
      render(tNow); settled = false;
    } else if (!settled){
      rate = 0; vel = 0; render(tNow); settled = true;
    }
  }
  requestAnimationFrame(frame);
}

/* font family, weight, and headline size arrive live so a control tick never
   rebuilds the document and repaints the twelve tile textures */
window.addEventListener('message', function(event){
  var runtime = event.data && event.data.threeuiRuntime;
  if (!runtime) return;
  if (typeof runtime.font === 'string') SANS = runtime.font;
  if (typeof runtime.weight === 'string') HEAD_WEIGHT = runtime.weight;
  if (typeof runtime.headlineSize === 'number' && runtime.headlineSize > 0){
    HEAD_SIZE = Math.max(0.6, Math.min(1.8, runtime.headlineSize));
  }
  if (typeof runtime.hover === 'number') setHover(runtime.hover > 0);
  buildHead(); settled = false; render(tNow);
});

window.addEventListener('resize', function(){ resize(); settled = false; render(tNow); });
resize();
render(tNow);
requestAnimationFrame(frame);

window.__DUR = DUR;
window.__seek = function(t){
  tNow = ((t % DUR) + DUR) % DUR;
  playing = false;
  render(tNow);
};
window.__play = function(){ last = performance.now(); playing = true; settled = false; };`;function W(n,e,t){const i=e==="light"?"#f4f7fb":"#000000",s=e==="light"?t.ink.light:t.ink.dark,o=P[t.type.font];return n.replace("<title>New Grainient Collection Added — motion</title>",`<title>${t.title} — motion</title>`).replace("html,body{margin:0;height:100%;background:#000;overflow:hidden}",`html,body{margin:0;height:100%;background:${i};overflow:hidden}`).replace("axis: 25.5,",`axis: ${t.axis},`).replace("phase: 93",`phase: ${t.phase}`).replace("  tile: 346,            /* tile side in ring units (R = a)               */",`  tile: 346,            /* tile width in ring units (R = a)              */
  aspect: 0.75,         /* tile height / width — a 4:3 landscape crop    */`).replace("  roundRectPath(ctx, TS, TS, TS*RING.radius);","  roundRectPath(ctx, TS, TS*RING.aspect, TS*RING.aspect*RING.radius);").replace(`var CAP = 142;          /* headline cap height */
var SMALL = 22;         /* small-label cap height */`,`var HEAD_CAP = 142;     /* authored headline cap height */
var HEAD_MID = 1093;    /* authored vertical centre of the two-line block */
var HEAD_SIZE = ${t.type.headlineSize};   /* headline size multiplier */
var HEAD_WEIGHT = '${t.type.weight}'; /* headline weight */
var HEAD_TRACK = ${t.type.tracking};   /* headline tracking, in cap heights */
var HEAD_STYLE = '${t.field}';
var HEAD_SHADOW = '${s[2]}';  /* riso: the plate under the ink */
var HEAD_GHOST = ['#ff2f6d','#00e6ff'];  /* glitch: the two channel ghosts */
var PLATES = ${JSON.stringify(t.palette)};
var FIELD = '${t.field}';       /* which painter shades the plates */
var EASE = ${t.motion.ease};        /* seconds for the orbit to reach hover speed */
var SPRING = ${t.motion.spring?1:0}, SPRING_K = 26, SPRING_D = 5.7;`).replace(`var SANS = '"Helvetica Neue",Helvetica,"Inter",Arial,system-ui,sans-serif';`,`var SANS = '${o}';`).replace("{ s:'NEW GRAINIENT',    top:930,  w:1370, fill:'#d0d0d0' }",`{ s:'${t.headline[0]}', top:930,  w:${t.headlineWidths[0]}, fill:'${s[0]}' }`).replace("{ s:'COLLECTION ADDED', top:1114, w:1775, fill:'#ffffff' }",`{ s:'${t.headline[1]}', top:1114, w:${t.headlineWidths[1]}, fill:'${s[1]}' }`).replace(' * Tile artwork — eleven grainy gradient "wallpapers"'," * Tile artwork — twelve flat plates under a procedural noise field").replace(Ee,Te).replace(Re,`    /* each field painter lays its own grain, at the weight its style wants */
    front.push(c);`).replace("y.fillStyle = 'rgba(6,8,18,0.75)';","y.fillStyle = 'rgba(10,12,24,0.45)';").replace(Se,Ae).replace(ke,`function buildLabels(){
  /* the launch poster's corner marks and flanking notes are dropped; the
     layer stays so the compositing order below is untouched */
  labelLayer = mkc(1,1);
}

function resize`).replace("var spin = (t/DUR)*Math.PI*2;",`var spin = (t/DUR)*Math.PI*2*${t.direction};`).replace(`ctx.fillStyle = '#000';
  ctx.fillRect(0,0,W,H);`,`ctx.fillStyle = '${i}';
  ctx.fillRect(0,0,W,H);`).replace(_e,Me)}const Ce=/  var GA=Math\.PI\*\(3-Math\.sqrt\(5\)\), SP=Math\.sqrt\(4\*Math\.PI\/N\);[\s\S]*?(?=  var A=\{dir:)/,Pe=/  var W=\[\];[\s\S]*?(?=  var tmpA=)/,Le=/'  vec3 dir=a_dir;',[\s\S]*?'  float face=smoothstep\(-0\.10,0\.06,n\.z\);',/,Be=/    var ax=0\.22\*Math\.sin\(th\)\+0\.06\*Math\.sin\(th\*2\+1\.1\);\n    var ay=0\.30\*Math\.sin\(th\+2\.2\)\+0\.08\*Math\.cos\(th\*2\);\n    var az=0\.10\*Math\.cos\(th\+0\.6\);/,Ie="      var flick=0.76+0.24*Math.sin(th*2.0+w.fl);",De="      var flick=0.86+0.14*Math.sin(th*2.0+w.fl);",Fe={title:"Recursive Erosion — Lightning Sphere Motion Study",screenReaderCopy:"A four-second looping study of a generative particle sphere: a dense lattice of small orange dots over a transparent backdrop, its surface crumpling and eroding into holes while jagged lightning arcs strike across it, and the shell leaning out toward the pointer wherever the cursor rests, each dot fringed with red and blue chromatic aberration.",duration:"  var DUR=3.99;                 /* reference loop length */",lattice:"  var N=7000;                   /* lattice points */",ropes:"  var WORMS=8, TAIL=12, WN=WORMS*TAIL;",pearls:"  var PEARL=44, TN=WORMS*PEARL, TSTRIDE=5;",scale:"    gl.uniform2f(U.u_scale,0.672*aspX,0.672*aspY);",dotSize:"    gl.uniform1f(U.u_px,Math.max(1.0,size/1080*6.4*PSIZE));",threshold:"    gl.uniform1f(U.u_thr,0.19+0.04*Math.sin(th*2+0.8));",wormFalloff:"  '      boost+=u_worm[i].w*exp(-dot(d,d)*160.0);',",dotProfile:"  '  v_k=(u_pass>0.5)?3.0:(u_trail>0.5?0.0:2.1);',",paths:`  var W=[], TWO=6.283185307179586;
  for(i=0;i<WORMS;i++){
    /* each strike still rides a tilted great circle centred on the viewer-facing
       side, so a steady handful of arcs is always on screen */
    var cz=0.06+R0()*0.86, ca0=R0()*TWO, cr=Math.sqrt(Math.max(0,1-cz*cz));
    var c=[Math.cos(ca0)*cr,Math.sin(ca0)*cr,cz];
    var t0=Math.abs(c[1])<0.85?[0,1,0]:[1,0,0];
    var d=t0[0]*c[0]+t0[1]*c[1]+t0[2]*c[2];
    var u=[t0[0]-c[0]*d,t0[1]-c[1]*d,t0[2]-c[2]*d];
    var lu=Math.hypot(u[0],u[1],u[2]); u=[u[0]/lu,u[1]/lu,u[2]/lu];
    var v=[c[1]*u[2]-c[2]*u[1],c[2]*u[0]-c[0]*u[2],c[0]*u[1]-c[1]*u[0]];
    var rho=0.46+R0()*0.42, sr=Math.sin(rho), crho=Math.cos(rho);
    var mm=1+Math.floor(R0()*2);
    /* the kink pattern has to close over the loop, so a whole number of kinks
       per revolution is chosen first and the frequency derived from it */
    var kper=Math.max(6,Math.round(4.6*TWO*mm));
    W.push({c:c,u:u,v:v,sr:sr,cr:crho,m:mm,ph:R0()*TWO,
            str:1.35+R0()*0.45,arc:(1.45+R0()*0.60)/sr,fl:R0()*TWO,
            seed:1+R0()*97,kper:kper,zq:kper/(TWO*mm),
            rate:2+Math.floor(R0()*4),ph0:R0(),
            /* one discharge: near-instant attack, exponential decay, and a
               stutter down the tail. That envelope is what reads as lightning
               instead of as a rope crawling steadily over the shell. */
            env:function(t){
              var f=(t/TWO)*this.rate+this.ph0; f-=Math.floor(f);
              var e=Math.exp(-f*4.4)*(0.58+0.42*Math.sin(f*88.0+this.fl));
              return e>0?e:0;
            }});
  }
  /* a fixed hash, so every kink of an arc stays put instead of boiling */
  function zig(seed,k){
    var x=Math.sin(seed*127.1+k*311.7)*43758.5453;
    return (x-Math.floor(x))*2-1;
  }
  /* a point on strike k's arc at angle ang, written into out[] — the great
     circle carries a piecewise-linear kink pattern, and that is what turns the
     authored smooth rope into a forked bolt */
  function onPath(w,ang,out){
    var s=ang*w.zq+w.seed, ki=Math.floor(s), f=s-ki;
    var e=f*f*(3-2*f), pp=w.kper;
    var k0=((ki%pp)+pp)%pp, k1=(((ki+1)%pp)+pp)%pp;
    var off=(zig(w.seed,k0)*(1-e)+zig(w.seed,k1)*e)*0.105;
    var tw=(zig(w.seed+7.3,k0)*(1-e)+zig(w.seed+7.3,k1)*e)*0.065;
    var a2=ang+tw, ca=Math.cos(a2), sa=Math.sin(a2), rr=w.sr+off;
    out[0]=w.c[0]*w.cr+(w.u[0]*ca+w.v[0]*sa)*rr;
    out[1]=w.c[1]*w.cr+(w.u[1]*ca+w.v[1]*sa)*rr;
    out[2]=w.c[2]*w.cr+(w.u[2]*ca+w.v[2]*sa)*rr;
  }
`,shape:`'  vec3 dir=a_dir;',
  '  vec2 c=vec2(cos(u_th),sin(u_th));',
  /* every noise lookup rides a closed circular path, so the morph is exactly
     periodic; the wavelength control scales all of them together */
  '  float iw=1.0/u_wave;',
  '  float n1=snoise(dir*(1.30*iw)+vec3(c*0.95,0.0));',
  '  float n2=snoise(dir*(2.70*iw)+vec3(0.0,c*0.80));',
  '  float n3=snoise(dir*(5.60*iw)+vec3(c.y*0.62,0.0,c.x*0.62));',
  '  float ridge=1.0-abs(n2);',
  '  float disp=0.54*n1+0.44*(ridge-0.5)+0.20*n3;',
  '  float R=1.0+0.305*disp;',
  /* recursive erosion: two scales of noise chew holes through the shell */
  '  float e=0.66*snoise(dir*(1.45*iw)+vec3(c*1.30,0.4))+0.34*snoise(dir*(3.10*iw)+vec3(0.3,c*1.05));',
  '  float alive=smoothstep(u_thr-0.05,u_thr+0.06,e+0.5);',
  '  vec3 n=u_rot*dir;',
  /* pointer attraction: the resting point is projected into the same clip space
     the pointer is reported in, then a gaussian around the cursor lifts the
     shell along its own radius and drags it toward the cursor at projection */
  '  vec3 rest=u_rot*(dir*R);',
  '  vec2 toP=u_ptr.xy-(rest.xy*(1.0/(1.0-0.14*rest.z))*u_scale+u_off);',
  '  float pull=u_ptr.z*exp(-dot(toP,toP)*22.0)*smoothstep(-0.30,0.22,n.z);',
  '  vec3 p=u_rot*(dir*(R+0.22*pull));',
  '  float persp=1.0/(1.0-0.14*p.z);',
  '  float face=smoothstep(-0.10,0.06,n.z);',`,palette:["  '  vec3 cDim=vec3(0.94,0.33,0.05);',","  '  vec3 cMid=vec3(1.00,0.56,0.16);',","  '  vec3 cHot=vec3(1.00,0.90,0.72);',"],tint:"  '  vec3 col=mix(cDim,cMid,a_rand.x*a_rand.x);',",rotation:`    var ax=0.22*Math.sin(th)+0.06*Math.sin(th*2+1.1);
    var ay=0.30*Math.sin(th+2.2)+0.08*Math.cos(th*2);
    var az=0.10*Math.cos(th+0.6);`,grain:"        d[i]=n; d[i+1]=n*0.74; d[i+2]=n*0.52; d[i+3]=255;",pointerBoost:"  '    boost=min(boost+pull*0.85,1.5);',",projection:"  '  gl_Position=vec4(p.xy*persp*u_scale+u_off+toP*(pull*0.26),0.0,1.0);',",flicker:"      var flick=w.env(th);",lightBackground:"#f4f3f1",darkBackground:"#0a0908"},ze={title:"Recursive Erosion — Branch Growth Motion Study",screenReaderCopy:"A looping study of a generative branch structure: a dendritic lattice of small amber dots over a transparent backdrop, its limbs swaying and eroding back from the tips while bright glowing pulses climb from the root out to each branch tip, each dot fringed with red and blue chromatic aberration.",duration:"  var DUR=9.0;                  /* reference loop length */",lattice:"  var N=4200;                   /* lattice points */",ropes:"  var WORMS=8, TAIL=12, WN=WORMS*TAIL;",pearls:"  var PEARL=40, TN=WORMS*PEARL, TSTRIDE=5;",scale:"    gl.uniform2f(U.u_scale,0.72*aspX,0.72*aspY);",dotSize:"    gl.uniform1f(U.u_px,Math.max(1.0,size/1080*7.6*PSIZE));",threshold:"    gl.uniform1f(U.u_thr,0.20+0.05*Math.sin(th*2+0.8));",wormFalloff:"  '      boost+=u_worm[i].w*exp(-dot(d,d)*450.0);',",dotProfile:"  '  v_k=(u_pass>0.5)?3.0:(u_trail>0.5?0.0:2.1);',",points:`  var SKEL=[], CHAIN=[];
  (function(){
    /* one recursive limb: walk it in short steps, then fork off children */
    function grow(px,py,pz,dx,dy,dz,len,rad,depth,chain){
      var steps=Math.max(2,Math.round(len*16));
      var sl=len/steps;
      for(var s=0;s<steps;s++){
        var nx=px+dx*sl, ny=py+dy*sl, nz=pz+dz*sl;
        SKEL.push([px,py,pz,nx,ny,nz,rad*(1-0.45*s/steps)]);
        chain.push([nx,ny,nz]);
        px=nx; py=ny; pz=nz;
        /* a gentle curl keeps the limbs from reading as straight spokes */
        dx+=(R0()*2-1)*0.20; dy+=(R0()*2-1)*0.11+0.02; dz+=(R0()*2-1)*0.20;
        var dl=1/Math.hypot(dx,dy,dz); dx*=dl; dy*=dl; dz*=dl;
      }
      if(depth>=5||len<0.060){ CHAIN.push(chain.slice()); return; }
      var forks=depth<3?3:2;
      for(var f=0;f<forks;f++){
        /* a wide fork angle is what makes the crown read as a canopy instead
           of a torch flame; the small upward bias only keeps it from drooping */
        var fa=R0()*6.283, sp=0.78+R0()*0.62;
        var bx=dx+Math.cos(fa)*sp, by=dy+0.06, bz=dz+Math.sin(fa)*sp;
        var bl=1/Math.hypot(bx,by,bz);
        grow(px,py,pz,bx*bl,by*bl,bz*bl,len*0.80,rad*0.63,depth+1,chain.slice());
      }
    }
    grow(0,-0.90,0,0,1,0,0.42,0.070,0,[[0,-0.90,0]]);
  })();
  /* the grown tree is recentred and normalized, so the crown fills the frame
     whatever the fork angles happened to do */
  var lo3=[1e9,1e9,1e9], hi3=[-1e9,-1e9,-1e9];
  for(var q=0;q<SKEL.length;q++){
    for(var ei=0;ei<6;ei++){
      var ax3=ei%3, vv3=SKEL[q][ei];
      if(vv3<lo3[ax3]) lo3[ax3]=vv3;
      if(vv3>hi3[ax3]) hi3[ax3]=vv3;
    }
  }
  var mid3=[(lo3[0]+hi3[0])*0.5,(lo3[1]+hi3[1])*0.5,(lo3[2]+hi3[2])*0.5];
  var NRM=1.92/Math.max(1e-6,hi3[1]-lo3[1]);
  for(q=0;q<SKEL.length;q++){
    var sg3=SKEL[q];
    for(ei=0;ei<6;ei++) sg3[ei]=(sg3[ei]-mid3[ei%3])*NRM;
    sg3[6]*=NRM;
  }
  for(q=0;q<CHAIN.length;q++){
    /* every chain shares the trunk nodes with its siblings, so each slot takes
       a fresh normalized point instead of being rescaled in place */
    var ch3=CHAIN[q];
    for(ei=0;ei<ch3.length;ei++) ch3[ei]=[(ch3[ei][0]-mid3[0])*NRM,(ch3[ei][1]-mid3[1])*NRM,(ch3[ei][2]-mid3[2])*NRM];
  }
  /* one cumulative table weighted by length times radius, so the grain lands
     by bark area — weighting by length alone starves the trunk, because the
     hundred-odd twigs carry most of the skeleton's total length */
  var CUM=new Float64Array(SKEL.length), TOT=0;
  for(q=0;q<SKEL.length;q++){
    TOT+=Math.hypot(SKEL[q][3]-SKEL[q][0],SKEL[q][4]-SKEL[q][1],SKEL[q][5]-SKEL[q][2])*SKEL[q][6];
    CUM[q]=TOT;
  }
  for(var i=0;i<N;i++){
    var pick=R0()*TOT, lo=0, hi=SKEL.length-1;
    while(lo<hi){ var mid=(lo+hi)>>1; if(CUM[mid]<pick) lo=mid+1; else hi=mid; }
    var sg=SKEL[lo], tt=R0();
    var bx0=sg[0]+(sg[3]-sg[0])*tt, by0=sg[1]+(sg[4]-sg[1])*tt, bz0=sg[2]+(sg[5]-sg[2])*tt;
    /* scatter inside the limb radius so each branch reads as bark, not a wire */
    var rr=sg[6]*Math.pow(R0(),0.55), ra=R0()*6.283, rp=Math.acos(2*R0()-1);
    dirs[i*3]=bx0+rr*Math.sin(rp)*Math.cos(ra);
    dirs[i*3+1]=by0+rr*Math.cos(rp);
    dirs[i*3+2]=bz0+rr*Math.sin(rp)*Math.sin(ra);
    rnds[i*2]=R0(); rnds[i*2+1]=R0();
  }
`,paths:`  var W=[];
  for(i=0;i<WORMS;i++){
    /* every rope owns one limb, entering it above the shared trunk so eight
       pulses do not pile onto the same few nodes at once */
    W.push({ch:CHAIN[Math.min(CHAIN.length-1,Math.floor(R0()*CHAIN.length))],
            u0:0.20+R0()*0.34,m:1+Math.floor(R0()*2),ph:R0()*6.283,
            str:0.72+R0()*0.26,arc:1.55+R0()*0.90,fl:R0()*6.283});
  }
  /* a point on rope k's limb at angle ang, written into out[] — the parameter
     folds back on itself, so the pulse runs out to the tip and returns without
     a seam and the tail bunches into a flare while it turns around */
  function onPath(w,ang,out){
    var f=ang/6.283185307179586; f-=Math.floor(f);
    var u=w.u0+(1-w.u0)*(1-Math.abs(1-2*f));
    var x=u*(w.ch.length-1), k=Math.floor(x), t=x-k;
    if(k>w.ch.length-2){ k=w.ch.length-2; t=1; }
    if(k<0){ k=0; t=0; }
    var a=w.ch[k], b=w.ch[k+1];
    out[0]=a[0]+(b[0]-a[0])*t;
    out[1]=a[1]+(b[1]-a[1])*t;
    out[2]=a[2]+(b[2]-a[2])*t;
  }
`,shape:`'  vec3 dir=a_dir;',
  '  vec2 c=vec2(cos(u_th),sin(u_th));',
  /* every noise lookup rides a closed circular path, so the sway is exactly
     periodic; the wavelength control scales all of them together */
  '  float iw=1.0/u_wave;',
  '  float n1=snoise(dir*(1.90*iw)+vec3(c*0.72,0.0));',
  '  float n2=snoise(dir*(4.20*iw)+vec3(0.0,c*0.60));',
  '  float n3=snoise(dir*(8.40*iw)+vec3(c.y*0.48,0.0,c.x*0.48));',
  /* the canopy sways, the trunk holds still */
  '  float lift=smoothstep(-0.95,0.60,dir.y);',
  '  vec3 q0=dir+vec3(n1*1.10,n2*0.34,n3*0.90)*0.085*lift;',
  '  float shade=clamp(0.40+0.60*lift+0.22*n1,0.0,1.0);',
  /* recursive erosion: two scales of noise eat the limbs back from the tips
     while the trunk and the lower limbs stay whole, so the crown never floats */
  '  float e=0.64*snoise(dir*(1.80*iw)+vec3(c*1.20,0.4))+0.36*snoise(dir*(3.90*iw)+vec3(0.3,c*1.05));',
  '  float alive=smoothstep(u_thr-0.06,u_thr+0.08,e+0.5+0.50*(1.0-smoothstep(-0.90,0.15,dir.y)));',
  '  vec3 n=normalize(u_rot*(q0+vec3(0.0,0.22,0.0)));',
  '  vec3 p=u_rot*q0;',
  '  float persp=1.0/(1.0-0.18*p.z);',
  '  float face=1.0;',`,palette:["  '  vec3 cDim=vec3(0.72,0.26,0.06);',","  '  vec3 cMid=vec3(1.00,0.58,0.16);',","  '  vec3 cHot=vec3(1.00,0.90,0.62);',"],tint:"  '  vec3 col=mix(cDim,cMid,clamp(shade*0.78+a_rand.x*0.32,0.0,1.0));',",rotation:`    var ax=0.10*Math.sin(th)+0.03*Math.sin(th*2+1.1);
    var ay=th;
    var az=0.05*Math.cos(th+0.6);`,grain:"        d[i]=n; d[i+1]=n*0.70; d[i+2]=n*0.44; d[i+3]=255;",lightBackground:"#f4f3f1",darkBackground:"#0a0908"},We={title:"Recursive Erosion — Mountain Range Motion Study",screenReaderCopy:"A looping study of a generative mountain range: a height field of small dots over a transparent backdrop, its ridges drifting and eroding into scree while bright glowing veins run down the slopes, each dot fringed with red and blue chromatic aberration.",duration:"  var DUR=9.0;                  /* reference loop length */",lattice:"  var N=16640;                  /* lattice points */",ropes:"  var WORMS=6, TAIL=14, WN=WORMS*TAIL;",pearls:"  var PEARL=46, TN=WORMS*PEARL, TSTRIDE=5;",scale:"    gl.uniform2f(U.u_scale,0.72*aspX,0.72*aspY);",dotSize:"    gl.uniform1f(U.u_px,Math.max(1.0,size/1080*6.8*PSIZE));",threshold:"    gl.uniform1f(U.u_thr,0.17+0.05*Math.sin(th*2+0.8));",wormFalloff:"  '      boost+=u_worm[i].w*exp(-dot(d,d)*130.0);',",dotProfile:"  '  v_k=(u_pass>0.5)?3.0:(u_trail>0.5?0.0:2.1);',",points:`  var NZ=64, PER=Math.max(1,Math.floor(N/NZ));
  for(var i=0;i<N;i++){
    /* the buffer is filled far row first. With premultiplied over-blending and
       no depth test, later points paint over earlier ones, so a near ridge hides
       the range standing behind it and the relief reads solid instead of
       transparent — this ordering is what makes the silhouette. */
    var uz=(Math.floor(i/PER)+0.5+(R0()*2-1)*0.40)/NZ;
    /* negative z is the far side; rows tighten toward it so distant ridges
       keep their grain instead of thinning out as they shrink */
    var vz=Math.pow(uz,1.30);
    dirs[i*3]=(R0()*2-1)*1.90;
    dirs[i*3+1]=0;
    dirs[i*3+2]=vz*2.20-1.10;
    rnds[i*2]=R0(); rnds[i*2+1]=R0();
  }
`,paths:`  var W=[];
  for(i=0;i<WORMS;i++){
    /* every vein wanders across the base plane; the shader lifts it onto the
       ridge with the same height field the lattice is displaced by */
    W.push({x0:(R0()*2-1)*1.30,am:0.20+R0()*0.32,fr:2.1+R0()*3.4,
            m:1+Math.floor(R0()*2),ph:R0()*6.283,
            str:0.92+R0()*0.30,arc:1.50+R0()*1.00,fl:R0()*6.283});
  }
  /* a point on vein k at angle ang, written into out[] — the parameter folds
     back on itself, so the flow runs down the slope and climbs back seamlessly */
  function onPath(w,ang,out){
    var f=ang/6.283185307179586; f-=Math.floor(f);
    var u=1-Math.abs(1-2*f);
    out[0]=w.x0+Math.sin(u*w.fr+w.ph)*w.am;
    out[1]=0;
    out[2]=1.05-2.10*u;
  }
`,shape:`'  vec3 dir=a_dir;',
  '  vec2 c=vec2(cos(u_th),sin(u_th));',
  /* the height field is read on a flat slice whose sample point rides a closed
     circular path, so the range drifts and morphs exactly periodically; the
     wavelength control scales every lookup together */
  '  float iw=1.0/u_wave;',
  '  vec3 g=vec3(dir.x,dir.z,0.0);',
  '  float n1=snoise(g*(1.05*iw)+vec3(c*0.42,0.0));',
  '  float n2=snoise(g*(2.35*iw)+vec3(0.0,c*0.36));',
  '  float n3=snoise(g*(5.30*iw)+vec3(c.y*0.30,0.0,c.x*0.30));',
  /* a ridged fractal: folding the noise about zero turns smooth hills into
     crests, and squaring the fold sharpens those crests into a skyline */
  '  float r1=1.0-abs(n1), r2=1.0-abs(n2);',
  '  float h=0.86*r1*r1+0.40*r2*r1+0.15*n3-0.58;',
  /* the range settles toward the near edge, so the front reads as a valley floor */
  '  h*=0.42+0.58*smoothstep(-0.55,1.15,-dir.z);',
  '  float shade=clamp(0.28+1.45*h,0.0,1.0);',
  /* recursive erosion: two scales of noise strip the scree off the slopes */
  '  float e=0.62*snoise(g*(1.55*iw)+vec3(c*1.10,0.4))+0.38*snoise(g*(3.30*iw)+vec3(0.3,c*0.95));',
  '  float alive=smoothstep(u_thr-0.07,u_thr+0.09,e+0.5+0.40*smoothstep(0.0,0.34,h));',
  '  vec3 q0=vec3(dir.x,h,dir.z);',
  '  vec3 n=u_rot*vec3(0.0,1.0,0.0);',
  '  vec3 p=u_rot*q0;',
  '  float persp=1.0/(1.0-0.26*p.z);',
  /* only the far rows haze out: everything else keeps full coverage, because
     the near rows have to paint over the far ones for the relief to read solid */
  '  float face=1.0-0.45*smoothstep(0.30,1.12,-dir.z);',`,palette:["  '  vec3 cDim=vec3(0.30,0.22,0.42);',","  '  vec3 cMid=vec3(0.94,0.45,0.20);',","  '  vec3 cHot=vec3(1.00,0.83,0.48);',"],tint:"  '  vec3 col=mix(cDim,cMid,clamp(shade*shade*1.15+a_rand.x*0.12,0.0,1.0));',",rotation:`    var ax=0.32+0.018*Math.sin(th);
    var ay=0.16*Math.sin(th+2.2);
    var az=0.0;`,grain:"        d[i]=n*0.86; d[i+1]=n*0.62; d[i+2]=n*0.74; d[i+3]=255;",lightBackground:"#f2f1f5",darkBackground:"#0b0a10"},Oe={title:"Recursive Erosion — Nebula Cloud Motion Study",screenReaderCopy:"A looping study of a generative nebula: a volumetric cloud of small violet and magenta dots over a transparent backdrop, shearing around its own core and eroding into voids while bright glowing filaments wind through it, each dot fringed with red and blue chromatic aberration.",duration:"  var DUR=8.0;                  /* reference loop length */",lattice:"  var N=9000;                   /* lattice points */",ropes:"  var WORMS=7, TAIL=12, WN=WORMS*TAIL;",pearls:"  var PEARL=64, TN=WORMS*PEARL, TSTRIDE=5;",scale:"    gl.uniform2f(U.u_scale,0.66*aspX,0.66*aspY);",dotSize:"    gl.uniform1f(U.u_px,Math.max(1.0,size/1080*9.5*PSIZE));",threshold:"    gl.uniform1f(U.u_thr,0.12+0.05*Math.sin(th*2+0.8));",wormFalloff:"  '      boost+=u_worm[i].w*exp(-dot(d,d)*150.0);',",dotProfile:"  '  v_k=(u_pass>0.5)?3.0:1.2;',",points:`  var LOBE=[];
  for(var q=0;q<6;q++) LOBE.push([(R0()*2-1)*0.52,(R0()*2-1)*0.30,(R0()*2-1)*0.52,0.22+R0()*0.30]);
  for(var i=0;i<N;i++){
    var L=LOBE[Math.min(LOBE.length-1,Math.floor(R0()*LOBE.length))];
    /* three summed uniforms approximate a gaussian, so each lobe keeps a dense
       core that thins out instead of ending on a hard edge */
    var g1=R0()+R0()+R0()-1.5, g2=R0()+R0()+R0()-1.5, g3=R0()+R0()+R0()-1.5;
    dirs[i*3]=L[0]+g1*L[3]*2.10;
    dirs[i*3+1]=L[1]+g2*L[3]*1.25;
    dirs[i*3+2]=L[2]+g3*L[3]*2.10;
    rnds[i*2]=R0(); rnds[i*2+1]=R0();
  }
`,paths:`  var W=[];
  for(i=0;i<WORMS;i++){
    /* every filament rides a tilted ring through the cloud, so the loop stays
       seamless and a steady handful of them is always inside the volume */
    var cz=(R0()*2-1)*0.85, ca0=R0()*6.283, cr=Math.sqrt(Math.max(0,1-cz*cz));
    var c=[Math.cos(ca0)*cr,Math.sin(ca0)*cr,cz];
    var t0=Math.abs(c[1])<0.85?[0,1,0]:[1,0,0];
    var d=t0[0]*c[0]+t0[1]*c[1]+t0[2]*c[2];
    var u=[t0[0]-c[0]*d,t0[1]-c[1]*d,t0[2]-c[2]*d];
    var lu=Math.hypot(u[0],u[1],u[2]); u=[u[0]/lu,u[1]/lu,u[2]/lu];
    var v=[c[1]*u[2]-c[2]*u[1],c[2]*u[0]-c[0]*u[2],c[0]*u[1]-c[1]*u[0]];
    W.push({c:c,u:u,v:v,rad:0.34+R0()*0.80,off:(R0()*2-1)*0.46,
            m:1+Math.floor(R0()*2),ph:R0()*6.283,
            str:0.88+R0()*0.32,arc:1.35+R0()*0.85,fl:R0()*6.283});
  }
  /* a point on filament k's ring at angle ang, written into out[] */
  function onPath(w,ang,out){
    var ca=Math.cos(ang), sa=Math.sin(ang);
    out[0]=w.c[0]*w.off+(w.u[0]*ca+w.v[0]*sa)*w.rad;
    out[1]=w.c[1]*w.off+(w.u[1]*ca+w.v[1]*sa)*w.rad;
    out[2]=w.c[2]*w.off+(w.u[2]*ca+w.v[2]*sa)*w.rad;
  }
`,shape:`'  vec3 dir=a_dir;',
  '  vec2 c=vec2(cos(u_th),sin(u_th));',
  /* every noise lookup rides a closed circular path, so the shear is exactly
     periodic; the wavelength control scales all of them together */
  '  float iw=1.0/u_wave;',
  '  float n1=snoise(dir*(1.20*iw)+vec3(c*0.82,0.0));',
  '  float n2=snoise(dir*(2.45*iw)+vec3(0.0,c*0.68));',
  '  float n3=snoise(dir*(5.10*iw)+vec3(c.y*0.52,0.0,c.x*0.52));',
  '  float rad=length(dir);',
  /* the cloud shears around its own core instead of pulsing in and out; the
     ropes take a fraction of that shear, or the high-frequency term would
     shatter each filament into unrelated dots */
  '  vec3 q0=dir+vec3(n2-n3,n3-n1,n1-n2)*(u_trail>0.5?0.14:0.26)*(0.30+0.70*rad);',
  '  float shade=clamp(0.5+0.62*n1+0.30*n3-0.42*rad,0.0,1.0);',
  /* recursive erosion, folded about zero: where the summed noise crosses zero
     the cloud survives as a thin sheet, so the voids are separated by filaments
     rather than by an even fog */
  '  float e=1.0-abs(0.62*snoise(dir*(1.35*iw)+vec3(c*1.15,0.4))+0.38*snoise(dir*(2.90*iw)+vec3(0.3,c*0.95)));',
  '  float alive=smoothstep(u_thr+0.24,u_thr+0.78,e+0.34*(1.0-smoothstep(0.10,1.15,rad)));',
  '  vec3 n=normalize(u_rot*q0+vec3(0.0,0.0,0.0001));',
  '  vec3 p=u_rot*q0;',
  '  float persp=1.0/(1.0-0.22*p.z);',
  /* cloud dots stay translucent so the volume builds up as haze instead of
     reading as a bag of discs, and the core carries the extra density — the
     filament ropes opt out, or they would be hazed away with everything else */
  '  float face=(u_trail>0.5)?1.0:(0.20+0.56*smoothstep(-1.15,0.85,p.z))*(1.0+0.95*(1.0-smoothstep(0.0,0.60,rad)));',`,palette:["  '  vec3 cDim=vec3(0.30,0.18,0.62);',","  '  vec3 cMid=vec3(0.86,0.24,0.62);',","  '  vec3 cHot=vec3(1.00,0.78,0.94);',"],tint:"  '  vec3 col=mix(cDim,cMid,clamp(shade*0.85+a_rand.x*0.30,0.0,1.0));',",rotation:`    var ax=0.16*Math.sin(th)+0.05*Math.sin(th*2+1.1);
    var ay=0.42*Math.sin(th+2.2)+0.10*Math.cos(th*2);
    var az=0.08*Math.cos(th+0.6);`,grain:"        d[i]=n*0.78; d[i+1]=n*0.52; d[i+2]=n; d[i+3]=255;",lightBackground:"#f4f2f8",darkBackground:"#08060f"},F={sphere:Fe,branches:ze,mountains:We,nebula:Oe},S={...b,variant:"sphere",speed:1,pointSize:1,wavelength:1},He=`  /* ------------------------------------------------------------------ *
     host controls — this document is served through a srcDoc iframe, so it
     cannot take a live React prop without being rebuilt, and rebuilding it
     would restart the loop on every slider tick. Speed, point size, and
     wavelength arrive by postMessage and land on the next frame; the pointer
     is read here and handed to the shader in clip space, the same space
     gl_Position is written in.
   * ------------------------------------------------------------------ */
  var SPEED=1, PSIZE=1, WAVE=1;
  var PX=0, PY=0, PA=0, tPX=0, tPY=0, tPA=0;
  window.addEventListener('message',function(ev){
    var d=ev&&ev.data&&ev.data.threeuiRuntime;
    if(!d) return;
    if(typeof d.speed==='number') SPEED=Math.max(0,Math.min(3,d.speed));
    if(typeof d.pointSize==='number') PSIZE=Math.max(0.35,Math.min(2.5,d.pointSize));
    if(typeof d.wavelength==='number') WAVE=Math.max(0.4,Math.min(2.5,d.wavelength));
    /* a paused document still has to repaint, or the sliders look dead */
    if(!playing) render(at);
  });
  var PREF=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!PREF){
    /* the isolating host marks the background stage pointer-events:none, so the
       cursor never hit-tests onto it — the listener goes on the document, which
       still sees every move over the frame, and the stage is only measured */
    window.addEventListener('pointermove',function(ev){
      var r=stage.getBoundingClientRect();
      if(!r.width||!r.height) return;
      tPX=((ev.clientX-r.left)/r.width)*2-1;
      tPY=1-((ev.clientY-r.top)/r.height)*2;
      tPA=1;
    });
    document.documentElement.addEventListener('pointerleave',function(){tPA=0});
    window.addEventListener('pointercancel',function(){tPA=0});
    window.addEventListener('blur',function(){tPA=0});
  }
`;function Ne(n,e){let t=n.replace("<title>Recursive Erosion — Particle Sphere Motion Study</title>",`<title>${e.title}</title>`).replace(/<p class="sr">[\s\S]*?<\/p>/,`<p class="sr">${e.screenReaderCopy}</p>`).replace("  var DUR=3.99;                 /* reference loop length */",e.duration).replace("  var N=2500;                   /* lattice points */",e.lattice).replace("  var WORMS=7, TAIL=14, WN=WORMS*TAIL;",e.ropes).replace("  var PEARL=34, TN=WORMS*PEARL, TSTRIDE=5;",e.pearls).replace("  'uniform float u_th, u_px, u_pass, u_thr, u_trail;',",`  'uniform float u_th, u_px, u_pass, u_thr, u_trail, u_wave;',
  'uniform vec3 u_ptr;',`).replace(Le,e.shape).replace("  '      boost+=u_worm[i].w*exp(-dot(d,d)*260.0);',",e.wormFalloff).replace("  '  vec3 cDim=vec3(0.94,0.33,0.05);',",e.palette[0]).replace("  '  vec3 cMid=vec3(1.00,0.56,0.16);',",e.palette[1]).replace("  '  vec3 cHot=vec3(1.00,0.71,0.31);',",e.palette[2]).replace("  '  vec3 col=mix(cDim,cMid,a_rand.x*a_rand.x);',",e.tint).replace("  '  v_k=(u_pass>0.5)?3.0:(u_trail>0.5?0.0:2.1);',",e.dotProfile).replace(Pe,e.paths).replace(Be,e.rotation).replace("        d[i]=n; d[i+1]=n*0.74; d[i+2]=n*0.52; d[i+3]=255;",e.grain).replace("    grain(frameNo++);","    grain(SPEED>0?frameNo++:frameNo);").replace("  ['u_rot','u_th','u_scale','u_px','u_pass','u_thr','u_off','u_worm','u_trail'].forEach(function(k){","  ['u_rot','u_th','u_scale','u_px','u_pass','u_thr','u_off','u_worm','u_trail','u_ptr','u_wave'].forEach(function(k){").replace("  var frameNo=0;",`${He}  var frameNo=0;`).replace(`    var th=2*Math.PI*(t/DUR);
    worms(th); rope(th);`,`    var th=2*Math.PI*(t/DUR);
    /* ease the pointer, so a fast flick pulls the field instead of snapping it */
    PX+=(tPX-PX)*0.16; PY+=(tPY-PY)*0.16; PA+=(tPA-PA)*0.10;
    worms(th); rope(th);`).replace("    gl.uniform4fv(U.u_worm,wormPos);",`    gl.uniform4fv(U.u_worm,wormPos);
    gl.uniform3f(U.u_ptr,PX,PY,PA);
    gl.uniform1f(U.u_wave,WAVE);`).replace("  function play(){if(playing&&raf)return;playing=true;start=performance.now()-at*1000;if(!raf)raf=requestAnimationFrame(tick)}","  function play(){if(playing&&raf)return;playing=true;start=null;if(!raf)raf=requestAnimationFrame(tick)}").replace(`    if(start===null)start=now;
    at=((now-start)/1000)%DUR;`,`    if(start===null)start=now;
    /* the clock accumulates, so the speed control changes the rate instead of
       rescaling elapsed time, which would jump the phase on every change */
    var dt=Math.min(0.1,(now-start)/1000); start=now;
    at=(at+dt*SPEED)%DUR;`).replace("    gl.uniform2f(U.u_scale,0.672*aspX,0.672*aspY);",e.scale).replace("    gl.uniform1f(U.u_px,Math.max(1.0,size/1080*8.0));",e.dotSize).replace("    gl.uniform1f(U.u_thr,0.19+0.04*Math.sin(th*2+0.8));",e.threshold);return e.points&&(t=t.replace(Ce,e.points)),e.pointerBoost&&(t=t.replace("  '    boost=min(boost,1.5);',",e.pointerBoost)),e.projection&&(t=t.replace("  '  gl_Position=vec4(p.xy*persp*u_scale+u_off,0.0,1.0);',",e.projection)),e.flicker&&(t=t.replace(Ie,e.flicker).replace(De,e.flicker)),t}function Ge(n,e){const t=e==="light"?"[[8, 10, 15], [40, 48, 62], [85, 96, 116]]":"[[255, 255, 255], [226, 232, 240], [191, 205, 225]]";return n.replace("<title>Epilude — Footer</title>","<title>Shaders Particle Wordmark</title>").replace("aspect-ratio: 8.541554959785524;","aspect-ratio: 5.333333333333333;").replace(/var WORDMARK =[\s\S]*?"<\/svg>";/,`var WORDMARK = ${JSON.stringify(ve)};`).replace("var PALETTE = [[255, 255, 255], [226, 232, 240], [191, 205, 225]];",`var PALETTE = ${t};`).replace("a: 0.04 + 0.95 * band * Math.pow(flake, 1.8)","a: 0.14 + 0.86 * band * Math.pow(flake, 1.8)")}function Ue(n,e){const t=e==="light"?"#f4f7fb":"#000",i=e==="light"?"#172033":"#E8EEE9",s=e==="light"?"#536076":"#c9d4cc",o=e==="light"?"#315efb":"#7080ff";return n.replace("<title>Supreme Radio — Graphic Identity</title>","<title>ThreeUI — Audio Wordmark</title>").replaceAll("supreme radio","ThreeUI").replaceAll("#EA3927",o).replaceAll("#E8EEE9",i).replaceAll("#E3EDE5",i).replaceAll("#c9d4cc",s).replaceAll("#000",t).replace("var DUR = 20;","var DUR = 4.7;")}const a={expanse:{title:"Expanse Field shader background",source:j,background:"#07080b",targets:[{selector:"#glcanvas",role:"background"}]},starfield:{title:"Imaginie star portal",source:ne,background:"#0d0a12",theme:{nativeMode:"dark",lightBackground:"#f4f7fb",darkBackground:"#0d0a12",invertBackground:!0},targets:[{selector:"#ambient-starfield",role:"background"},{selector:"#portal-stars",role:"background"},{selector:".holo-btn",role:"button"}]},particleOrb:{title:"Synthesis autonomous orb",source:ue,background:"#050505",targets:[{selector:"#orbCanvas",role:"background"}]},performanceGaugesTachometer:{title:"Tachometer diagnostic gauge",source:_,background:"#000000",targets:[{selector:"#gauge-tachometer",role:"visual",fit:"contain-square"}]},performanceGaugesSpeedometer:{title:"Speedometer diagnostic gauge",source:_,background:"#000000",targets:[{selector:"#gauge-speedometer",role:"visual",fit:"contain-square"}]},performanceGaugesBoost:{title:"Turbo boost diagnostic gauge",source:_,background:"#000000",targets:[{selector:"#gauge-boost",role:"visual",fit:"contain-square"}]},performanceGaugesPower:{title:"EV power diagnostic gauge",source:_,background:"#000000",targets:[{selector:"#gauge-power",role:"visual",fit:"contain-square"}]},logicCore:{title:"Logic Core isometric field",source:ce,background:"#050505",targets:[{selector:"#three-canvas-container",role:"background"}]},ignition:{title:"Ignition Button shader button",source:ee,background:"#f0ede7",theme:{nativeMode:"light",lightBackground:"#f0ede7",darkBackground:"#121316",invertBackground:!0},targets:[{selector:"#bg-gl",role:"background"},{selector:"#btn",role:"button"}]},induction:{title:"Induction Button kinetic button",source:he,background:"#050505",theme:{nativeMode:"dark",lightBackground:"#f4f7fb",darkBackground:"#050505",invertBackground:!0},targets:[{selector:"#bg-canvas",role:"background"},{selector:"#btn",role:"button"}]},aetherisLabs:{title:"Aetheris Labs plasma button",source:N,background:"#020614",theme:{nativeMode:"dark",lightBackground:"#f4f7fb",darkBackground:"#020614",invertBackground:!0},targets:[{selector:"#bg-gl",role:"background"},{selector:"#btn",role:"button"}]},tactile:{title:"Nexus tactile fluidics button",source:ae,background:"#03090d",theme:{nativeMode:"dark",lightBackground:"#f4f7fb",darkBackground:"#03090d",invertBackground:!0},targets:[{selector:"#bg-canvas",role:"background"},{selector:"#btn",role:"button"}]},thinking:{title:"Thinking Button canvas animation",source:le,background:"#111318",theme:{lightBackground:"#f4f7fb",darkBackground:"#111318"},transformSource:xe,targets:[{selector:"#stage",role:"button"}]},slidingTextCta:{title:"Sliding Text CTA button",source:ie,background:"#111318",theme:{lightBackground:"#f4f7fb",darkBackground:"#111318"},targets:[{selector:".component-wrapper button",role:"button",preserveTransform:!0}]},floatingDotsCta:{title:"Floating Dots CTA button",source:V,background:"#111318",theme:{lightBackground:"#f4f7fb",darkBackground:"#111318"},targets:[{selector:".component-wrapper button",role:"button",preserveTransform:!0}]},launchButton:{title:"Gradient Launch button",source:te,background:"#111318",theme:{lightBackground:"#f4f7fb",darkBackground:"#111318"},targets:[{selector:".component-wrapper button",role:"button",preserveTransform:!0}]},dotBorderButton:{title:"Dot Border button",source:U,background:"#111318",theme:{lightBackground:"#f4f7fb",darkBackground:"#111318"},transformSource:ye,targets:[{selector:".component-wrapper .btn-wrapper",role:"button",preserveTransform:!0}]},gradientCta:{title:"Gradient CTA button",source:J,background:"#111318",theme:{lightBackground:"#f4f7fb",darkBackground:"#111318"},targets:[{selector:".component-wrapper button",role:"button",preserveTransform:!0}]},spinningBorderButton:{title:"Spinning Border button",source:se,background:"#111318",theme:{lightBackground:"#f4f7fb",darkBackground:"#111318"},targets:[{selector:".component-wrapper button",role:"button",preserveTransform:!0}]},glassmorphismCta:{title:"Glassmorphism CTA button",source:$,background:"#111318",theme:{lightBackground:"#f4f7fb",darkBackground:"#111318"},targets:[{selector:".component-wrapper a",role:"button",preserveTransform:!0}]},generateButton:{title:"Generate button",source:K,background:"#111318",theme:{lightBackground:"#f4f7fb",darkBackground:"#111318"},targets:[{selector:".component-wrapper .btn-wrapper",role:"button",preserveTransform:!0}]},gradientPillButton:{title:"Gradient Pill button",source:Q,background:"#111318",theme:{lightBackground:"#f4f7fb",darkBackground:"#111318"},transformSource:we,targets:[{selector:".component-wrapper button",role:"button",preserveTransform:!0}]},gradientBeamCta:{title:"Gradient Beam CTA button",source:Z,background:"#111318",theme:{lightBackground:"#f4f7fb",darkBackground:"#111318"},targets:[{selector:".component-wrapper button",role:"button",preserveTransform:!0}]},recursiveErosion:{title:"Recursive Erosion particle sphere background",source:oe,background:"#0a0908",theme:{lightBackground:"#f4f3f1",darkBackground:"#0a0908"},targets:[{selector:"#stage",role:"background"}],hiddenTargets:["#badge",".sr"]},threeUIIntro:{title:"ThreeUI chromatic wordmark intro",source:q,background:"#000000",theme:{nativeMode:"dark",lightBackground:"#f4f7fb",darkBackground:"#000000",invertBackground:!0},targets:[{selector:"#stage",role:"background"}],hiddenTargets:[".sr"],introWordmark:{sceneSelector:"#comp .scene:first-child",text:"ThreeUI",fontSize:130,endTime:1.7,holdTime:1.1,logoSvg:me}},particleWordmark:{title:"Shaders particle wordmark",source:Y,background:"#0c0c0d",theme:{lightBackground:"#f4f7fb",darkBackground:"#0c0c0d"},transformSource:Ge,targets:[{selector:"#storm",role:"visual",fit:"wide-wordmark"}]},audioWordmark:{title:"ThreeUI audio wordmark",source:G,background:"#000000",theme:{lightBackground:"#f4f7fb",darkBackground:"#000000"},transformSource:Ue,targets:[{selector:"#stage",role:"visual",fit:"portrait-stage",preserveTransform:!0}]},galleryHeading:{title:"Gallery Heading canvas animation",source:X,background:"#000000",theme:{lightBackground:"#f4f7fb",darkBackground:"#000000"},transformSource:(n,e)=>W(n,e,C[L.variant]),targets:[{selector:"#stage",role:"background"}]},dimensional:{title:"Vanguard dimensional architecture",source:fe,background:"#050608",targets:[{selector:"#webgl-canvas",role:"background"}]},cloud:{title:"Strata cloud migration field",source:de,background:"#071010",targets:[{selector:"#c",role:"background"}]},vertex9:{title:"Vertex 9 global data field",source:pe,background:"#050505",targets:[{selector:"#webgl-canvas",role:"background"}]},topology:{title:"Nexus topology field",source:re,background:"#070707",targets:[{selector:"#animationCanvas",role:"background"}]},voidField:{title:"Void Field shader background",source:ge,background:"#030305",targets:[{selector:"#webgl-canvas",role:"background"}]}};function x(n,e,t){return Math.min(t,Math.max(e,n))}function O(n,e){var t;return((t=n.theme)==null?void 0:t[`${e}Background`])??n.background}function qe(n,e){var y,k;const t=O(n,e),i=((y=n.theme)==null?void 0:y.invertBackground)===!0&&n.theme.nativeMode!==e,s=((k=n.transformSource)==null?void 0:k.call(n,n.source,e))??n.source,o=JSON.stringify(n.targets).replace(/</g,"\\u003c"),f=JSON.stringify(n.hiddenTargets??[]).replace(/</g,"\\u003c"),m=JSON.stringify(n.introWordmark??null).replace(/</g,"\\u003c"),l=JSON.stringify(e),h=i?"filter: invert(1) hue-rotate(180deg) saturate(.92) brightness(1.02) !important;":"",w=n.introWordmark?`${n.introWordmark.sceneSelector} .tx { font-size: ${n.introWordmark.fontSize}px !important; }`:"",T=`<style data-threeui-focus>
html, body { width: 100% !important; height: 100% !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; background: ${t} !important; color-scheme: ${e} !important; }
body { position: relative !important; display: flex !important; align-items: center !important; justify-content: center !important; }
body > * { visibility: hidden !important; }
body[data-threeui-ready] > [data-threeui-role] { visibility: visible !important; }
[data-threeui-residual] { display: none !important; }
[data-threeui-hidden] { display: none !important; }
[data-threeui-role="background"] { position: fixed !important; inset: 0 !important; width: 100% !important; height: 100% !important; max-width: none !important; max-height: none !important; z-index: 0 !important; opacity: 1 !important; pointer-events: none !important; ${h} }
[data-threeui-role="background"][data-threeui-fit="contain-square"] { position: absolute !important; top: 50% !important; right: auto !important; bottom: auto !important; left: 50% !important; width: min(100vw, 100vh) !important; height: min(100vw, 100vh) !important; aspect-ratio: 1 / 1 !important; transform: translate(-50%, -50%) !important; }
[data-threeui-role="button"] { position: relative !important; z-index: 2 !important; opacity: 1 !important; flex: none !important; }
[data-threeui-role="button"]:not([data-threeui-preserve-transform]) { transform: none !important; }
[data-threeui-role="visual"] { position: relative !important; z-index: 1 !important; width: min(100%, 1040px) !important; max-width: 1040px !important; max-height: 100% !important; margin: auto !important; padding: 24px !important; overflow: auto !important; opacity: 1 !important; filter: none !important; }
[data-threeui-role="visual"]:not([data-threeui-preserve-transform]) { transform: none !important; }
[data-threeui-role="visual"][data-threeui-fit="contain-square"] { flex: none !important; width: min(calc(100vw - 32px), calc(100vh - 32px)) !important; max-width: none !important; height: min(calc(100vw - 32px), calc(100vh - 32px)) !important; max-height: none !important; aspect-ratio: 1 / 1 !important; padding: 0 !important; overflow: hidden !important; }
[data-threeui-role="visual"][data-threeui-fit="wide-wordmark"] { width: min(calc(100vw - 48px), 1180px) !important; max-width: calc(100vw - 48px) !important; height: auto !important; max-height: none !important; aspect-ratio: 16 / 3 !important; padding: 0 !important; overflow: hidden !important; }
[data-threeui-role="visual"][data-threeui-fit="portrait-stage"] { position: absolute !important; top: 50% !important; right: auto !important; bottom: auto !important; left: 50% !important; width: 1080px !important; max-width: none !important; height: 1350px !important; max-height: none !important; padding: 0 !important; overflow: hidden !important; transform-origin: center !important; }
${w}
</style>`,R=`<script data-threeui-focus>
(function () {
  document.documentElement.dataset.sfMode = ${l};
  var isolated = false;
  function isolate() {
    if (isolated) return;
    var specs = ${o};
    var hiddenSelectors = ${f};
    var introWordmark = ${m};
    var roots = [];
    hiddenSelectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (element) {
        element.setAttribute('data-threeui-hidden', '');
        element.setAttribute('aria-hidden', 'true');
        if ('inert' in element) element.inert = true;
      });
    });
    specs.forEach(function (spec) {
      var element = document.querySelector(spec.selector);
      if (!element) return;
      element.setAttribute('data-threeui-role', spec.role);
      if (spec.fit) element.setAttribute('data-threeui-fit', spec.fit);
      if (spec.preserveTransform) element.setAttribute('data-threeui-preserve-transform', '');
      if (!roots.some(function (root) { return root.contains(element); })) roots.push(element);
    });
    if (introWordmark) {
      var introScene = document.querySelector(introWordmark.sceneSelector);
      var introText = introScene && introScene.querySelector('.tx');
      var introMark = introText && introText.querySelector('.mark');
      if (introText && introMark) {
        introMark.innerHTML = introWordmark.logoSvg;
        var introCharacters = Array.from(introText.children).filter(function (element) { return element !== introMark; });
        introCharacters.forEach(function (element, index) {
          element.textContent = introWordmark.text[index] === ' ' ? ' ' : (introWordmark.text[index] || '');
          element.style.display = index < introWordmark.text.length ? 'inline-block' : 'none';
        });
      }
      var introReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var introStartedAt = performance.now();
      function renderIntroWordmark(now) {
        if (typeof window.__seek !== 'function') return;
        if (introReducedMotion) {
          window.__seek(introWordmark.endTime);
          return;
        }
        var introCycle = introWordmark.endTime + introWordmark.holdTime;
        var introTime = ((now - introStartedAt) / 1000) % introCycle;
        window.__seek(Math.min(introTime, introWordmark.endTime));
        requestAnimationFrame(renderIntroWordmark);
      }
      requestAnimationFrame(renderIntroWordmark);
    }
    if (!roots.length) return;
    isolated = true;
    roots.forEach(function (root) {
      var placeholderLink = root.matches('a[href="#"]') ? root : root.querySelector('a[href="#"]');
      if (placeholderLink) placeholderLink.addEventListener('click', function (event) { event.preventDefault(); });
      document.body.appendChild(root);
    });
    Array.from(document.body.children).forEach(function (element) {
      if (roots.indexOf(element) !== -1) return;
      element.setAttribute('data-threeui-residual', '');
      element.setAttribute('aria-hidden', 'true');
      if ('inert' in element) element.inert = true;
    });
    document.body.setAttribute('data-threeui-ready', '');
    requestAnimationFrame(function () { window.dispatchEvent(new Event('resize')); });
  }
  function scheduleIsolation() { setTimeout(isolate, 100); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleIsolation, { once: true });
  else scheduleIsolation();
  window.addEventListener('load', isolate, { once: true });
})();
<\/script>`;return s.replace(/<\/head>/i,`${T}</head>`).replace(/<\/body>/i,`${R}</body>`)}function A({definition:n,mode:e=b.mode,hue:t=b.hue,saturation:i=b.saturation,brightness:s=b.brightness,runtime:o,trackPointerHover:f,className:m,style:l}){const h=g.useRef(null),w=e==="light"?"light":"dark",T=O(n,w),R=g.useMemo(()=>qe(n,w),[n,w]),y=x(t,-180,180),k=x(i,0,2),B=x(s,.35,1.65),H=y===0&&k===1&&B===1?void 0:`hue-rotate(${y}deg) saturate(${k}) brightness(${B})`;g.useEffect(()=>{const c=h.current;if(!f||!c)return;let p=!1;const d=()=>{var u;p&&(p=!1,(u=c.contentWindow)==null||u.postMessage({threeuiRuntime:{hover:0}},"*"))},I=u=>{var v;u.source===c.contentWindow&&((v=u.data)!=null&&v.threeuiPointerOver)&&(p=!0)},D=u=>{if(!p)return;const v=c.getBoundingClientRect();(u.clientX<v.left||u.clientX>v.right||u.clientY<v.top||u.clientY>v.bottom)&&d()};return window.addEventListener("message",I),window.addEventListener("pointermove",D,!0),c.addEventListener("pointerleave",d),document.addEventListener("mouseleave",d),window.addEventListener("blur",d),()=>{window.removeEventListener("message",I),window.removeEventListener("pointermove",D,!0),c.removeEventListener("pointerleave",d),document.removeEventListener("mouseleave",d),window.removeEventListener("blur",d)}},[f]);const M=o?JSON.stringify(o):null;return g.useEffect(()=>{const c=h.current;if(!c||!M)return;const p=()=>{var d;return(d=c.contentWindow)==null?void 0:d.postMessage({threeuiRuntime:JSON.parse(M)},"*")};return p(),c.addEventListener("load",p),()=>c.removeEventListener("load",p)},[M,R]),E.jsx("iframe",{ref:h,className:m,"data-mode":w,title:n.title,srcDoc:R,sandbox:"allow-scripts",loading:"eager",style:{display:"block",width:"100%",height:"100%",border:0,background:T,filter:H,...l}})}function r(n){return function(t){return E.jsx(A,{...t,definition:n})}}const $e=r(a.expanse),Ze=r(a.starfield),Je=r(a.particleOrb),z={tachometer:a.performanceGaugesTachometer,speedometer:a.performanceGaugesSpeedometer,boost:a.performanceGaugesBoost,power:a.performanceGaugesPower},Ye={...b,variant:"tachometer"};function Qe({variant:n=Ye.variant,...e}){const t=z[n]??z.tachometer;return E.jsx(A,{...e,definition:t})}const et=r(a.logicCore),tt=r(a.ignition),nt=r(a.induction),at=r(a.aetherisLabs),rt=r(a.tactile),je=r(a.thinking),ot=je,it=r(a.slidingTextCta),st=r(a.floatingDotsCta),lt=r(a.launchButton),ct=r(a.dotBorderButton),dt=r(a.gradientCta),ut=r(a.spinningBorderButton),ht=r(a.glassmorphismCta),ft=r(a.generateButton),pt=r(a.gradientPillButton),gt=r(a.gradientBeamCta);function mt({variant:n=S.variant,speed:e=S.speed,pointSize:t=S.pointSize,wavelength:i=S.wavelength,...s}){const o=F[n]??F[S.variant],f=g.useMemo(()=>({...a.recursiveErosion,title:o.title,background:o.darkBackground,theme:{lightBackground:o.lightBackground,darkBackground:o.darkBackground},transformSource:l=>Ne(l,o)}),[o]),m=g.useMemo(()=>({speed:x(e,0,3),pointSize:x(t,.35,2.5),wavelength:x(i,.4,2.5)}),[e,t,i]);return E.jsx(A,{...s,definition:f,runtime:m})}const vt=r(a.threeUIIntro),bt=r(a.particleWordmark),xt=r(a.audioWordmark);function Ve({variant:n=L.variant,font:e,weight:t,headlineSize:i,...s}){const o=C[n]??C[L.variant],f=g.useMemo(()=>({...a.galleryHeading,title:`${o.title} canvas animation`,transformSource:(l,h)=>W(l,h,o)}),[o]),m=g.useMemo(()=>{const l=o.type,h=t&&be.includes(t)?t:l.weight;return{font:(e&&P[e])??P[l.font],weight:h,headlineSize:x(i??l.headlineSize,.6,1.8)}},[o,e,i,t]);return E.jsx(A,{...s,definition:f,runtime:m,trackPointerHover:!0})}const wt=Ve,yt=r(a.dimensional),kt=r(a.cloud),St=r(a.vertex9),Et=r(a.topology),Rt=r(a.voidField);export{xt as AudioWordmark,kt as CloudField,St as DataField,yt as DimensionalField,ct as DotBorderButton,$e as ExpanseField,st as FloatingDotsCta,L as GALLERY_HEADING_DEFAULTS,P as GALLERY_HEADING_FONTS,C as GALLERY_HEADING_VARIANTS,be as GALLERY_HEADING_WEIGHTS,Ve as GalleryHeading,ft as GenerateButton,ht as GlassmorphismCta,gt as GradientBeamCta,wt as GradientCollection,dt as GradientCta,pt as GradientPillButton,tt as IgnitionButton,nt as InductionButton,lt as LaunchButton,et as LogicCoreField,b as NEUFORM_ISOLATED_DEFAULTS,Ye as PERFORMANCE_GAUGES_DEFAULTS,Je as ParticleOrbField,bt as ParticleWordmark,Qe as PerformanceGauges,at as PlasmaButton,S as RECURSIVE_EROSION_DEFAULTS,mt as RecursiveErosionBackground,it as SlidingTextCta,ut as SpinningBorderButton,Ze as StarPortal,rt as TactileButton,je as ThinkingButton,vt as ThreeUIIntro,Et as TopologyField,ot as UploadingButton,Rt as VoidField};
