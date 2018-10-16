This is a committee server project for GZH.

# GZHCommittee

Build: ![CircleCI](https://circleci.com/gh/XDMu/GZHCommittee.svg?style=svg&circle-token=4cb35b539516bb03931618c69ad11933bf24f60d)

GZHCommittee is a committee chaincode for blockchain token and member management.

## Currently support

1. 初始化GZHCommittee合约账户
2. 初始化GZHCommittee委员会member成员（五位已注册Earth账户）
3. 发起提案
4. 针对已发起提案投票

# 数值计算说明

GZHCommittee项目的数值计算采用[mathjs](http://mathjs.org/)

# Lint

GZHCommittee项目代码质量采用著名的[airbnb/javascript](https://github.com/airbnb/javascript)标准

```
yarn lint # 对lib文件夹中的内容做静态检查
```

# Test

```
yarn test # 使用mocha运行单元测试
```

# Folder Structure

```
GZHCommittee
  |
  \index.js # 入口文件，负责请求的分发
  \package.json # node项目文件, npm start会执行node index.js
  \docs # JsDoc文档
  \lib # 源文件都在这个目录下
    |
    \acl # Access Control Limit, 权限控制相关代码
      |
      \IdentityService.js # 这个类从每次stub请求中获取并解析当前请求所携带的证书信息
      \ProposalService.js # 这个类用来检查对chaincode的请求的来源
    \handler
      |
      \CommitteeHandler.js # 处理委员会相关请求，初始化GZHCommittee合约账户等
      \MemberHandler.js # 处理member相关请求，初始化GZHCommittee委员会member成员等
      \ProposalHandler.js # 处理提案相关请求，发起提案，针对已发起提案投票等
    \model # 这个目录包含各种模型
      |
      \BaseModel.js # 所有Model的基类，包含了公共方法
      \Committee.js # 委员会模型
      \Member.js # 委员会成员模型
      \Proposal.js # 提案模型
      \Vote.js # 投票模型
    \protos
      |
      \chaincode.proto # chaincode 的grpc proto，用于ProposalService来decode请求
    \utils # 这个目录提供一些util方法
      |
      \Certificate.js # 证书类，这个类解析证书，acl/IdentityService.js会调用这个类
      \Constants.js # GZHCommittee项目里所有的常数都在这个文件里
      \IterParser.js # 将iter解析成array
      \Logger.js # 提供logger
      \Response.js # 生成标准化的返回结果
      \SchemaChecker.js # schema检查工具
      \TimeStamp.js # 从invoke请求中拿到这个请求的timestamp
      \TypeChecker.js # 检查某个值的类型
  \test # 测试文件都在这个目录下, 测试框架采用mocha，所有的测试文件都以*.test.js命名
    |
    \mock-stub.js # 这个文件实现了一个基于文件存储的mock stub，用于模拟测试时的数据库请求
    \acl
      |
      \IdentityService.test.js # 对应lib/acl/IdentityService.js的测试
    \handler
      |
      \committee.handler.test.js # 对CommitteeHandler的test
      \member.handler.test.js # 对MemberHandler的测试
      \proposal.handler.test.js # 对ProposalHandler的测试
    \model # 这个目录包含lib/model目录下对应文件的测试
      |
      \BaseModel.test.js
    \pouchdb-runtime # 基于pouchdb的一个runtime，可以进行mock测试
    \utils # 这个目录包含lib/utils目录下对应文件的测试
      |
      \Certificate.test.js
      \SchemaCHecker.test.js
      \typechecker.test.js
```
