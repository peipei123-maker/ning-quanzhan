# 数据库记录（只追加，不覆盖；仅凭本文件即可重建库）
-- 姓名：卜宁 | 学号：24001010202 | 创建时间：2026-11-19

## 1. 建库
```sql
CREATE DATABASE IF NOT EXISTS buning_technews
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE buning_technews;
```

## 2. 科技新闻表
```sql
CREATE TABLE IF NOT EXISTS buning_news (
  buning_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  buning_title VARCHAR(200) NOT NULL,
  buning_summary VARCHAR(500) DEFAULT '',
  buning_content TEXT,
  buning_author VARCHAR(50) DEFAULT '',
  buning_category VARCHAR(50) DEFAULT '科技',
  buning_cover VARCHAR(255) DEFAULT '',
  buning_views INT UNSIGNED DEFAULT 0,
  buning_publish_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```
