/**
 * 姓名：卜宁 | 学号：24001010202 | 时间：2026-11-19 | 大模型：DeepSeek
 * gallery.html 逻辑 —— 图文画廊 + 标签过滤 + 点赞
 */
(function () {
  'use strict';

  var listEl = document.getElementById('buning_202_gallery_list');
  var tagsEl = document.getElementById('buning_202_gallery_tags');
  var buning_202_currentTag = '';
  var buning_202_likedIds = {};

  function buning_202_fetchGallery() {
    listEl.innerHTML = '<div class="buning_202_loading">加载中…</div>';
    var url = '/api/buning_202_gallery/list?size=20';
    if (buning_202_currentTag) url += '&tag=' + encodeURIComponent(buning_202_currentTag);

    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        console.log('[buning_202_gallery/list]', data);
        if (data.code !== 0) {
          listEl.innerHTML = '<div class="buning_202_error">' + data.msg + '</div>';
          return;
        }
        buning_202_renderTags(data.data.rows);
        buning_202_render(data.data.rows);
      })
      .catch(function (err) {
        console.error('[buning_202_gallery/list]', err);
        listEl.innerHTML = '<div class="buning_202_error">请求失败：' + err.message + '</div>';
      });
  }

  function buning_202_renderTags(rows) {
    var tagsSet = {};
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].buning_202_tag) tagsSet[rows[i].buning_202_tag] = true;
    }
    var html = '<button data-tag="" class="' + (buning_202_currentTag === '' ? 'buning_202_active' : '') + '">全部</button>';
    for (var t in tagsSet) {
      html += '<button data-tag="' + escapeAttr(t) + '" class="' + (buning_202_currentTag === t ? 'buning_202_active' : '') + '">' + escapeHtml(t) + '</button>';
    }
    tagsEl.innerHTML = html;

    var btns = tagsEl.querySelectorAll('button');
    for (var j = 0; j < btns.length; j++) {
      btns[j].addEventListener('click', function () {
        buning_202_currentTag = this.getAttribute('data-tag');
        buning_202_fetchGallery();
      });
    }
  }

  function buning_202_render(rows) {
    if (!rows || rows.length === 0) {
      listEl.innerHTML = '<div class="buning_202_empty">暂无图文</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var desc = r.buning_202_desc || '';
      if (desc.length > 60) desc = desc.slice(0, 60) + '…';
      var liked = buning_202_likedIds[r.buning_202_id];
      html += '<div class="buning_202_gallery_item">' +
        '<img src="' + escapeAttr(r.buning_202_image) + '" alt="" onerror="this.src=\'https://picsum.photos/seed/fallback/600/400\'" />' +
        '<div class="buning_202_gallery_body">' +
        '<h3>' + escapeHtml(r.buning_202_title) + '</h3>' +
        '<p>' + escapeHtml(desc) + '</p>' +
        '<div class="buning_202_gallery_foot">' +
        '<span class="buning_202_tag">' + escapeHtml(r.buning_202_tag || '未分类') + '</span>' +
        '<button class="buning_202_like' + (liked ? ' buning_202_liked' : '') + '" data-id="' + r.buning_202_id + '">' +
        '❤ ' + (r.buning_202_likes || 0) +
        '</button></div></div></div>';
    }
    listEl.innerHTML = html;

    var likes = listEl.querySelectorAll('.buning_202_like');
    for (var j = 0; j < likes.length; j++) {
      likes[j].addEventListener('click', function (e) {
        e.stopPropagation();
        buning_202_like(this);
      });
    }
  }

  function buning_202_like(btn) {
    var id = btn.getAttribute('data-id');
    if (buning_202_likedIds[id]) {
      return;
    }
    fetch('/api/buning_202_gallery/like/' + id, { method: 'POST' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        console.log('[buning_202_gallery/like]', data);
        if (data.code === 0) {
          buning_202_likedIds[id] = true;
          btn.classList.add('buning_202_liked');
          var num = parseInt(btn.textContent.replace(/[^\d]/g, ''), 10) + 1;
          btn.textContent = '❤ ' + num;
        }
      })
      .catch(function (err) {
        console.error('[buning_202_gallery/like]', err);
      });
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }
  function escapeAttr(s) {
    return (s || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  buning_202_fetchGallery();
})();
