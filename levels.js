 const loaderOverlay = document.getElementById('loaderOverlay');

    // Hide loader after 1 second
    setTimeout(() => {
      loaderOverlay.style.display = 'none';
    }, 1000);

    function switchLanguage(lang) {
      const body = document.body;
      const langBtns = document.querySelectorAll('.lang-btn');

      langBtns.forEach(btn => btn.classList.remove('active'));

      if (lang === 'ar') {
        body.classList.add('arabic');
        langBtns[1].classList.add('active'); // AR button
      } else {
        body.classList.remove('arabic');
        langBtns[0].classList.add('active'); // EN button
      }
    }

    // Small runtime adjustments to keep the glow and dust centered above the stone regardless of DOM ordering
    window.addEventListener('DOMContentLoaded', function () {
      try {
        const stoneWrapper = document.getElementById('stoneWrapper') || document.querySelector('div[style*="left: 300px; top: -80px"]');
        if (!stoneWrapper) {
          console.warn('stoneWrapper not found at DOMContentLoaded, glows/dust centering might fail.');
          return;
        }

        // Handle the initial dust image (dustwhite.png)
        const dustWhiteDiv = document.querySelector('div[style*="left: 600px; top: -200px"]');
        const dustWhiteImg = dustWhiteDiv ? dustWhiteDiv.querySelector('img') : null;
        if (dustWhiteImg && dustWhiteImg.parentElement !== stoneWrapper) {
          dustWhiteImg.style.position = 'absolute';
          dustWhiteImg.style.left = '50%';
          dustWhiteImg.style.top = '50%';
          dustWhiteImg.style.transform = 'translate(-50%, -50%)';
          dustWhiteImg.style.pointerEvents = 'none';
          dustWhiteImg.style.opacity = '0'; // Ensure it starts hidden
          dustWhiteImg.style.transition = 'opacity 400ms ease';
          stoneWrapper.appendChild(dustWhiteImg);
          if (dustWhiteDiv.children.length === 0) dustWhiteDiv.remove(); // Remove empty parent
        }

        // Handle the black dust overlay (black.png)
        const dustBlackDiv = document.getElementById('dustWrapper') || document.querySelector('div[style*="left: 400px; top:px"]');
        const dustBlackImg = dustBlackDiv ? dustBlackDiv.querySelector('img') : null;
        if (dustBlackImg && dustBlackImg.parentElement !== stoneWrapper) {
          dustBlackImg.style.position = 'absolute';
          dustBlackImg.style.left = '50%';
          dustBlackImg.style.top = '50%';
          dustBlackImg.style.transform = 'translate(-50%, -50%)';
          dustBlackImg.style.pointerEvents = 'none';
          dustBlackImg.style.opacity = '0'; // Ensure it starts hidden
          dustBlackImg.style.transition = 'opacity 400ms ease';
          stoneWrapper.appendChild(dustBlackImg);
          if (dustBlackDiv.children.length === 0) dustBlackDiv.remove(); // Remove empty parent
        }

      } catch (e) { console.warn('DOM reposition failed', e); }
    });

    function tryInit(attempt = 0) {
      const MAX_ATTEMPTS = 6;
      const rubWrapper = document.getElementById('rubWrapper');
      const rubImg = document.getElementById('rubImg');
      let rubGlow = rubWrapper ? rubWrapper.querySelector('#rubGlow') : null;

      const stoneImgEl = document.querySelector('img[src*="Stonecopy.png"]') || document.querySelector('img[src*="Stonecopy"]');
      const stoneWrapper = document.getElementById('stoneWrapper') || (stoneImgEl ? stoneImgEl.closest('div') : document.querySelector('div[style*="left: 300px; top: -80px"]'));

      let dustImg = document.querySelector('img[src*="black.png"]');
      if (!dustImg) {
        const dustBlackDiv = document.getElementById('dustWrapper') || document.querySelector('div[style*="left: 400px; top:px"]');
        if (dustBlackDiv) dustImg = dustBlackDiv.querySelector('img');
      }

      const missing = [];
      if (!rubWrapper) missing.push('rubWrapper');
      if (!rubImg) missing.push('rubImg');
      if (!rubGlow) missing.push('rubGlow');
      if (!stoneWrapper) missing.push('stoneWrapper');
      if (!dustImg) missing.push('dustImg (black.png)');
      if (missing.length) {
        if (attempt < MAX_ATTEMPTS) {
          setTimeout(() => tryInit(attempt + 1), 150);
          return;
        }
        console.warn('Required elements missing for GSAP interactions after retries:', missing.join(', '));
        return;
      }

      console.log('GSAP init: elements found, initializing draggable');

      function setActiveTool(name) {
        const btns = document.querySelectorAll('.btn-container button');
        btns.forEach(b => b.classList.remove('active'));
        let selector = null;
        if (name === 'rub') selector = 'img[src*="ruberic.png"]';
        if (name === 'chuck') selector = 'img[src*="chuckiic.png"]';
        if (name === 'crayon') selector = 'img[src*="crayonic.png"]';
        if (selector) {
          const img = document.querySelector(selector);
          if (img && img.parentElement) img.parentElement.classList.add('active');
        }
        // support gum and nitric activations
        if (name === 'gum') {
          const g = document.querySelector('img[src*="gumarabic.png"]') || document.getElementById('btnGumImg');
          if (g && g.parentElement) g.parentElement.classList.add('active');
        }
        if (name === 'nitric') {
          const n = document.querySelector('img[src*="nitricacid.png"]') || document.getElementById('btnNitricImg');
          if (n && n.parentElement) n.parentElement.classList.add('active');
        }
        try {
          // Remove any existing preview flags
          document.querySelectorAll('#rubWrapper, #chuckWrapper, #crayonWrapper, #gumarabicWrapper, #nitricWrapper').forEach(el => { try { if (el && el.classList) el.classList.remove('show-preview'); } catch(e){} });
          // Map tool name to wrapper id and add show-preview to that wrapper
          let wrapperId = null;
          if (name === 'rub') wrapperId = 'rubWrapper';
          else if (name === 'chuck') wrapperId = 'chuckWrapper';
          else if (name === 'crayon') wrapperId = 'crayonWrapper';
          else if (name === 'gum') wrapperId = 'gumarabicWrapper';
          else if (name === 'nitric') wrapperId = 'nitricWrapper';
          if (wrapperId) {
            const w = document.getElementById(wrapperId);
            if (w && w.classList) w.classList.add('show-preview');
          }
        } catch (e) { /* ignore */ }
        // Also update global preview images: show the preview for the active tool
        try {
          hideAllPreviews();
          const map = {
            rub: 'rubPreviewImg',
            chuck: 'chuckPreviewImg',
            crayon: 'crayonPreviewImg',
            gum: 'gumPreviewImg',
            nitric: 'nitricPreviewImg'
          };
          const pid = map[name];
          if (pid) {
            const preview = document.getElementById(pid);
            const wrapper = document.getElementById(name === 'gum' ? 'gumarabicWrapper' : (name + 'Wrapper'));
            if (preview && wrapper) {
              positionPreviewNextTo(preview, wrapper);
              preview.classList.add('show');
            }
          }
        } catch (e) { /* ignore */ }
      }

      function hideAllPreviews() {
        try { document.querySelectorAll('.tool-preview.global').forEach(img => { img.classList.remove('show'); }); } catch (e) { }
      }

      function positionPreviewNextTo(previewEl, wrapperEl) {
        try {
          const wRect = wrapperEl.getBoundingClientRect();
          const container = document.getElementById('toolPreviewContainer');
          if (!container) return;
          // place preview to the right of the wrapper, vertically centered
          const x = Math.min(window.innerWidth - 60, wRect.right + 120);
          const y = wRect.top + (wRect.height / 2);
          // If CSS variables are set for positioning, prefer them and don't override
          const leftVar = getComputedStyle(previewEl).getPropertyValue('--preview-left').trim();
          const rightVar = getComputedStyle(previewEl).getPropertyValue('--preview-right').trim();
          const topVar = getComputedStyle(previewEl).getPropertyValue('--preview-top').trim();
          const bottomVar = getComputedStyle(previewEl).getPropertyValue('--preview-bottom').trim();
          if (!leftVar && !rightVar) previewEl.style.left = x + 'px';
          if (!topVar && !bottomVar) previewEl.style.top = y + 'px';
        } catch (e) { /* ignore */ }
      }

      function setProgress(percent) {
        try {
          percent = Math.max(0, Math.min(100, percent));
          const segments = Array.from(document.querySelectorAll('.progress-segment'));
          if (!segments.length) return;
          const total = segments.length;
          const exact = (percent / 100) * total;
          const fillCount = Math.floor(exact);
          const half = (exact - fillCount) >= 0.5;
          segments.forEach((s, i) => {
            s.classList.remove('active'); s.classList.remove('half');
            if (i < fillCount) s.classList.add('active');
            else if (i === fillCount && half) s.classList.add('half');
          });
        } catch (e) { /* ignore */ }
      }

      function setStageText(txt) {
        try {
          const st = document.getElementById('bottomStageText');
          if (!st) return;
          st.textContent = txt || '';
        } catch (e) { /* ignore */ }
      }

      window.setProgress = setProgress;
      window.setStageText = setStageText;

      setActiveTool('rub');

      const chuckWrapperEl = document.getElementById('chuckWrapper');
      const instructionsP = document.querySelector('div[style*="right: 110px; bottom: -110px"] p');

      // Ensure dust overlays start hidden (handled by DOMContentLoaded, but double-check)
      if (document.querySelector('img[src*="dustwhite.png"]')) document.querySelector('img[src*="dustwhite.png"]').style.opacity = '0';
      if (dustImg) dustImg.style.opacity = '0';

      if (rubGlow) {
        rubGlow.style.position = 'absolute';
        rubGlow.style.left = '50%';
        rubGlow.style.top = '50%';
        rubGlow.style.transform = 'translate(-50%, -50%)';
        rubGlow.style.zIndex = '1';
        rubGlow.className = 'rub-glow ripple';
        rubImg.style.position = 'relative';
        rubImg.style.zIndex = '2';
      }


      let stoneWhiteGlow = document.createElement('div');
      stoneWhiteGlow.id = 'stoneWhiteGlow';
      stoneWhiteGlow.className = 'stone-glow-white ripple';
      if (stoneWrapper) stoneWrapper.appendChild(stoneWhiteGlow);

      rubWrapper.addEventListener('pointerdown', function () {
        if (rubGlow) {
          gsap.to(rubGlow, { opacity: 0, duration: 0.3 });
        }
      });

      gsap.registerPlugin(Draggable);

      let completed = false;

      function centerOf(el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, rect: r };
      }

      function checkCollision() {
        if (completed) return;
        const rubC = centerOf(rubWrapper);
        const stoneC = centerOf(stoneWrapper);
        const dx = rubC.x - stoneC.x;
        const dy = rubC.y - stoneC.y;
        const dist = Math.hypot(dx, dy);
        const threshold = (rubC.rect.width + stoneC.rect.width) * 0.45;
        if (dist < threshold) {
          completed = true;
          onRubHitStone();
        }
      }

      function onRubHitStone() {
        const stoneWhiteGlow = document.getElementById('stoneWhiteGlow');
        if (stoneWhiteGlow) gsap.to(stoneWhiteGlow, { opacity: 0, duration: 0.3 });
        if (rubGlow) gsap.to(rubGlow, { opacity: 0, duration: 0.3 });

        gsap.to(dustImg, { opacity: 1, duration: 0.5, ease: 'power1.out' });

        const offX = (document.documentElement.clientWidth || window.innerWidth) + 300;
        gsap.to(rubWrapper, {
          x: offX, opacity: 0, duration: 0.8, ease: 'power2.in', onComplete: () => {
            rubWrapper.style.display = 'none';
          }
        });

        if (chuckWrapperEl) {
          // only show/position chuck replacement on 4K screens
          if (window.innerWidth >= 2560) {
            try {
            // Clear inline GSAP transforms before applying new styles
            gsap.set(chuckWrapperEl, { clearProps: 'x,y,transform,opacity' });
            chuckWrapperEl.style.position = 'absolute';

            // Check for 4K and apply CSS-driven position
            if (window.innerWidth >= 2560) {
              // Let CSS media query handle right/bottom/width/height for #chuckWrapper
              chuckWrapperEl.style.left = 'auto';
              chuckWrapperEl.style.top = 'auto';
            } else {
              const rRect = rubWrapper.getBoundingClientRect();
              chuckWrapperEl.style.left = (rRect.left + window.scrollX) + 'px';
              chuckWrapperEl.style.top = (rRect.top + window.scrollY) + 'px';
            }

            chuckWrapperEl.style.opacity = '0';
            chuckWrapperEl.style.display = 'flex';

            let chuckGlow = document.createElement('div');
            chuckGlow.className = 'chuck-glow ripple';
            chuckWrapperEl.appendChild(chuckGlow);

            let stoneBlackGlow = document.createElement('div');
            stoneBlackGlow.id = 'stoneBlackGlow';
            stoneBlackGlow.className = 'stone-glow-black-center ripple';
            if (stoneWrapper) stoneWrapper.appendChild(stoneBlackGlow);

            chuckWrapperEl.addEventListener('pointerdown', function () {
              const currentChuckGlow = chuckWrapperEl.querySelector('.chuck-glow');
              if (currentChuckGlow) {
                gsap.to(currentChuckGlow, { opacity: 0, duration: 0.3 });
                currentChuckGlow.classList.remove('ripple');
              }
            });

            gsap.to(chuckWrapperEl, { opacity: 1, duration: 0.6, ease: 'power2.out', onComplete: () => { setActiveTool('chuck'); setProgress(33); setStageText('Drag the grainer to the\nsurface of the stone to\nstart smoothing the surface.'); try { document.querySelectorAll('#rubWrapper, #chuckWrapper, #crayonWrapper, #gumarabicWrapper, #nitricWrapper').forEach(el => { try { if (el && el.classList) el.classList.remove('show-preview'); } catch(e){} }); const w = document.getElementById('chuckWrapper'); if (w && w.classList) w.classList.add('show-preview'); } catch(e){} } });
            } catch (e) { console.warn('Could not position chuck replacement', e); }
          }
        }

        if (instructionsP) instructionsP.innerHTML = 'Drag the grainer to the <br>surface of the stone to start <br>smoothing the surface.';
      }

      const drag = Draggable.create(rubWrapper, {
        type: 'x,y',
        edgeResistance: 0.65,
        bounds: document.body,
        inertia: true,
        onDragStart: function () {
          if (completed) return;
          rubWrapper.classList.add('dragging');
        },
        onDrag: function () {
          checkCollision();
        },
        onDragEnd: function () {
          rubWrapper.classList.remove('dragging');
        }
      })[0];

      const chuckImg = document.getElementById('chuckImg');
      let chuckRot = 0;
      let lastAngle = null;
      let rotationsCompleted = 0;
      let chuckActive = true;
      let chuckAutoRotating = false;

      // helper to run the chuck-complete sequence (extracted so both manual rotation and auto-rotate can use it)
      function completeChuck() {
        if (!chuckActive) return; // already finishing
        chuckActive = false;
        chuckAutoRotating = false;
        try {
          const chuckGlow = chuckWrapperEl.querySelector('.chuck-glow');
          const stoneBlackGlow = document.getElementById('stoneBlackGlow');
          if (chuckGlow) gsap.to(chuckGlow, { opacity: 0, duration: 0.3 });
          if (stoneBlackGlow) gsap.to(stoneBlackGlow, { opacity: 0, duration: 0.3 });

          gsap.to(dustImg, {
            opacity: 0, duration: 0.6, ease: 'power1.out', onComplete: () => {
              try {
                gsap.to(chuckWrapperEl, {
                  x: (document.documentElement.clientWidth || window.innerWidth) + 200, opacity: 0, duration: 0.6, ease: 'power2.in', onComplete: () => {
                    try { chuckWrapperEl.style.display = 'none'; } catch (e) { }
                  }
                });

                let crayonWrapper = document.getElementById('crayonWrapper');
                if (!crayonWrapper) {
                  crayonWrapper = document.createElement('div');
                  crayonWrapper.id = 'crayonWrapper';
                  crayonWrapper.className = 'crayon';
                  crayonWrapper.style.position = 'absolute';
                  crayonWrapper.style.width = '220px'; // Base size
                  crayonWrapper.style.height = 'auto';
                  crayonWrapper.style.display = 'flex';
                  crayonWrapper.style.alignItems = 'center';
                  crayonWrapper.style.justifyContent = 'center';
                  const ci = document.createElement('img');
                  ci.id = 'crayonImg';
                  ci.src = './assets/crayon.png';
                  ci.style.width = '220px'; // Base size
                  ci.style.position = 'relative';
                  ci.style.zIndex = '2';
                  crayonWrapper.appendChild(ci);

                  let crayonGlow = document.createElement('div');
                  crayonGlow.className = 'crayon-glow ripple';
                  crayonWrapper.appendChild(crayonGlow);

                  document.body.appendChild(crayonWrapper);
                }
                // Position crayon using CSS for 4K, or previous tool's rect for others
                gsap.set(crayonWrapper, { clearProps: 'x,y,transform,opacity' });
                if (window.innerWidth >= 2560) {
                  try { crayonWrapper.style.right = chuckWrapperEl.style.right; crayonWrapper.style.bottom = chuckWrapperEl.style.bottom; crayonWrapper.style.left = 'auto'; crayonWrapper.style.top = 'auto'; } catch(e){}
                } else {
                  try { const cRect = chuckWrapperEl.getBoundingClientRect(); crayonWrapper.style.left = (cRect.left + window.scrollX) + 'px'; crayonWrapper.style.top = (cRect.top + window.scrollY) + 'px'; } catch(e){}
                }
                crayonWrapper.style.opacity = '0';
                crayonWrapper.style.display = 'flex';

                let stoneBlackRightGlow = document.createElement('div');
                stoneBlackRightGlow.id = 'stoneBlackRightGlow';
                stoneBlackRightGlow.className = 'stone-glow-black-right ripple';
                if (stoneWrapper) stoneWrapper.appendChild(stoneBlackRightGlow);

                gsap.to(crayonWrapper, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', onComplete: () => { try { setActiveTool('crayon'); setStageText('Take the crayon to the surface\nof your stone to start writing'); } catch(e){} } });

                // add draggable for crayon shortly after
                setTimeout(() => {
                  try {
                    if (window.Draggable && crayonWrapper) {
                      let crayonCompleted = false;
                      const crayonDr = Draggable.create(crayonWrapper, {
                        type: 'x,y', bounds: document.body, edgeResistance: 0.65, inertia: true,
                        onDragStart() { crayonWrapper.classList.add('dragging'); },
                        onDrag() {
                          if (crayonCompleted) return;
                          const crayonC = centerOf(crayonWrapper);
                          const stoneC = centerOf(stoneWrapper);
                          const dx = crayonC.x - stoneC.x;
                          const dy = crayonC.y - stoneC.y;
                          const dist = Math.hypot(dx, dy);
                          const threshold = (crayonC.rect.width + stoneC.rect.width) * 0.4;
                          if (dist < threshold) {
                            crayonCompleted = true;
                            try { crayonDr.disable(); } catch(e){}
                            // trigger crayon hit logic if needed (existing code handles it)
                          }
                        },
                        onDragEnd() { crayonWrapper.classList.remove('dragging'); }
                      })[0];
                    }
                  } catch (e) { }
                }, 120);

              } catch (err) { console.warn('crayon replacement failed', err); }
            }
          });
        } catch (e) { /* ignore */ }
      }

      if (chuckWrapperEl && chuckImg) {
        const chuckDrag = Draggable.create(chuckWrapperEl, {
          type: 'x,y',
          edgeResistance: 0.65,
          bounds: document.body,
          inertia: true,
          onDragStart: function () {
            chuckWrapperEl.classList.add('dragging');
            lastAngle = null;
          },
          onDragEnd: function () {
            chuckWrapperEl.classList.remove('dragging');
          }
        })[0];

        chuckWrapperEl.addEventListener('pointerdown', function (e) { e.preventDefault(); try { chuckDrag.startDrag(e); } catch (_) { } }, { passive: false });

        let chuckPointerId = null;
        function onPointerDownChuck(e) {
          chuckPointerId = e.pointerId || 'mouse';
          lastAngle = null;
          try { e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId); } catch (e) { }
          window.addEventListener('pointermove', onPointerMoveChuck, { passive: false });
          window.addEventListener('pointerup', onPointerUpChuck);
        }

        function onPointerMoveChuck(e) {
          if (!chuckPointerId || (chuckPointerId !== 'mouse' && e.pointerId !== chuckPointerId)) return;
          const chuckC = centerOf(chuckWrapperEl);
          const stoneC = centerOf(stoneWrapper);
          const dx = chuckC.x - stoneC.x;
          const dy = chuckC.y - stoneC.y;
          const dist = Math.hypot(dx, dy);
          const overlapThreshold = (chuckC.rect.width + stoneC.rect.width) * 0.6;
          if (dist < overlapThreshold && chuckActive) {
            const angle = Math.atan2(e.clientY - chuckC.y, e.clientX - chuckC.x) * 180 / Math.PI;
            if (lastAngle !== null) {
              let delta = angle - lastAngle;
              if (delta > 180) delta -= 360;
              if (delta < -180) delta += 360;
              chuckRot += delta;
              chuckImg.style.transform = `rotate(${chuckRot}deg)`;
              const fulls = Math.floor(Math.abs(chuckRot) / 360);
              if (fulls > rotationsCompleted) {
                rotationsCompleted = fulls;
                if (rotationsCompleted >= 2) {
                  chuckActive = false;

                  const chuckGlow = chuckWrapperEl.querySelector('.chuck-glow');
                  const stoneBlackGlow = document.getElementById('stoneBlackGlow');
                  if (chuckGlow) gsap.to(chuckGlow, { opacity: 0, duration: 0.3 });
                  if (stoneBlackGlow) gsap.to(stoneBlackGlow, { opacity: 0, duration: 0.3 });

                  gsap.to(dustImg, {
                    opacity: 0, duration: 0.6, ease: 'power1.out', onComplete: () => {
                      try {
                        gsap.to(chuckWrapperEl, {
                          x: (document.documentElement.clientWidth || window.innerWidth) + 200, opacity: 0, duration: 0.6, ease: 'power2.in', onComplete: () => {
                            chuckWrapperEl.style.display = 'none';
                          }
                        });

                        let crayonWrapper = document.getElementById('crayonWrapper');
                        if (!crayonWrapper) {
                          crayonWrapper = document.createElement('div');
                          crayonWrapper.id = 'crayonWrapper';
                          crayonWrapper.className = 'crayon';
                          crayonWrapper.style.position = 'absolute';
                          crayonWrapper.style.width = '220px'; // Base size
                          crayonWrapper.style.height = 'auto';
                          crayonWrapper.style.display = 'flex';
                          crayonWrapper.style.alignItems = 'center';
                          crayonWrapper.style.justifyContent = 'center';
                          const ci = document.createElement('img');
                          ci.id = 'crayonImg';
                          ci.src = './assets/crayon.png';
                          ci.style.width = '220px'; // Base size
                          ci.style.position = 'relative';
                          ci.style.zIndex = '2';
                          crayonWrapper.appendChild(ci);

                          let crayonGlow = document.createElement('div');
                          crayonGlow.className = 'crayon-glow ripple';
                          crayonWrapper.appendChild(crayonGlow);

                          document.body.appendChild(crayonWrapper);
                        }
                        // Position crayon using CSS for 4K, or previous tool's rect for others
                        gsap.set(crayonWrapper, { clearProps: 'x,y,transform,opacity' });
                        if (window.innerWidth >= 2560) {
                          crayonWrapper.style.right = chuckWrapperEl.style.right;
                          crayonWrapper.style.bottom = chuckWrapperEl.style.bottom;
                          crayonWrapper.style.left = 'auto';
                          crayonWrapper.style.top = 'auto';
                        } else {
                          const cRect = chuckWrapperEl.getBoundingClientRect();
                          crayonWrapper.style.left = (cRect.left + window.scrollX) + 'px';
                          crayonWrapper.style.top = (cRect.top + window.scrollY) + 'px';
                        }
                        crayonWrapper.style.opacity = '0';
                        crayonWrapper.style.display = 'flex';

                        let stoneBlackRightGlow = document.createElement('div');
                        stoneBlackRightGlow.id = 'stoneBlackRightGlow';
                        stoneBlackRightGlow.className = 'stone-glow-black-right ripple';
                        if (stoneWrapper) stoneWrapper.appendChild(stoneBlackRightGlow);

                        gsap.to(crayonWrapper, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', onComplete: () => { setActiveTool('crayon'); setStageText('Take the crayon to the surface\nof your stone to start writing'); try { document.querySelectorAll('#rubWrapper, #chuckWrapper, #crayonWrapper, #gumarabicWrapper, #nitricWrapper').forEach(el => { try { if (el && el.classList) el.classList.remove('show-preview'); } catch(e){} }); const w = document.getElementById('crayonWrapper'); if (w && w.classList) w.classList.add('show-preview'); } catch(e){} } });

                        crayonWrapper.addEventListener('pointerdown', function () {
                          const crayonGlow = crayonWrapper.querySelector('.crayon-glow');
                          if (crayonGlow) {
                            gsap.to(crayonGlow, { opacity: 0, duration: 0.3 });
                            crayonGlow.classList.remove('ripple');
                          }
                        });

                        setTimeout(() => {
                          if (window.Draggable && crayonWrapper) {
                            let crayonCompleted = false;
                            const crayonDr = Draggable.create(crayonWrapper, {
                              type: 'x,y', bounds: document.body, edgeResistance: 0.65, inertia: true,
                              onDragStart() { crayonWrapper.classList.add('dragging'); },
                              onDrag() {
                                if (crayonCompleted) return;
                                const crayonC = centerOf(crayonWrapper);
                                const stoneC = centerOf(stoneWrapper);
                                const dx = crayonC.x - stoneC.x;
                                const dy = crayonC.y - stoneC.y;
                                const dist = Math.hypot(dx, dy);
                                const threshold = (crayonC.rect.width + stoneC.rect.width) * 0.4;
                                if (dist < threshold) {
                                  crayonCompleted = true;
                                  onCrayonHitStone();
                                }
                              },
                              onDragEnd() { crayonWrapper.classList.remove('dragging'); }
                            })[0];

                            function onCrayonHitStone() {
                              const crayonGlow = crayonWrapper.querySelector('.crayon-glow');
                              const stoneBlackRightGlow = document.getElementById('stoneBlackRightGlow');
                              if (crayonGlow) gsap.to(crayonGlow, { opacity: 0, duration: 0.3 });
                              if (stoneBlackRightGlow) gsap.to(stoneBlackRightGlow, { opacity: 0, duration: 0.3 });

                              gsap.to(crayonWrapper, {
                                opacity: 0, duration: 0.8, ease: 'power1.out', onComplete: () => {
                                  crayonWrapper.style.display = 'none';
                                }
                              });

                              let gifOverlay = document.getElementById('gifOverlay');
                              if (!gifOverlay) {
                                gifOverlay = document.createElement('div');
                                gifOverlay.id = 'gifOverlay';
                                gifOverlay.style.position = 'absolute';
                                gifOverlay.style.left = '631.5px';
                                gifOverlay.style.top = '549px';
                                gifOverlay.style.transform = 'translate(-50%, -50%)';
                                gifOverlay.style.pointerEvents = 'none';
                                gifOverlay.style.zIndex = '10';
                                const gifImg = document.createElement('img');
                                gifImg.src = './assets/drawing.png';
                                gifImg.style.width = '558.39px';
                                gifImg.style.height = '481.19px';
                                gifImg.style.objectFit = 'contain';
                                gifOverlay.appendChild(gifImg);
                                if (stoneWrapper) stoneWrapper.appendChild(gifOverlay);
                              }
                              gifOverlay.style.opacity = '0';
                              gsap.to(gifOverlay, { opacity: 1, duration: 0.6, ease: 'power1.out' });

                              setTimeout(() => {
                                try {
                                  let gum = document.getElementById('gumarabicWrapper');
                                  if (!gum) {
                                    gum = document.createElement('div');
                                    gum.id = 'gumarabicWrapper';
                                    gum.style.position = 'absolute';
                                    gum.style.width = '140px'; // Base size
                                    gum.style.height = 'auto';
                                    gum.style.display = 'flex';
                                    gum.style.alignItems = 'center';
                                    gum.style.justifyContent = 'center';
                                    gum.style.zIndex = '30';
                                    const gi = document.createElement('img');
                                    gi.src = './assets/gumarabic.png';
                                    gi.style.width = '140px'; // Base size
                                    gi.id = 'gumarabicImg';
                                    gum.appendChild(gi);
                                    document.body.appendChild(gum);
                                  }
                                  // Position gumarabic using CSS for 4K, or previous tool's rect for others
                                  gsap.set(gum, { clearProps: 'x,y,transform,opacity' });
                                  if (window.innerWidth >= 2560) {
                                    gum.style.right = crayonWrapper.style.right;
                                    gum.style.bottom = crayonWrapper.style.bottom;
                                    gum.style.left = 'auto';
                                    gum.style.top = 'auto';
                                  } else {
                                    const cRect = crayonWrapper.getBoundingClientRect();
                                    gum.style.left = (cRect.left + window.scrollX) + 'px';
                                    gum.style.top = (cRect.top + window.scrollY) + 'px';
                                  }
                                  gum.style.opacity = '0';
                                  gsap.to(gum, { opacity: 1, duration: 0.4, onComplete: () => { try { setActiveTool('gum');
                                        try { const btnGum = document.getElementById('btnGumImg'); if (btnGum && btnGum.parentElement) btnGum.parentElement.classList.add('active'); } catch(e){}
                                      } catch (e) { } } });

                                  const mini1 = document.createElement('div'); mini1.className = 'mini-ripple';
                                  const ring1 = document.createElement('div'); ring1.className = 'ring'; mini1.appendChild(ring1);
                                  gum.appendChild(mini1);

                                  const mini2 = document.createElement('div'); mini2.className = 'mini-ripple';
                                  mini2.style.left = '50%'; mini2.style.top = '92%';
                                  const ring2 = document.createElement('div'); ring2.className = 'ring'; mini2.appendChild(ring2);
                                  if (stoneWrapper) stoneWrapper.appendChild(mini2);

                                  if (window.Draggable) {
                                    const gumDr = Draggable.create(gum, { type: 'x,y', bounds: document.body, inertia: true })[0];
                                    gum.addEventListener('pointerdown', function (e) { try { gumDr.startDrag(e); } catch (_) { } }, { passive: false });

                                    // wait for user to drag gum to the stone; on overlap, animate right and remove
                                    const checkGumToStone = () => {
                                      try {
                                        const gumRect = gum.getBoundingClientRect();
                                        const stoneRect = stoneWrapper.getBoundingClientRect();
                                        const gumCenterX = gumRect.left + gumRect.width / 2;
                                        const gumCenterY = gumRect.top + gumRect.height / 2;
                                        const stoneCenterX = stoneRect.left + stoneRect.width / 2;
                                        const stoneCenterY = stoneRect.top + stoneRect.height / 2;
                                        const dx = gumCenterX - stoneCenterX;
                                        const dy = gumCenterY - stoneCenterY;
                                        const dist = Math.sqrt(dx * dx + dy * dy);
                                        const threshold = Math.max(60, (stoneRect.width + gumRect.width) / 6);
                                        if (dist < threshold) {
                                          // overlap detected — disable further checks and animate gum right after showing a gum overlay
                                          clearInterval(gumCheckInterval);
                                          try { gumDr.disable(); } catch (e) { }

                                          // create and fade-in a gum overlay on the stone (use gum.png, fallback to gumarabic.png)
                                          try {
                                            let gumStoneImg = document.getElementById('gumStoneImg');
                                            if (!gumStoneImg && stoneWrapper) {
                                              gumStoneImg = document.createElement('img');
                                              gumStoneImg.id = 'gumStoneImg';
                                              gumStoneImg.src = './assets/gum.png';
                                              gumStoneImg.style.position = 'absolute';
                                              // nudge gum slightly left so it sits a bit more centered on the stone
                                              gumStoneImg.style.left = '48%';
                                              gumStoneImg.style.top = '60%';
                                              gumStoneImg.style.transform = 'translate(-50%, -50%)';
                                              // size relative to stone so it looks appropriate on different resolutions
                                              try {
                                                // Only set inline width if there's no effective CSS width already (respect CSS overrides)
                                                const computed = window.getComputedStyle(gumStoneImg);
                                                const hasInlineWidth = !!gumStoneImg.style.width;
                                                const computedWidth = parseFloat(computed.width) || 0;
                                                if (!hasInlineWidth && computedWidth < 2) {
                                                  const w = Math.max(80, Math.min(180, Math.round(stoneRect.width * 0.28)));
                                                  gumStoneImg.style.width = w + 'px';
                                                }
                                              } catch (e) { try { gumStoneImg.style.width = '30px'; } catch (_) { } }
                                              gumStoneImg.style.pointerEvents = 'none';
                                              gumStoneImg.style.opacity = '0';
                                              // fallback if gum.png missing
                                              gumStoneImg.onerror = function () { try { this.onerror = null; this.src = './assets/gumarabic.png'; } catch (e) { } };
                                              stoneWrapper.appendChild(gumStoneImg);
                                            }
                                            if (gumStoneImg) gsap.to(gumStoneImg, { opacity: 1, duration: 0.6, ease: 'power1.out' });
                                          } catch (e) { /* fail silently */ }

                                          // delay the off-screen animation slightly so the fade-in is visible
                                          gsap.to(gum, { delay: 0.35, x: (document.documentElement.clientWidth || window.innerWidth) + 200, opacity: 0, duration: 0.9, ease: 'power2.in', onComplete: () => {
                                            try { gum.remove(); } catch (e) { }

                                            // after gum is removed, spawn nitric acid from the right
                                            try {
                                              let nitric = document.getElementById('nitricWrapper');
                                              if (!nitric) {
                                                nitric = document.createElement('div');
                                                nitric.id = 'nitricWrapper';
                                                nitric.style.position = 'absolute';
                                                nitric.style.width = '100%';
                                                nitric.style.height = 'auto';
                                                nitric.style.display = 'flex';
                                                nitric.style.alignItems = 'center';
                                                nitric.style.justifyContent = 'center';
                                                nitric.style.zIndex = '30';
                                                const ni = document.createElement('img');
                                                ni.id = 'nitricImg';
                                                ni.src = './assets/nitricacid.png';
                                                ni.style.width = '800px';
                                                ni.style.pointerEvents = 'none';
                                                nitric.appendChild(ni);
                                                document.body.appendChild(nitric);
                                              }
                                              // position nitric on the right edge (or stack on 4k)
                                              gsap.set(nitric, { clearProps: 'x,y,transform,opacity' });
                                              if (window.innerWidth >= 2560 && crayonWrapper) {
                                                // stack near previous tool position on 4K (use crayonWrapper/right-bottom)
                                                try { nitric.style.right = crayonWrapper.style.right; nitric.style.bottom = crayonWrapper.style.bottom; nitric.style.left = 'auto'; nitric.style.top = 'auto'; } catch (e) { }
                                              } else {
                                                // place near right side
                                                nitric.style.left = (window.innerWidth - 180) + 'px';
                                                nitric.style.top = Math.max(80, (window.innerHeight / 2) - 60) + 'px';
                                              }
                                              nitric.style.opacity = '0';
                                              gsap.to(nitric, { opacity: 1, duration: 0.5, onComplete: () => { try { setActiveTool('nitric');
                                                    try { const btnNit = document.getElementById('btnNitricImg'); if (btnNit && btnNit.parentElement) btnNit.parentElement.classList.add('active'); } catch(e){}
                                                  } catch (e) { } } });

                                              // create draggable for nitric
                                              if (window.Draggable) {
                                                const nitricDr = Draggable.create(nitric, { type: 'x,y', bounds: document.body, inertia: true })[0];
                                                nitric.addEventListener('pointerdown', function (e) { try { nitricDr.startDrag(e); } catch (_) { } }, { passive: false });

                                                // check when nitric is taken to the stone
                                                let nitricDone = false;
                                                const checkNitricToStone = () => {
                                                  try {
                                                    const nRect = nitric.getBoundingClientRect();
                                                    const sRect = stoneWrapper.getBoundingClientRect();
                                                    const nCx = nRect.left + nRect.width / 2;
                                                    const nCy = nRect.top + nRect.height / 2;
                                                    const sCx = sRect.left + sRect.width / 2;
                                                    const sCy = sRect.top + sRect.height / 2;
                                                    const dx = nCx - sCx; const dy = nCy - sCy;
                                                    const dist = Math.hypot(dx, dy);
                                                    const thr = Math.max(60, (nRect.width + sRect.width) / 6);
                                                    if (dist < thr && !nitricDone) {
                                                      nitricDone = true;
                                                      try { nitricDr.disable(); } catch (e) { }

                                                      // fade in nitric overlay at the exact right of gumStoneImg
                                                      try {
                                                        const gumStone = document.getElementById('gumStoneImg');
                                                        let nitricStone = document.getElementById('nitricStoneImg');
                                                        if (!nitricStone && stoneWrapper) {
                                                          nitricStone = document.createElement('img');
                                                          nitricStone.id = 'nitricStoneImg';
                                                          nitricStone.src = './assets/nitric.png';
                                                          nitricStone.style.position = 'absolute';
                                                          // place exact right of gumStoneImg if available
                                                          if (gumStone) {
                                                            // position nitric just to the right of gum but nudge slightly left overall
                                                            nitricStone.style.left = 'calc(50% + ' + (gumStone.style.width || '140px') + ' / 2 - 20px)';
                                                            nitricStone.style.top = gumStone.style.top || '60%';
                                                            nitricStone.style.transform = 'translate(-0%, -50%)';
                                                          } else {
                                                            nitricStone.style.left = '56%';
                                                            nitricStone.style.top = '60%';
                                                            nitricStone.style.transform = 'translate(-50%, -50%)';
                                                          }
                                                          try {
                                                            const computed = window.getComputedStyle(nitricStone);
                                                            const hasInlineWidth = !!nitricStone.style.width;
                                                            const computedWidth = parseFloat(computed.width) || 0;
                                                            if (!hasInlineWidth && computedWidth < 2) {
                                                              const w = Math.max(60, Math.min(160, Math.round(sRect.width * 0.18)));
                                                              nitricStone.style.width = w + 'px';
                                                            }
                                                          } catch (e) { try { nitricStone.style.width = '100px'; } catch (_) { } }
                                                          nitricStone.style.pointerEvents = 'none';
                                                          nitricStone.style.opacity = '0';
                                                          // fallback if nitric file missing
                                                          nitricStone.onerror = function () { try { this.onerror = null; this.src = './assets/nitricacid.png'; } catch (e) { } };
                                                          stoneWrapper.appendChild(nitricStone);
                                                        }
                                                        if (nitricStone) gsap.to(nitricStone, { opacity: 1, duration: 0.6, ease: 'power1.out' });
                                                      } catch (e) { /* ignore */ }

                                                      // then animate nitric off-screen to the right and remove
                                                      gsap.to(nitric, { delay: 0.35, x: (document.documentElement.clientWidth || window.innerWidth) + 200, opacity: 0, duration: 0.9, ease: 'power2.in', onComplete: () => { try { nitric.remove(); } catch (e) { } try { spawnFoam(); } catch (e) { } } });
                                                    }
                                                  } catch (e) { /* ignore */ }
                                                };

                                                const nitricInterval = setInterval(checkNitricToStone, 300);
                                                nitric.addEventListener('pointerup', () => { try { checkNitricToStone(); clearInterval(nitricInterval); } catch (e) { } }, { passive: true });
                                              }
                                            } catch (e) { console.warn('nitric spawn failed', e); }
                                          } });
                                          gsap.to(mini2, { opacity: 0, duration: 0.6, onComplete: () => { try { mini2.remove(); } catch (e) { } } });
                                          // advance final progress / stage
                                          setProgress(100);
                                          setStageText('Finished');
                                        }
                                      } catch (e) { /* ignore */ }
                                    };

                                    // check periodically and also on drag end
                                    const gumCheckInterval = setInterval(checkGumToStone, 300);
                                    gum.addEventListener('pointerup', checkGumToStone, { passive: true });
                                  }

                                } catch (e) { console.warn('gumarabic spawn failed', e); }
                              }, 700);

                              setProgress(100);
                              setStageText('Drawing complete');
                            }

                            crayonWrapper.addEventListener('pointerdown', function (e) { e.preventDefault(); try { crayonDr.startDrag(e); } catch (_) { } }, { passive: false });
                          }
                        }, 120);
                        setProgress(66); // Chuck complete, now crayon
                        setStageText('Draw on the stone');
                      } catch (err) { console.warn('crayon replacement failed', err); }
                    }
                  });
                }
              }
            }
            lastAngle = angle;
          }
        }

        function onPointerUpChuck(e) {
          try { e.target.releasePointerCapture && e.target.releasePointerCapture(e.pointerId); } catch (e) { }
          window.removeEventListener('pointermove', onPointerMoveChuck);
          window.removeEventListener('pointerup', onPointerUpChuck);
          chuckPointerId = null;
          lastAngle = null;
        }

        chuckWrapperEl.addEventListener('pointerdown', onPointerDownChuck, { passive: false });
      }
    }

    window.addEventListener('load', function () { tryInit(0); });
    window.addEventListener('load', function () {
      try { if (window.setProgress) setProgress(0); if (window.setStageText) setStageText('Prepare stone'); } catch (e) { }
    });

      // spawnFoam: create a draggable foam image that slides in and when dragged to the stone
      // will auto-rotate the preview (itfoam_preview.png) and then complete.
      function spawnFoam() {
        try {
          let foam = document.getElementById('foamWrapper');
          if (!foam) {
            foam = document.createElement('div');
            foam.id = 'foamWrapper';
            foam.style.position = 'absolute';
            foam.style.width = '220px';
            foam.style.height = 'auto';
            foam.style.display = 'flex';
            foam.style.alignItems = 'center';
            foam.style.justifyContent = 'center';
            foam.style.zIndex = '35';
            const fi = document.createElement('img');
            fi.id = 'foamImg';
            fi.src = './assets/foam.png';
            fi.style.width = '220px';
            fi.style.pointerEvents = 'none';
            foam.appendChild(fi);
            document.body.appendChild(foam);
          }

          // slide in from right — use explicit left/top so CSS doesn't hide the element
          try { console.log('spawnFoam: creating foam element'); } catch (e) {}
          const winW = (document.documentElement.clientWidth || window.innerWidth);
          const winH = (document.documentElement.clientHeight || window.innerHeight);
          // position off-screen to the right initially
          foam.style.left = (winW + 240) + 'px';
          foam.style.top = Math.max(120, Math.round(winH / 2) - 40) + 'px';
          foam.style.transform = 'translate(-50%, -50%)';
          foam.style.opacity = '0';
          try { console.log('spawnFoam: animating foam in'); } catch (e) {}
          gsap.to(foam, { left: (winW - 180) + 'px', opacity: 1, duration: 0.6, ease: 'power2.out' });

          // make draggable
          if (window.Draggable) {
            const foamDr = Draggable.create(foam, { type: 'x,y', bounds: document.body, inertia: true })[0];
            foam.addEventListener('pointerdown', function (e) { try { foamDr.startDrag(e); } catch (_) { } }, { passive: false });

            let foamDone = false;
            const checkFoamToStone = () => {
              try {
                const fRect = foam.getBoundingClientRect();
                const sRect = stoneWrapper.getBoundingClientRect();
                const fCx = fRect.left + fRect.width / 2;
                const fCy = fRect.top + fRect.height / 2;
                const sCx = sRect.left + sRect.width / 2;
                const sCy = sRect.top + sRect.height / 2;
                const dx = fCx - sCx; const dy = fCy - sCy;
                const dist = Math.hypot(dx, dy);
                const thr = Math.max(60, (fRect.width + sRect.width) / 6);
                if (dist < thr && !foamDone) {
                  foamDone = true;
                  try { foamDr.disable(); } catch (e) { }

                  // show small foam preview rotation (use itfoam_preview.png if available)
                  try {
                    let preview = document.getElementById('foamPreviewImg');
                    if (!preview) {
                      preview = document.createElement('img');
                      preview.id = 'foamPreviewImg';
                      // prefer specific preview image but fall back to available assets
                      const tryPreviewCandidates = ['./assets/itfoam_preview.png', './assets/foam_preview.png', './assets/foam.png', './assets/gumpre.png'];
                      for (let i = 0; i < tryPreviewCandidates.length; i++) {
                        try { preview.src = tryPreviewCandidates[i]; break; } catch (e) { }
                      }
                      preview.style.position = 'absolute';
                      preview.style.left = '50%';
                      preview.style.top = '50%';
                      preview.style.transform = 'translate(-50%, -50%)';
                      preview.style.pointerEvents = 'none';
                      preview.style.width = Math.max(60, Math.min(160, Math.round(sRect.width * 0.18))) + 'px';
                      preview.style.zIndex = '40';
                      if (stoneWrapper) stoneWrapper.appendChild(preview);
                    }
                    // auto-rotate preview then fade out and remove foam
                    gsap.set(preview, { rotation: 0 });
                    gsap.to(preview, { rotation: '+=720', duration: 1.2, ease: 'power2.inOut' });
                    gsap.to(preview, { opacity: 0, delay: 1.15, duration: 0.35, onComplete: () => { try { preview.remove(); } catch (e) { } } });
                  } catch (e) { /* ignore preview errors */ }

                  gsap.to(foam, { opacity: 0, delay: 0.9, duration: 0.6, onComplete: () => { try { foam.remove(); } catch (e) { } } });
                }
              } catch (e) { /* ignore */ }
            };

            const foamInterval = setInterval(checkFoamToStone, 250);
            foam.addEventListener('pointerup', () => { try { checkFoamToStone(); clearInterval(foamInterval); } catch (e) { } }, { passive: true });
          }
        } catch (e) { console.warn('spawnFoam failed', e); }
      }