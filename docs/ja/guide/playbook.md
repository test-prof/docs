# プレイブック

このプレイブックは、テストスイートのプロファイリングを始める際の手助けを目的としており、「まずどのプロファイラを使うべきか？」「結果をどう解釈し、次のステップをどう決めればよいか？」といった疑問に答えます。

**注意**：このドキュメントでは、Ruby on RailsアプリケーションとテストフレームワークとしてのRSpecを使用していることを前提としています。これらのアイデアは他のフレームワークにも簡単に応用できます。

> 📼 このプレイブックを実際に使っている様子は、[RailsConf 2024 のワークショップ「From slow to go」の録画](https://evilmartians.com/events/from-slow-to-go-rails-test-profiling-hands-on-railsconf-2024)でも確認できます。

## ステップ0. 基本的な設定

手軽に改善できる点：

- テストでのロギング\*を無効にする — 意味がありません。もしログが本当に必要な場合は、[ロギングユーティリティ](./recipes/logging.md)を使用してください。

```ruby
config.logger = ActiveSupport::TaggedLogging.new(Logger.new(nil))
config.log_level = :fatal
```

- デフォルトではカバレッジと組み込みプロファイリングを無効にする。必要であれば、環境変数を使って有効にしましょう（例：`COVERAGE=true`）

\* 現代のSSDハードドライブでは、ファイルベースのロギングによるオーバーヘッドはほとんど無視できる程度になっています。それでもなお、どの環境（例：MacOS上のDockerなど）でもテストに影響が出ないように、ロギングは無効にすることを推奨します。

## ステップ1. 全般的なプロファイリング

手軽には見つからない改善点を特定するのに役立ちます。[StackProf](./profilers/ruby_profilers.md#stackprof) または [Vernier](./profilers/ruby_profilers.md#vernier) の使用をお勧めします。まだインストールしていない場合は、まずインストールする必要があります：

```sh
bundle add stackprof
# または
bundle add vernier
```

TestProfがデフォルトでJSONプロファイルを生成するように設定します：

```ruby
TestProf::StackProf.configure do |config|
  config.format = "json"
end
```

これらのプロファイルを分析するには[speedscope](https://www.speedscope.app)というツールを利用することをお勧めします。

### ステップ1.1. アプリケーション起動のプロファイリング

```sh
TEST_STACK_PROF=boot rspec ./spec/some_spec.rb
```

**注意:** このプロファイリングでは、単一のテストを実行するだけでOKです。

注目すべきポイントの例：

- [Bootsnap](https://github.com/Shopify/bootsnap)が使用されていない、または全てをキャッシュするように設定されていない（例：YAMLファイル）
- テストでは不要な、遅いRails initializer。Vernier の Rails フック機能は、Rails initializer の分析に特に役立ちます。

### ステップ1.2. テストのサンプリングプロファイリング

アイデアとしては、ランダムなテストのサブセットを複数回実行して、アプリケーション全体の問題を明らかにすることです。まず[サンプリング機能](./recipes/tests_sampling.md)を有効にする必要があります：

```rb
# RSpecの場合、spec_helper.rbに追加
require "test_prof/recipes/rspec/sample"

# Minitestの場合、test_helper.rbに追加
require "test_prof/recipes/minitest/sample"
```

次に**複数回**実行して、得られたフレームグラフを分析します：

```sh
SAMPLE=100 bin/rails test
# または
SAMPLE=100 bin/rspec
```

よくある気づき：

- 暗号化呼び出し（`*crypt*`など）：テスト環境での設定を緩和する
- ログ呼び出し：ログを無効にしましたか？
- データベース：手軽に改善できる点があるかもしれません（例：全てのテストで、トランザクションの代わりにDatabaseCleanerのトランケーションを使っている場合など）
- ネットワーク：単体テストでは不要ですが、ブラウザテストでは避けられません。[Webmock](https://github.com/bblimke/webmock)を使用して HTTP 呼び出しを完全に無効化しましょう。

## ステップ2. 範囲を絞り込む

これは、大規模なコードベースにおいて非常に重要なステップです。たとえ最も遅いテストであっても、複雑なものに個別対処するよりは、実行時間の短縮という観点で最も効果の高い、手早く直せる箇所を優先すべきです。
そのためにまず、全体の実行時間に最も大きく影響している**テストの種類**を特定します。

そのために[TagProf](./profilers/tag_prof.md)を使用します：

```sh
TAG_PROF=type TAG_PROF_FORMAT=html TAG_PROF_EVENT=sql.active_record,factory.create bin/rspec
```

生成されたダイアグラムを見ると、最も時間のかかるテストタイプ2つを特定できます（通常、モデルやコントローラーがその中に含まれます）。

グループ全体に共通する遅延の原因を見つけて修正するほうが、個々のテストに個別対応するよりも効率的だと仮定しましょう。
この前提のもと、選択したグループ（たとえばモデル）内に絞って、分析や対応を進めていきます。

## ステップ3. 専門的なプロファイリング

選択したグループ内で、まず[EventProf](./profilers/event_prof.md)を使用して迅速なイベントベースのプロファイリングを実行できます（サンプリングも有効にすることもできます）。

### ステップ3.1. 依存関係の設定

この時点で、設定ミスや誤った使い方をされている依存関係や gem を特定できる場合があります。
よくある例:

- インラインで実行されるSidekiqジョブ

```sh
EVENT_PROF=sidekiq.inline bin/rspec spec/models
```

- Wisperブロードキャスト（[パッチが必要](https://gist.github.com/palkan/aa7035cebaeca7ed76e433981f90c07b)）

```sh
EVENT_PROF=wisper.publisher.broadcast bin/rspec spec/models
```

- PaperTrailのログ作成

カスタムプロファイリングを有効にします：

```rb
TestProf::EventProf.monitor(PaperTrail::RecordTrail, "paper_trail.record", :record_create)
TestProf::EventProf.monitor(PaperTrail::RecordTrail, "paper_trail.record", :record_destroy)
TestProf::EventProf.monitor(PaperTrail::RecordTrail, "paper_trail.record", :record_update)
```

その上でテストを実行します：

```sh
EVENT_PROF=paper_trail.record bin/rspec spec/models
```

[RSpecStamp](./recipes/rspec_stamp.md)を使用してこのような問題を素早く修正する方法については、[Sidekiqの例](https://evilmartians.com/chronicles/testprof-a-good-doctor-for-slow-ruby-tests#background-jobs)を参照してください。

### ステップ3.2. データ生成

データベースやファクトリ（使用している場合）関連で費やされた時間に基づき、最も遅いテストを特定します：

```sh
# データベースとのやり取り
EVENT_PROF=sql.active_record bin/rspec spec/models

# ファクトリ
EVENT_PROF=factory.create bin/rspec spec/models
```

これで、生成されたレポートから上位10ファイルにさらに範囲を絞ることができます。ファクトリを使用している場合は、`factory.create`レポートを使用してください。

**ヒント:** RSpecでは、次のコマンドを使用して、最も遅い example をカスタムタグで自動的にマークできます：

```sh
EVENT_PROF=factory.create EVENT_PROF_STAMP=slow:factory bin/rspec spec/models
```

## ステップ4. ファクトリの使用

`slow:factory`テストの中で最も使用されているファクトリを特定します：

```sh
FPROF=1 bin/rspec --tag slow:factory
```

example の総数よりもはるかに多くの回数使用されているファクトリが見つかった場合、_ファクトリカスケード_ が起きています。

カスケードを視覚化します：

```sh
FPROF=flamegraph bin/rspec --tag slow:factory
```

この視覚化は、修正すべきファクトリを特定するのに役立ちます。[この記事](https://evilmartians.com/chronicles/testprof-2-factory-therapy-for-your-ruby-tests-rspec-minitest)で解決策を見つけることができます。

### ステップ4.1. ファクトリデフォルト

モデルの関連付けによって生成されるカスケードを修正する一つの選択肢は、[factory defaults](./recipes/factory_default.md)を使用することです。潜在的な影響を評価し、このパターンを適用するファクトリを特定するには、次のプロファイラを実行します：

```sh
FACTORY_DEFAULT_PROF=1 bin/rspec --tag slow:factory
```

`create_default`を追加して影響を測定してみてください：

```sh
FACTORY_DEFAULT_SUMMARY=1 bin/rspec --tag slow:factory

# ヒット数が多いほど良い
FactoryDefault summary: hit=11 miss=3
```

### ステップ4.2. ファクトリフィクスチャ

`FPROF=1`レポートに戻り、すべての example で作成されるレコードがあるか確認します（通常、`user`、`account`、`team`など）。[AnyFixture](./recipes/any_fixture.md)を使用してフィクスチャに置き換えることを検討してください。

## ステップ5. 再利用可能なセットアップ

複数の example で同じセットアップが共有されていることはよくあります。[RSpecDissect](./profilers/rspec_dissect.md)を使用して、実際の example の時間と比較して`let` / `before`で費やされた時間を測定できます：

```sh
RD_PROF=1 bin/rspec
```

最も遅いグループを確認し、`let`/`let!`を[let_it_be](./recipes/let_it_be.md)に、`before`を[before_all](./recipes/before_all.md)に置き換えることを検討してください。

**重要:** Knapsack Proユーザーは、example 単位の分散が`let_it_be` / `before_all`の効果を打ち消してしまうことに注意してください。ファイル単位の分散に切り替えた上で、ファイルを小さく保つ必要があります。これがTestProfの最適化の効果を最大化する方法です。

## 結論

上記のステップを特定のテストグループに適用し終える頃には、あなたのコードベースに合った最適化のパターンと技法ができあがっているはずです。あとは、それらを他のグループにも広げていくだけです。がんばってください！


