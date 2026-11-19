# 接口记录（只追加，不覆盖）

| 接口路径 | 方法 | 请求参数 | 响应格式 | 修改时间 |
|---|---|---|---|---|
| /api/buning_health | GET | 无 | `{"code":0,"msg":"服务与数据库正常","data":{"db":true}}` | 2026-11-19 |
| /api/buning_news/list | GET | page(可选,默认1)、size(可选,默认10) | `{"code":0,"msg":"ok","data":{"total":8,"page":1,"size":10,"rows":[...]}}` | 2026-11-19 |
| /api/buning_db/test | POST | `{"user":"root","password":"root"}` | 成功 `{"code":0,"msg":"数据库连接成功","data":{"user":"root"}}`；失败 `{"code":500,"msg":"连接失败：...","data":null}` | 2026-11-19 |
