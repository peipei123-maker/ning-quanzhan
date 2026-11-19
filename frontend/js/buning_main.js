/**
 * 姓名：卜宁 | 学号：24001010202 | 时间：2026-11-19 | 大模型：DeepSeek
 * 首页：canvas 连线动画 + 接口自检
 */
(function () {
  'use strict';

  /* ---------- canvas 粒子连线动画 ---------- */
  var canvas = document.getElementById('buning_canvas');
  var ctx = canvas.getContext('2d');
  var buning_points = [];
  var buning_dpr = Math.min(window.devicePixelRatio || 1, 2);

  function buning_resize() {
    canvas.width = window.innerWidth * buning_dpr;
    canvas.height = window.innerHeight * buning_dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(buning_dpr, 0, 0, buning_dpr, 0, 0);
    buning_initPoints();
  }

  function buning_initPoints() {
    var count = Math.round((window.innerWidth * window.innerHeight) / 22000);
    buning_points = [];
    for (var i = 0; i < Math.min(Math.max(count, 40), 120); i++) {
      buning_points.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r: Math.random() * 1.6 + 0.8
      });
    }
  }

  function buning_draw() {
    var w = window.innerWidth, h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < buning_points.length; i++) {
      var p = buning_points[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(125,211,252,.75)';
      ctx.fill();
    }

    for (var a = 0; a < buning_points.length; a++) {
      for (var b = a + 1; b < buning_points.length; b++) {
        var pa = buning_points[a], pb = buning_points[b];
        var dx = pa.x - pb.x, dy = pa.y - pb.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.strokeStyle = 'rgba(167,139,250,' + (0.20 * (1 - dist / 140)).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(buning_draw);
  }

  window.addEventListener('resize', buning_resize);
  buning_resize();
  buning_draw();

  /* ---------- 接口自检 ---------- */
  var out = document.getElementById('buning_api_out');
  var btn = document.getElementById('buning_reload');

  function buning_health() {
    out.textContent = '请求中…';
    fetch('/api/buning_health')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        console.log('[buning_health]', data);
        out.textContent = JSON.stringify(data, null, 2);
      })
      .catch(function (err) {
        console.error('[buning_health] 请求失败', err);
        out.textContent = '请求失败：' + err.message + '\n（请确认已运行 qidong.bat 启动后端）';
      });
  }

  btn.addEventListener('click', buning_health);
  buning_health();
})();
