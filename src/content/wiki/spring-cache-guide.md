---
title: Spring Cache 实战指南：如何在 Spring Boot 中优雅地使用缓存
description: 深入探讨 Spring Cache 的使用方法、配置细节以及最佳实践，集成 Redis 实现高效缓存
pubDate: 2026-04-02
tags:
  - Spring Boot
  - Spring Cache
  - Redis
  - 性能优化
  - 后端开发
draft: false
---

# Spring Cache 实战指南：如何在 Spring Boot 中优雅地使用缓存

在现代应用开发中，性能优化是一个至关重要的环节。缓存是提高系统性能的有效手段之一，可以显著减少数据库访问次数，降低响应时间。Spring Boot 提供了强大的缓存支持，通过 Spring Cache 抽象层，可以轻松地集成各种缓存实现，如 Redis、Ehcache 等。本文将深入探讨 Spring Cache 的使用方法、配置细节以及最佳实践。

---

## 什么是 Spring Cache

Spring Cache 是 Spring 框架提供的一个抽象层，用于简化缓存的使用。它允许开发者通过注解的方式声明缓存行为，而无需关心具体的缓存实现细节。Spring Cache 支持多种缓存实现，包括：

- **ConcurrentMapCacheManager**：基于 ConcurrentHashMap 的简单缓存实现
- **EhCacheCacheManager**：基于 Ehcache 的缓存实现
- **RedisCacheManager**：基于 Redis 的缓存实现
- **CaffeineCacheManager**：基于 Caffeine 的缓存实现
- **JCacheCacheManager**：基于 JCache (JSR-107) 的缓存实现

---

## 使用步骤

### 启用 Spring Cache

在 Spring Boot 项目中启用缓存非常简单，只需在主类或配置类上添加 `@EnableCaching` 注解：

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class CacheApplication {
    public static void main(String[] args) {
        SpringApplication.run(CacheApplication.class, args);
    }
}
```

### 配置缓存

**配置 Redis 作为缓存存储**

假设我们要使用 Redis 作为缓存存储，首先需要在 pom.xml 中添加 Spring Data Redis 依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

然后在 application-dev.yml 文件中配置 Redis 连接信息：

```yml
spring:
  data:
    redis:
      # redis 单机环境配置
      host: 192.168.200.157
      port: 6370
      password: redis_Q54R5F
      database: 0
  cache:
    type: redis
    redis:
      # 设置缓存项的过期时间（以毫秒为单位）
      time-to-live: 3600000
      # 设置缓存键的前缀
      key-prefix: CACHE_
      # 指定是否使用缓存键前缀
      use-key-prefix: true
      # 指定是否缓存空值
      cache-null-values: true
```

---

## Spring Cache 注解详解

Spring Cache 提供了多个注解来声明缓存行为，以下是常用的几个注解及其详细解释。

### @Cacheable

- **作用**：用于标记一个方法，当方法被调用时，Spring 会检查缓存中是否存在指定的键值对。如果存在，则直接返回缓存中的值，而不调用实际的方法；如果不存在，则调用方法并将结果存入缓存。
- **参数**：
  - `value`：缓存的名称
  - `key`：缓存的键，可以使用 SpEL 表达式
  - `condition`：指定缓存条件，使用 SpEL 表达式
  - `unless`：指定不缓存的条件，使用 SpEL 表达式
- **示例**：

```java
@Cacheable(value = "users", key = "#id", condition = "#id != null")
public User getUserById(Long id) {
    return userRepository.findById(id);
}
```

### @CachePut

- **作用**：用于标记一个方法，该方法始终会被调用，并且其返回值会被存入缓存。通常用于更新缓存中的数据。
- **参数**：
  - `value`：缓存的名称
  - `key`：缓存的键，可以使用 SpEL 表达式
  - `condition`：指定缓存条件，使用 SpEL 表达式
  - `unless`：指定不缓存的条件，使用 SpEL 表达式
- **示例**：

```java
@CachePut(value = "users", key = "#user.id")
public User updateUser(User user) {
    System.out.println("更新缓存中的用户信息");
    return userRepository.update(user);
}
```

### @CacheEvict

- **作用**：用于标记一个方法，该方法被调用时，会从缓存中删除指定的键值对。通常用于删除缓存中的数据。
- **参数**：
  - `value`：缓存的名称
  - `key`：缓存的键，可以使用 SpEL 表达式
  - `allEntries`：是否删除缓存中的所有条目
  - `condition`：指定删除条件，使用 SpEL 表达式
- **示例**：

```java
@CacheEvict(value = "users", key = "#id")
public void deleteUser(Long id) {
    System.out.println("从缓存中删除用户信息");
    userRepository.deleteById(id);
}

