/**
 * 姓名：卜宁 | 学号：24001010202 | 时间：2026-11-23 | 大模型：DeepSeek-V4-Flash
 * 知识库：上传 / 列表 / 删除 / 选中知识库供问答使用
 */
(function () {
  'use strict';
  var drop = document.getElementById('kb_drop');
  var fileInput = document.getElementById('kb_file');
  var listEl = document.getElementById('kb_list');
  var statusEl = document.getElementById('kb_status');
  var activeKbId = null;

  function setStatus(t, isErr) {
    statusEl.textContent = t || '';
    statusEl.style.color = isErr ? '#fca5a5' : '#7dd3fc';
  }

  drop.addEventListener('click', function () { fileInput.click(); });
  drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', function () { drop.classList.remove('over'); });
  drop.addEventListener('drop', function (e) {
    e.preventDefault();
    drop.classList.remove('over');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) upload(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', function () {
    if (fileInput.files && fileInput.files[0]) upload(fileInput.files[0]);
    fileInput.value = '';
  });

  function upload(file) {
    var fd = new FormData();
    fd.append('file', file);
    setStatus('正在上传并解析：' + file.name + ' …');
    fetch('/api/buning_202_kb/upload', { method: 'POST', body: fd })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        console.log('[kb upload]', data);
        if (data.code === 0) {
          setStatus('✅ 已入库：' + file.name + '，分块 ' + data.data.chunkCount + ' 个');
          loadList();
        } else {
          setStatus('❌ ' + (data.msg || '上传失败'), true);
        }
      })
      .catch(function (err) {
        console.error('[kb upload] 失败', err);
        setStatus('❌ 上传失败：' + err.message, true);
      });
  }

  function loadList() {
    fetch('/api/buning_202_kb/list')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.code !== 0) { setStatus('读取知识库列表失败：' + data.msg, true); return; }
        listEl.innerHTML = '';
        if (!data.data.length) {
          listEl.innerHTML = '<p class="kb_hint">还没有知识库文件，先上传一个吧</p>';
          return;
        }
        data.data.forEach(function (kb) {
          var item = document.createElement('div');
          item.className = 'kb_item' + (activeKbId === kb.id ? ' active' : '');
          var wrap = document.createElement('div');
          wrap.innerHTML = '<div class="nm">' + kb.name + '</div>' +
            '<div class="mt">' + kb.filename + ' · ' + kb.chunk_count + ' 块 · ' + (kb.created_at || '').toString().slice(0, 19) + '</div>';
          var del = document.createElement('button');
          del.className = 'kb_del';
          del.textContent = '删除';
          del.addEventListener('click', function (e) {
            e.stopPropagation();
            if (!confirm('确定删除「' + kb.name + '」？')) return;
            fetch('/api/buning_202_kb/' + kb.id, { method: 'DELETE' })
              .then(function (r) { return r.json(); })
              .then(function (d) {
                if (d.code === 0) { if (activeKbId === kb.id) activeKbId = null; loadList(); setStatus('已删除'); }
                else setStatus('删除失败：' + d.msg, true);
              });
          });
          item.appendChild(wrap);
          item.appendChild(del);
          item.addEventListener('click', function () {
            activeKbId = (activeKbId === kb.id) ? null : kb.id;
            loadList();
            setStatus(activeKbId ? ('当前知识库：' + kb.name) : '已切换为「全部知识库」');
          });
          listEl.appendChild(item);
        });
      })
      .catch(function (err) { console.error(err); setStatus('读取列表失败', true); });
  }

  // 供 chat.js 读取当前选中的知识库
  window.__BN_KB_ID__ = function () { return activeKbId; };

  loadList();
})();
