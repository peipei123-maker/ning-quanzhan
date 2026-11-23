/**
 * 姓名：卜宁 | 学号：24001010202 | 时间：2026-11-23 | 大模型：DeepSeek-V4-Flash
 * AI 聊天页逻辑
 */
(function () {
  'use strict';
  var bodyEl = document.getElementById('buning_202_chat_body');
  var form = document.getElementById('buning_202_chat_form');
  var input = document.getElementById('buning_202_chat_input');
  var sendBtn = document.getElementById('buning_202_chat_send');
  var tip = document.getElementById('buning_202_chat_tip');
  var API = window.__BN_API__ || '/api/buning_202_chat';

  function addMsg(text, role) {
    var wrap = document.createElement('div');
    wrap.className = 'buning_202_msg buning_202_msg_' + role;
    var bubble = document.createElement('div');
    bubble.className = 'buning_202_bubble';
    bubble.textContent = text;
    wrap.appendChild(bubble);
    bodyEl.appendChild(wrap);
    bodyEl.scrollTop = bodyEl.scrollHeight;
    return bubble;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text || sendBtn.disabled) return;

    addMsg(text, 'user');
    input.value = '';
    sendBtn.disabled = true;
    tip.textContent = '正在请求大模型…';
    var pending = addMsg('思考中…', 'ai');

    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, kbId: (window.__BN_KB_ID__ ? window.__BN_KB_ID__() : null) })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        console.log('[chat] 后端返回', data);
        if (data.code === 0 && data.data && data.data.answer) {
          pending.textContent = data.data.answer;
          if (data.data.sources && data.data.sources.length) {
            var src = document.createElement('div');
            src.className = 'kb_src';
            src.innerHTML = '出处：' + data.data.sources.map(function (s) {
              return '<b>' + s.kb + '</b> 第' + s.seq + '段（相似度 ' + s.score + '）';
            }).join('　·　');
            pending.appendChild(src);
          }
          var u = data.data.usage;
          tip.textContent = u ? ('用量：prompt ' + u.prompt_tokens + ' / completion ' + u.completion_tokens + '，收发数据见后端控制台')
                              : '回答完成，收发数据见后端控制台';
        } else {
          pending.parentElement.className = 'buning_202_msg buning_202_msg_err';
          pending.textContent = '出错了：' + (data.msg || '未知错误');
          tip.textContent = '请求失败，详见后端控制台';
        }
      })
      .catch(function (err) {
        console.error('[chat] 请求失败', err);
        pending.parentElement.className = 'buning_202_msg buning_202_msg_err';
        pending.textContent = '请求失败：' + err.message + '（确认已运行 qidong.bat）';
        tip.textContent = '请求失败';
      })
      .finally(function () {
        sendBtn.disabled = false;
        input.focus();
      });
  });

  var quick = document.getElementById('buning_202_quick');
  if (quick) {
    Array.prototype.forEach.call(quick.querySelectorAll('button'), function (b) {
      b.addEventListener('click', function () {
        input.value = b.textContent;
        form.dispatchEvent(new Event('submit', { cancelable: true }));
      });
    });
  }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });
})();