@CacheEvict(value = "users", allEntries = true)
public void clearAllCache() {
    System.out.println("清除所有缓存");
}
```

### @CacheConfig

- **作用**：用于类级别的缓存配置，可以指定默认的缓存名称、键生成器等。
- **示例**：

```java
@CacheConfig(cacheNames = "users")
public class UserService {
    // 方法级别的缓存注解
}
```

---

## 完整示例

### 创建实体类

```java
import java.io.Serializable;

public class User implements Serializable {
    private Long id;
    private String name;
    private Integer age;

    public User() {}

    public User(Long id, String name, Integer age) {
        this.id = id;
        this.name = name;
        this.age = age;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }
}
```

### 创建 Repository 接口

```java
import org.springframework.stereotype.Repository;
import java.util.HashMap;
import java.util.Map;

@Repository
public class UserRepository {
    private Map<Long, User> userMap = new HashMap<>();

    public User save(User user) {
        userMap.put(user.getId(), user);
        return user;
    }

    public User findById(Long id) {
        return userMap.get(id);
    }

    public void deleteById(Long id) {
        userMap.remove(id);
    }

    public User update(User user) {
        if (userMap.containsKey(user.getId())) {
            userMap.put(user.getId(), user);
            return user;
        }
        return null;
    }
}
```

### 创建 Service 类

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Cacheable(value = "users", key = "#id")
    public User getUserById(Long id) {
        System.out.println("从数据库中获取用户信息");
        return userRepository.findById(id);
    }

    @CachePut(value = "users", key = "#user.id")
    public User updateUser(User user) {
        System.out.println("更新缓存中的用户信息");
        return userRepository.update(user);
    }

    @CacheEvict(value = "users", key = "#id")
    public void deleteUser(Long id) {
        System.out.println("从缓存中删除用户信息");
        userRepository.deleteById(id);
    }

    @CacheEvict(value = "users", allEntries = true)
    public void clearAllCache() {
        System.out.println("清除所有缓存");
    }

    public User saveUser(User user) {
        System.out.println("保存用户信息到数据库");
        return userRepository.save(user);
    }
}
```

### 创建 Controller 类

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PostMapping
    public User saveUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    @PutMapping
    public User updateUser(@RequestBody User user) {
        return userService.updateUser(user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @DeleteMapping("/clear")
    public void clearAllCache() {
        userService.clearAllCache();
    }
}
```

### 测试缓存功能

启动应用后，你可以使用 Postman 或浏览器来测试 API：

1. **保存用户**：发送 POST 请求到 `/users`，请求体为 JSON 格式的用户信息
2. **获取用户**：发送 GET 请求到 `/users/{id}`，查看是否从缓存中获取数据
3. **更新用户**：发送 PUT 请求到 `/users`，请求体为更新后的用户信息
4. **删除用户**：发送 DELETE 请求到 `/users/{id}`，查看缓存是否被删除
5. **清除所有缓存**：发送 DELETE 请求到 `/users/clear`，清除所有缓存数据

> **案例地址**：https://github.com/easysunsg/cache.git

---

## 总结

通过本文的介绍，你已经学会了如何在 Spring Boot 项目中集成 Spring Cache 并使用 Redis 作为缓存存储。通过使用注解，可以方便地实现数据的增删改查操作，并且能够有效地利用缓存来提高系统的性能。

Spring Cache 的核心优势在于：
- **声明式缓存**：通过注解轻松实现缓存逻辑
- **解耦实现**：可随时切换不同的缓存实现
- **SpEL 表达式**：灵活配置缓存键和条件
- **自动管理**：自动处理缓存的读写和失效

合理使用缓存可以显著提升应用性能，减少数据库压力。在实际项目中，请根据业务场景选择合适的缓存策略和过期时间。

---

> *技术有价，思路无界。通过缓存机制，我们优化了性能，也提升了用户体验。*