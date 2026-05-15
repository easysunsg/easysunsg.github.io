# ChromaDB 基础与进阶指南

## 概述

ChromaDB 是目前业界最主流、最成熟的开源向量数据库之一，定位为 **AI Application Database**。它帮助开发者高效地存储、检索、管理向量，为 RAG、搜索或智能问答系统提供底层能力。

**核心能力：**
- 嵌入向量存储
- 向量搜索（Vector Search）
- 全文检索（Full-text Search）
- 文档存储（Document Storage）
- 元数据过滤（Metadata Filtering）
- 多模态检索（Multi-modal Retrieval）

## 快速开始

### 安装

```bash
pip install chromadb
```

### 基本操作

```python
import chromadb

# 创建客户端
chroma_client = chromadb.Client()

# 创建 Collection
collection = chroma_client.create_collection(name="my_collection")

# 添加数据
collection.add(
    ids=["id1", "id2"],
    documents=[
        "This is a document about pineapple",
        "This is a document about oranges"
    ]
)

# 查询
results = collection.query(
    query_texts=["This is a query document about hawaii"],
    n_results=2
)
print(results)
```

## 运行模式

### 1. Ephemeral Client（临时客户端）

内存中运行，适合 Notebook/实验：

```python
client = chromadb.EphemeralClient()
```

### 2. Persistent Client（持久化客户端）

数据保存到本地磁盘：

```python
client = chromadb.PersistentClient(path="/path/to/save/to")
```

### 3. Client-Server 模式

启动服务器：
```bash
chroma run --path /db_path
```

客户端连接：
```python
chroma_client = chromadb.HttpClient(host='localhost', port=8000)
```

异步版本：
```python
async def main():
    client = await chromadb.AsyncHttpClient()
```

### 4. Docker 部署

```bash
docker run -v ./chroma-data:/data -p 8000:8000 chromadb/chroma
```

### 5. Cloud Client

```python
client = CloudClient(
    tenant='Tenant ID',
    database='Database name',
    api_key='Chroma Cloud API key'
)
```

## Collection 管理

### 创建 Collection

```python
collection = client.create_collection(
    name="my_collection",
    embedding_function=OpenAIEmbeddingFunction(
        api_key=os.getenv("OPENAI_API_KEY"),
        model_name="text-embedding-3-small"
    ),
    metadata={
        "description": "my first Chroma collection",
        "created": str(datetime.now())
    }
)
```

### 获取 Collection

```python
# 获取已存在的
collection = client.get_collection(name="my-collection")

# 不存在则创建
collection = client.get_or_create_collection(
    name="my-collection",
    metadata={"description": "..."}
)

# 列出所有
collections = client.list_collections()
```

### 修改与删除

```python
# 修改
collection.modify(name="new-name", metadata={"description": "new description"})

# 删除
client.delete_collection(name="my-collection")
```

### 便捷方法

```python
collection.count()  # 记录数量
collection.peek()   # 前 10 条记录
```

## 数据 CRUD

### 添加数据

```python
collection.add(
    ids=["id1", "id2", "id3"],
    documents=["doc1", "doc2", "doc3"],
    metadatas=[{"chapter": 3, "verse": 16}, {"chapter": 3, "verse": 5}, ...],
)
```

### 更新数据

```python
collection.update(
    ids=["id1", "id2"],
    documents=["new_doc1", "new_doc2"],
    metadatas=[{"chapter": 3, "verse": 16}, {"chapter": 3, "verse": 5}],
)
```

### Upsert（存在则更新，不存在则创建）

```python
collection.upsert(
    ids=["id1", "id2", "id3"],
    documents=["doc1", "doc2", "doc3"],
)
```

### 删除数据

```python
collection.delete(ids=["id1", "id2", "id3"])

# 带条件删除
collection.delete(ids=["id1"], where={"chapter": "20"})
```

### 查询数据

```python
# 基础查询
collection.query(query_texts=["thus spake zarathustra"])

# 指定返回数量
collection.query(query_texts=["query"], n_results=5)

# 限制 ID 范围
collection.query(query_texts=["query"], n_results=5, ids=["id1", "id2"])

# 获取记录
collection.get(ids=["id1", "id2"], limit=100, offset=0)
```

## 元数据过滤

### 基本过滤

```python
# 等值过滤
collection.query(
    query_texts=["query"],
    where={"page": 10}
)

# 比较操作符
collection.query(
    query_texts=["query"],
    where={"page": {"$gt": 10}}
)
```

### 逻辑操作符

```python
# AND 条件
collection.query(
    query_texts=["query"],
    where={
        "$and": [
            {"page": {"$gte": 5}},
            {"page": {"$lte": 10}}
        ]
    }
)

# OR 条件
collection.get(
    where={
        "or": [
            {"color": "red"},
            {"color": "blue"}
        ]
    }
)
```

### 包含操作符

```python
# $in
collection.get(where={"author": {"$in": ["Rowling", "Fitzgerald"]}})

# $nin
collection.get(where={"author": {"$nin": ["Rowling", "Fitzgerald"]}})
```

## 全文检索与正则

```python
# 包含字符串
collection.get(where_document={"$contains": "search string"})

# 正则匹配
collection.get(where_document={"$regex": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"})

# 组合条件
collection.query(
    query_texts=["query"],
    where={"metadata_field": "value"},
    where_document={"$contains": "search_string"}
)
```

## HNSW 索引配置（单节点）

```python
collection = client.create_collection(
    name="my-collection",
    configuration={
        "hnsw": {
            "space": "cosine",           # 距离函数
            "ef_construction": 200,       # 建索引候选数
            "ef_search": 100,            # 查询候选数
            "max_neighbors": 16,         # 最大邻居数
            "num_threads": -1,            # 线程数
            "batch_size": 100,
            "sync_threshold": 1000,
            "resize_factor": 1.2
        }
    }
)
```

**参数说明：**

| 参数 | 说明 | 默认值 |
|------|------|--------|
| space | 距离函数（l2/ip/cosine） | l2 |
| ef_construction | 建索引候选数，越大越精准但越慢 | 100 |
| ef_search | 查询候选数，越大越精准但越慢 | 100 |
| max_neighbors | 最大邻居数 | 16 |

## SPANN 索引配置（分布式/Cloud）

| 参数 | 说明 | 默认值 |
|------|------|--------|
| space | 距离函数 | l2 |
| search_nprobe | 查询探测数，越大越准越慢 | 64 |
| write_nprobe | 写入探测数 | 64 |
| ef_construction | 建索引候选数 | 200 |
| ef_search | 查询候选数 | 200 |
| max_neighbors | 最大邻居数 | 64 |

## Embedding Function 配置

```python
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction, CohereEmbeddingFunction

# OpenAI
collection = client.create_collection(
    name="my_collection",
    embedding_function=OpenAIEmbeddingFunction(model_name="text-embedding-3-small")
)

# Cohere
cohere_collection = client.get_or_create_collection(
    name="my_cohere_collection",
    configuration={
        "embedding_function": CohereEmbeddingFunction(
            model_name="embed-english-light-v2.0",
            truncate="NONE"
        )
    }
)
```

## 距离函数

| 距离 | 参数 | 公式 | 适用场景 |
|------|------|------|----------|
| 平方 L2 | l2 | ∑(Aᵢ - Bᵢ)² | 几何距离 |
| 内积 | ip | 1.0 - ∑(Aᵢ × Bᵢ) | 推荐系统 |
| 余弦相似度 | cosine | 1.0 - (∑AᵢBᵢ)/(√∑Aᵢ² × √∑Bᵢ²) | 文本 embedding |
