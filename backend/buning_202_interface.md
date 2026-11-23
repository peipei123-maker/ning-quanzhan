# 接口记录（只追加，不覆盖）

| 接口路径 | 方法 | 请求参数 | 响应格式 | 修改时间 |
|---|---|---|---|---|
| /api/buning_202_health | GET | 无 | `{"code":0,"msg":"服务与数据库正常","data":{"db":true}}` | 2026-11-19 |
| /api/buning_202_news/list | GET | page(可选,默认1)、size(可选,默认10) | `{"code":0,"msg":"ok","data":{"total":8,"page":1,"size":10,"rows":[...]}}` | 2026-11-19 |
| /api/buning_202_db/test | POST | `{"user":"root","password":"root"}` | 成功 `{"code":0,"msg":"数据库连接成功","data":{"user":"root"}}`；失败 `{"code":500,"msg":"连接失败：...","data":null}` | 2026-11-19 |
| /api/buning_202_gallery/list | GET | page(可选,默认1)、size(可选,默认12)、tag(可选,按标签过滤) | `{"code":0,"msg":"ok","data":{"total":8,"page":1,"size":12,"tag":"","rows":[...]}}` | 2026-11-19 |
| /api/buning_202_gallery/like/:id | POST | 路径参数 id（画廊记录主键） | 成功 `{"code":0,"msg":"ok","data":{"affected":1}}`；失败 `{"code":500,"msg":"...","data":null}` | 2026-11-19 |
| /api/buning_202_chat | POST | `{"message":"你好"}` | 成功 `{"code":0,"msg":"ok","data":{"answer":"...","model":"deepseek-ai/DeepSeek-V4-Flash","usage":{...}}}`；失败 `{"code":500,"msg":"请求大模型失败：...","data":null}` | 2026-11-23 |
| /api/buning_202_service | POST | `{"message":"怎么修改手机号"}` | 成功 `{"code":0,"msg":"ok","data":{"answer":"...","model":"qiniu/conatus-free","usage":{...}}}`；失败 `{"code":500,"msg":"七牛接口返回错误：...","data":null}` | 2026-11-23 |
