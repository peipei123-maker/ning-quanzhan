/**
 * 姓名：卜宁 | 学号：24001010202 | 时间：2026-11-19 | 大模型：DeepSeek
 * database.html 逻辑 —— 测试 MySQL 连接
 */
(function () {
  'use strict';

  var form = document.getElementById('buning_202_db_form');
  var status = document.getElementById('buning_202_db_status');
  var hostEl = document.getElementById('buning_202_db_host');
  var userEl = document.getElementById('buning_202_db_user');
  var pwdEl = document.getElementById('buning_202_db_password');

  function showStatus(ok, msg, raw) {
    status.className = 'buning_202_status ' + (ok ? 'buning_202_ok' : 'buning_202_err');
    status.innerHTML = '<div>' + (ok ? '✓ ' : '✗ ') + msg + '</div>' +
      (raw ? '<pre>' + raw + '</pre>' : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var user = userEl.value.trim();
    var password = pwdEl.value.trim();
    var btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = '测试中…';
    status.className = 'buning_202_status';

    fetch('/api/buning_202_db/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: user, password: password })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        console.log('[buning_202_db/test]', data);
        if (data.code === 0) {
          showStatus(true, data.msg, JSON.stringify(data, null, 2));
        } else {
          showStatus(false, data.msg, JSON.stringify(data, null, 2));
        }
      })
      .catch(function (err) {
        console.error('[buning_202_db/test]', err);
        showStatus(false, '请求失败：' + err.message);
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = '测试连接';
      });
  });
})();
