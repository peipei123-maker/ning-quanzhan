# 数据库记录（只追加，不覆盖；仅凭本文件即可重建库）
-- 姓名：卜宁 | 学号：24001010202 | 创建时间：2026-11-19

## 1. 建库
```sql
CREATE DATABASE IF NOT EXISTS buning_202_technews
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE buning_202_technews;
```

## 2. 科技新闻表
```sql
CREATE TABLE IF NOT EXISTS buning_202_news (
  buning_202_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  buning_202_title VARCHAR(200) NOT NULL,
  buning_202_summary VARCHAR(500) DEFAULT '',
  buning_202_content TEXT,
  buning_202_author VARCHAR(50) DEFAULT '',
  buning_202_category VARCHAR(50) DEFAULT '科技',
  buning_202_cover VARCHAR(255) DEFAULT '',
  buning_202_views INT UNSIGNED DEFAULT 0,
  buning_202_publish_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 3. 科技新闻测试数据（8 条）
```sql
INSERT INTO buning_202_news (buning_202_title, buning_202_summary, buning_202_content, buning_202_author, buning_202_category, buning_202_cover, buning_202_views) VALUES
('国产大模型再添力军：百度文心一言 4.0 发布', '百度在 2026 年秋季发布会上正式推出文心一言 4.0，参数量达万亿级，多模态能力全面升级。', '百度文心一言 4.0 采用了全新的 MoE 架构，参数量突破万亿，在中文理解、代码生成、多模态推理等方面均有显著提升。官方测试显示，其在 C-Eval 中文评测集上的得分超过 92 分。', '科技日报', '人工智能', '', 15820),
('马斯克宣布特斯拉 Robotaxi 明年商业化', '特斯拉 FSD V15 已经在奥斯汀、凤凰城完成最后测试，最快 2027 年 Q1 推出无人驾驶出租车服务。', '在特斯拉投资者日活动上，马斯克展示了 Robotaxi 的最新路测视频。这辆没有方向盘的车型已经在美国多个城市进行了超过 200 万公里的无保护测试。', '36氪', '智能驾驶', '', 23410),
('华为 Mate 70 系列销量破千万，芯片自研再获突破', 'Mate 70 系列上市仅 6 周全球发货量突破 1200 万台，麒麟 9010 处理器实现 5nm 工艺量产。', '华为在深圳举办了庆功发布会，确认 Mate 70 系列全系搭载的麒麟 9010 处理器已在国内代工厂完成 5nm 制程量产，打破了外部技术封锁。', '虎嗅网', '手机硬件', '', 30120),
('量子计算机里程碑：IBM 1121 量子处理器上线', 'IBM 最新发布的 Heron 处理器拥有 1121 个量子比特，错误率降低至百万分之三，首次实现实用化计算能力。', 'IBM 研究团队在 Nature 上发表了 Heron 的详细数据。在特定的分子模拟任务上，它的计算速度已经超过经典超算 1000 倍。', '果壳网', '量子计算', '', 8920),
('国产航母福建舰完成电磁弹射全流程海试', '我国第三艘航母福建舰在南海执行了第 8 次海试，成功完成舰载机电磁弹射起飞和回收的全部科目。', '福建舰采用直通甲板设计，配备 3 条电磁弹射器和 2 部电磁拦阻装置。此次海试标志着其核心作战系统基本成熟。', '环球网', '国防科技', '', 19870),
('OpenAI 发布 Sora 2：视频生成进入分钟级', 'OpenAI 新一代视频生成模型 Sora 2 支持最长 4 分钟 4K 视频生成，物理一致性大幅提升。', 'Sora 2 在保持高画质的同时，显著降低了幻觉镜头比例。开发者可以通过 API 申请调用，每 10 秒视频成本约 0.12 美元。', '新智元', '人工智能', '', 27540),
('SpaceX 星舰第 25 次试飞成功回收两级', 'Starship 完成史上首次两级同时海上垂直回收，全面实现可重复使用目标。', '此次试飞中，超重型助推器和星舰上面级分别成功落在回收船上，为未来每周多次发射奠定了技术基础。', '界面新闻', '航天科技', '', 35210),
('中芯国际 3nm 工艺试产成功，良率达 75%', '中芯国际宣布 3nm FinFET 工艺已完成客户导入，首批量产芯片预计明年 Q2 交付。', '这是中国大陆第一条自主可控的 3nm 产线，主要面向国内 AI 芯片和高性能计算市场，年产能规划为 36 万片晶圆。', '半导体行业观察', '芯片制造', '', 21080);
```

## 4. 图文画廊表
```sql
CREATE TABLE IF NOT EXISTS buning_202_gallery (
  buning_202_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  buning_202_title VARCHAR(200) NOT NULL,
  buning_202_desc VARCHAR(500) DEFAULT '',
  buning_202_image VARCHAR(255) DEFAULT '',
  buning_202_tag VARCHAR(50) DEFAULT '',
  buning_202_likes INT UNSIGNED DEFAULT 0,
  buning_202_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 5. 图文画廊测试数据（8 条）
```sql
INSERT INTO buning_202_gallery (buning_202_title, buning_202_desc, buning_202_image, buning_202_tag, buning_202_likes) VALUES
('极光下的城市', '挪威特罗姆瑟的冬夜，绿色极光与灯火通明的城市交相辉映。', 'https://picsum.photos/seed/aurora/600/400', '自然', 1234),
('深海珊瑚礁', '太平洋大堡礁的多彩水下世界，珊瑚与热带鱼共生。', 'https://picsum.photos/seed/coral/600/400', '自然', 892),
('赛博都市夜景', '未来感十足的霓虹街区，仿佛走进了赛博朋克世界。', 'https://picsum.photos/seed/cyber/600/400', '科幻', 2156),
('沙漠星空', '撒哈拉沙漠夜晚的银河，远离光污染的纯净星空。', 'https://picsum.photos/seed/desert/600/400', '自然', 3421),
('雪山日出', '珠穆朗玛峰大本营拍摄的日照金山，金色阳光洒在雪顶。', 'https://picsum.photos/seed/sunrise/600/400', '自然', 1876),
('粒子碰撞模拟', '大型强子对撞机中粒子碰撞的可视化图像，展现微观世界之美。', 'https://picsum.photos/seed/particle/600/400', '科学', 543),
('机器人实验室', '波士顿动力的人形机器人 Atlas 在实验室中完成后空翻动作。', 'https://picsum.photos/seed/robot/600/400', '科技', 2890),
('宇航员的地球', '国际空间站视角下的蓝色星球，云层与陆地清晰可见。', 'https://picsum.photos/seed/earth/600/400', '航天', 4532);
```
