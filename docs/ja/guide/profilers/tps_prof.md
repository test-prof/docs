# TPSProf

@available_since version=1.6.0

TPSProf は、トップレベルの example group ごとに 1 秒あたりのテスト数 (TPS: tests-per-second) を計測し、最も遅いグループを特定するのに役立ちます。また、**strict モード** で実行すると、TPS がしきい値を下回るグループがあるときにビルドを失敗させることもできます。

出力例:

```sh
[TEST PROF INFO] TPSProf enabled (top-10)

[TEST PROF INFO] Total TPS (tests per second): 12.33

Top 10 slowest suites by TPS (tests per second):

UsersController (./spec/controllers/users_controller_spec.rb:3) – 3.45 TPS (00:05.797 / 20, shared setup time: 00:01.203)
PostsController (./spec/controllers/posts_controller_spec.rb:3) – 5.12 TPS (00:03.906 / 20, shared setup time: 00:00.876)
CommentsController (./spec/controllers/comments_controller_spec.rb:3) – 7.89 TPS (00:01.900 / 15, shared setup time: 00:00.410)
```

出力には、各グループの TPS と合わせて、合計時間、example の数、共有セットアップ時間 (`before(:all)` フックなど、個々の example の外で費やされた時間) が表示されます。

_ペナルティ_ が最も大きいグループから順に表示されます。ペナルティは、目標 TPS (デフォルトは 30) と比べて無駄になった時間として計算されます。 _ペナルティ_ という考え方の狙いは、最適化したときにテストスイートの時間を最も節約できる example group を特定することです。つまり、ペナルティが最も大きいグループが TPS の最も低いグループであるとは限らず、グループ内の example の総数にも左右されます。より正確な結果を得るには、目標 TPS を調整してください。

## 使い方

TPSProf は現在 RSpec のみをサポートしています。

### profile モード (デフォルト)

有効にするには、環境変数 `TPS_PROF` を使用します:

```sh
# 最も遅いグループの上位 10 件を表示する (デフォルト)
TPS_PROF=1 rspec

# 最も遅いグループの上位 N 件を表示する
TPS_PROF=20 rspec
```

### strict モード

strict モードでは、しきい値に違反したグループを example 外のエラーとして報告し、ビルドを失敗させます:

```sh
TPS_PROF=strict rspec
```

strict モードでは、違反を報告するためのしきい値を設定します:

```sh
# example が 50 件を超えるグループを失敗させる
TPS_PROF=strict TPS_PROF_MAX_EXAMPLES=50 rspec

# 30 秒を超えるグループを失敗させる
TPS_PROF=strict TPS_PROF_MAX_TIME=30 rspec

# TPS が 5 未満のグループを失敗させる
TPS_PROF=strict TPS_PROF_MIN_TPS=5 rspec
```

複数のしきい値を組み合わせることもできます:

```sh
TPS_PROF=strict TPS_PROF_MIN_TPS=5 TPS_PROF_MAX_TIME=30 rspec
```

## 設定

### 絞り込みのしきい値

グループは、以下の条件を **すべて** 満たす場合にのみレポートに含まれます:

| 環境変数 | デフォルト | 説明 |
|---|---|---|
| `TPS_PROF_MIN_EXAMPLES` | 10 | グループ内の example の最小数 |
| `TPS_PROF_MIN_TIME` | 5 | グループの合計時間の最小値 (秒) |
| `TPS_PROF_TARGET_TPS` | 30 | TPS がこの値を下回るグループだけを報告する |

### レポートのオプション

| 環境変数 | デフォルト | 説明 |
|---|---|---|
| `TPS_PROF` | – | プロファイラを有効にする。数値を指定すると上位 N 件、`strict` を指定すると strict モードになる |
| `TPS_PROF_COUNT` | 10 | 表示するグループの数 (`TPS_PROF` の数値を上書きする) |
| `TPS_PROF_MODE` | – | モード (`profile` または `strict`) を明示的に指定する。`TPS_PROF=strict` を上書きする |

### strict モードのしきい値

| 環境変数 | デフォルト | 説明 |
|---|---|---|
| `TPS_PROF_MAX_EXAMPLES` | – | example の数がこの値を超えるグループを報告する |
| `TPS_PROF_MAX_TIME` | – | 合計時間がこの値 (秒) を超えるグループを報告する |
| `TPS_PROF_MIN_TPS` | – | TPS がこの値を下回るグループを報告する |

### コードによる設定

テストヘルパーの中で TPSProf を設定することもできます:

```ruby
TestProf::TPSProf.configure do |config|
  config.top_count = 15
  # プロファイリングのしきい値
  config.min_examples_count = 5
  config.min_group_time = 3
  config.min_target_tps = 20
  # strict モードの設定
  config.max_examples_count = 100
  config.max_group_time = 60
  config.min_tps = 5
end
```

### カスタム strict ハンドラ

カスタムの strict ハンドラを指定すると、独自の違反判定ロジックを実装できます。ハンドラは、`group`、`location`、`examples_count`、`total_time`、`tps`、`penalty` という属性を持つ `GroupInfo` オブジェクトを受け取ります。グループを違反として扱うには、例外を発生させてください。以下は、テストの種類ごとに異なる TPS のしきい値を使う設定例です:

```ruby
TestProf::TPSProf.configure do |config|
  config.mode = :strict
  config.strict_handler = ->(group_info) {
    if group_info.group.metadata[:type] == :system && group_info.tps < 5
      raise "Group #{group_info.location} is too slow: #{group_info.tps} TPS"
    elsif group_info.tps < 20
      raise "Group #{group_info.location} is too slow: #{group_info.tps} TPS"
    end
  }
end
```

## グループと example を無視する

`tps_prof: :ignore` メタデータを使うと、特定のグループを TPSProf の計測対象から除外できます:

```ruby
RSpec.describe "SlowButOk", tps_prof: :ignore do
  # ...
end
```
