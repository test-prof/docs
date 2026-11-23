# RSpecDissect

`before` フックにどれだけの時間を費やしているかご存知ですか？ あるいは、`let` のようなメモ化ヘルパーではどうでしょうか？ たいていの場合、テストスイート全体の時間の大半を占めています。

_RSpecDissect_ はこういった情報を提供し、さらに **セットアップ時間** が最も長い example group を表示します。RSpecDissect の主な目的は、こうした遅いグループを特定し、[`before_all`](../recipes/before_all.md) や [`let_it_be`](../recipes/let_it_be.md) といったレシピを使ってリファクタリングすることです。

出力例:

```sh
[TEST PROF INFO] RSpecDissect report

Total time: 25:14.870
Total setup time: 14:36.482

Top 5 slowest suites setup time:

Webhooks::DispatchTransition (./spec/services/webhooks/dispatch_transition_spec.rb:3) – 00:29.895 of 00:33.706 / 327 (before: 00:25.346, before let: 00:19.389, lazy let: 00:04.543)
  ↳ user – 00:09.323 (327)
  ↳ funnel – 00:06.231 (122)
  ↳ account – 00:04.360 (91)

FunnelsController (./spec/controllers/funnels_controller_spec.rb:3) – 00:22.117 of 00:43.649 / 133 (before: 00:22.117, before let: 00:18.695, lazy let: 00:00.000)
  ↳ user – 00:09.323 (327)
  ↳ funnel – 00:06.231 (122)
...
```

**セットアップ時間** には、`before(:each)` フックと遅延評価される `let` の評価に費やされた時間が含まれます (`subject` は除きます。`subject` はテスト対象のアクションを定義するために使われることが多く、セットアップフェーズの一部とみなすべきではないためです)。

ご覧のとおり、このプロファイラは評価に最も時間のかかっている `let` についての情報も提供します。

## 使い方

RSpecDissect は RSpec でのみ使用できます (名前からも明らかですね)。

RSpecDissect を有効にするには、環境変数 `RD_PROF` を使用します:

```sh
RD_PROF=1 rspec ...
```

`RD_PROF_TOP` 変数で、表示する遅いグループの上位件数を指定することもできます:

```sh
RD_PROF=1 RD_PROF_TOP=10 rspec ...
```

また、環境変数 `RD_PROF_LET_TOP=10` で、表示する `let` 宣言の上位件数を指定できます。

## RSpecStamp と組み合わせて使う

RSpecDissect は [RSpec Stamp](../recipes/rspec_stamp.md) と組み合わせて、 _遅い_ example に自動的にカスタムタグを付けることができます。例:

```sh
RD_PROF=1 RD_PROF_STAMP="slow" rspec ...
```

上記のコマンドを実行すると、最も遅い example group に `:slow` タグが付きます。
