/**
 * 姓名：卜宁 | 学号：24001010202 | 时间：2026-11-19 | 大模型：DeepSeek
 * news.html 逻辑 —— 科技新闻分页列表
 */
(function () {
  'use strict';

  var listEl = document.getElementById('buning_202_news_list');
  var pagerEl = document.getElementById('buning_202_news_pager');
  var buning_202_page = 1;
  var buning_202_size = 10;
  var buning_202_total = 0;

  function buning_202_fetchNews() {
    listEl.innerHTML = '<div class="buning_202_loading">加载中…</div>';
    pagerEl.innerHTML = '';

    fetch('/api/buning_202_news/list?page=' + buning_202_page + '&size=' + buning_202_size)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        console.log('[buning_202_news/list]', data);
        if (data.code !== 0) {
          listEl.innerHTML = '<div class="buning_202_error">' + data.msg + '</div>';
          return;
        }
        buning_202_total = data.data.total;
        buning_202_render(data.data.rows);
        buning_202_renderPager();
      })
      .catch(function (err) {
        console.error('[buning_202_news/list]', err);
        listEl.innerHTML = '<div class="buning_202_error">请求失败：' + err.message + '</div>';
      });
  }

  function buning_202_render(rows) {
    if (!rows || rows.length === 0) {
      listEl.innerHTML = '<div class="buning_202_empty">暂无新闻</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var cats = r.buning_202_category || '科技';
      var author = r.buning_202_author || '未知';
      var time = (r.buning_202_publish_time || '').slice(0, 16).replace('T', ' ');
      var views = r.buning_202_views || 0;
      var summary = r.buning_202_summary || r.buning_202_content || '';
      if (summary.length > 140) summary = summary.slice(0, 140) + '…';

      html += '<div class="buning_202_news_item">' +
        '<h3>' + escapeHtml(r.buning_202_title) + '</h3>' +
        '<p>' + escapeHtml(summary) + '</p>' +
        '<div class="buning_202_news_meta">' +
        '<span class="buning_202_cat">' + escapeHtml(cats) + '</span>' +
        '<span>📝 ' + escapeHtml(author) + '</span>' +
        '<span>👁 ' + views + '</span>' +
        '<span>🕐 ' + time + '</span>' +
        '</div></div>';
    }
    listEl.innerHTML = html;
  }

  function buning_202_renderPager() {
    var totalPages = Math.max(1, Math.ceil(buning_202_total / buning_202_size));
    var html = '';
    html += '<button id="buning_202_prev"' + (buning_202_page <= 1 ? ' disabled' : '') + '>← 上一页</button>';
    html += '<span class="buning_202_page_info">第 ' + buning_202_page + ' / ' + totalPages + ' 页 · 共 ' + buning_202_total + ' 条</span>';
    html += '<button id="buning_202_next"' + (buning_202_page >= totalPages ? ' disabled' : '') + '>下一页 →</button>';
    pagerEl.innerHTML = html;

    document.getElementById('buning_202_prev').addEventListener('click', function () {
      if (buning_202_page > 1) { buning_202_page--; buning_202_fetchNews(); }
    });
    document.getElementById('buning_202_next').addEventListener('click', function () {
      if (buning_202_page < totalPages) { buning_202_page++; buning_202_fetchNews(); }
    });
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  buning_202_fetchNews();
})();
