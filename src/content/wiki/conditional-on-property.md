---
title: 深入理解 Spring Boot 中的 @ConditionalOnProperty 注解
description: 详细介绍 @ConditionalOnProperty 注解的用法、高级特性以及实际应用场景
pubDate: 2026-04-02
tags:
  - Spring Boot
  - 注解
  - 配置
  - 后端开发
draft: false
---

# 深入理解 Spring Boot 中的 @ConditionalOnProperty 注解

在 Spring Boot 中，`@ConditionalOnProperty` 注解是一个非常强大的工具，它允许你根据配置文件中的属性值来决定是否加载某个 Bean 或配置类。这使得你的应用程序可以根据不同的环境或配置灵活地调整行为。

---

## 1. 基本用法

`@ConditionalOnProperty` 注解可以用于类级别或方法级别，用于条件化地加载 Bean 或配置类。

### 类级别

```java
@Configuration
@ConditionalOnProperty(prefix = "test", name = "enable", havingValue = "true")
public class TestConfig {

    @Bean
    public String sunTest() {
        System.out.println("测试bean成功");
        return "测试成功";
    }
}
```

在这个例子中，只有当配置文件中 `test.enable` 属性的值为 `true` 时，`TestConfig` 类才会被加载。

### 方法级别

```java
@Configuration
public class TestConfig {

    @Bean
    @ConditionalOnProperty(prefix = "test", name = "enable", havingValue = "true")
    public String sunTest() {
        System.out.println("测试bean成功");
        return "测试成功";
    }
}
```

在这个例子中，只有当配置文件中 `test.enable` 属性的值为 `true` 时，`sunTest` Bean 才会被创建。

---

## 2. 配置文件中的属性

在配置文件（如 `application.properties` 或 `application.yml`）中，你需要定义相应的属性。

### application.properties

```properties
test.enable=true
```

### application.yml

```yaml
test:
  enable: true
```

---

## 3. 注解属性详解

`@ConditionalOnProperty` 注解有以下几个主要属性：

| 属性 | 说明 |
|------|------|
| `prefix` | 属性的前缀 |
| `name` | 属性的名称 |
| `havingValue` | 属性的期望值 |
| `matchIfMissing` | 如果属性不存在时的默认行为 |

### prefix 和 name

`prefix` 和 `name` 属性用于指定配置文件中的属性路径。

```java
@ConditionalOnProperty(prefix = "test", name = "enable")
```

等价于配置文件中的 `test.enable` 属性。

### havingValue

`havingValue` 属性用于指定属性的期望值。

```java
@ConditionalOnProperty(prefix = "test", name = "enable", havingValue = "true")
```

只有当 `test.enable` 属性的值为 `true` 时，条件才会满足。

### matchIfMissing

`matchIfMissing` 属性用于指定当属性不存在时的行为。

```java
@ConditionalOnProperty(prefix = "test", name = "enable", matchIfMissing = true)
```

如果 `test.enable` 属性不存在，默认情况下条件会满足。

---

## 4. 高级用法

### 多个属性

你可以指定多个属性来满足条件。

```java
@ConditionalOnProperty(prefix = "test", name = {"enable", "feature.enabled"}, havingValue = "true")
```

只有当 `test.enable` 和 `test.feature.enabled` 属性的值都为 `true` 时，条件才会满足。

### 使用 SpEL 表达式

`@ConditionalOnExpression` 注解可以结合 SpEL 表达式来实现更复杂的条件判断：

```java
@ConditionalOnExpression("${test.enable} and ${test.feature.enabled}")
```

### 结合其他条件注解

```java
@ConditionalOnProperty(prefix = "test", name = "enable", havingValue = "true")
@ConditionalOnClass(name = "com.example.SomeClass")
public class TestConfig {
    // ...
}
```

---

## 5. 实际应用场景

### 环境特定配置

根据不同的环境（如 `dev`、`prod`、`test`）来加载不同的配置：

```yaml
# application-dev.yml
test:
  enable: true

# application-prod.yml
test:
  enable: false

# application-test.yml
test:
  enable: true
```

### 功能开关

通过配置文件中的属性来启用或禁用某些功能：

```yaml
feature:
  new-feature:
    enabled: true
```

```java
@ConditionalOnProperty(prefix = "feature.new-feature", name = "enabled", havingValue = "true")
public class NewFeatureConfig {
    // ...
}
```

---

## 6. 总结

`@ConditionalOnProperty` 注解是 Spring Boot 中一个非常强大的工具，它使得你的应用程序可以根据配置文件中的属性值灵活地调整行为。通过合理使用这个注解，你可以：

- **环境适配**：根据不同环境加载不同配置
- **功能开关**：通过配置启用/禁用功能
- **模块化配置**：按需加载特定的 Bean
- **条件化组件**：基于条件动态注册组件

合理使用 `@ConditionalOnProperty` 注解可以提高应用程序的可维护性和灵活性，让你的代码更加优雅和可配置。

---

> 技术有价，思路无界。掌握工具背后的原理，才能真正灵活运用。