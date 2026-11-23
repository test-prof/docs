# EventProf

EventProf は、テストスイートの実行中に、計測の仕組み (ActiveSupport::Notifications など) から得られるメトリクスを収集します。

`rspec --profile` とよく似た動きをしますが、任意のイベントを追跡できます。

出力例:

```sh
[TEST PROF INFO] EventProf results for sql.active_record

Total time: 00:00.256 of 00:00.512 (50.00%)
Total events: 1031

Top 5 slowest suites (by time):

AnswersController (./spec/controllers/answers_controller_spec.rb:3) – 00:00.119 (549 / 20) of 00:00.200 (59.50%)
QuestionsController (./spec/controllers/questions_controller_spec.rb:3) – 00:00.105 (360 / 18) of 00:00.125 (84.00%)
CommentsController (./spec/controllers/comments_controller_spec.rb:3) – 00:00.032 (122 / 4) of 00:00.064 (50.00%)

Top 5 slowest tests (by time):

destroys question (./spec/controllers/questions_controller_spec.rb:38) – 00:00.022 (29) of 00:00.064 (34.38%)
change comments count (./spec/controllers/comments_controller_spec.rb:7) – 00:00.011 (34) of 00:00.022 (50.00%)
change Votes count (./spec/shared_examples/controllers/voted_examples.rb:23) – 00:00.008 (25) of 00:00.022 (36.36%)
change Votes count (./spec/shared_examples/controllers/voted_examples.rb:23) – 00:00.008 (32) of 00:00.035 (22.86%)
fails (./spec/shared_examples/controllers/invalid_examples.rb:3) – 00:00.007 (34) of 00:00.014 (50.00%)

```

## 使い方

現在、EventProf がサポートしているのは ActiveSupport::Notifications のみです。

EventProf を有効にする方法は次のとおりです。

### RSpec

環境変数 `EVENT_PROF` にイベント名を指定します。

```sh
# すべてのスイートと example について SQL クエリの統計を収集する
EVENT_PROF='sql.active_record' rspec ...
```

複数のイベントを同時に追跡することもできます。

```sh
EVENT_PROF='sql.active_record,perform.active_job' rspec ...
```

### Minitest

Minitest 6 以降では、まずテストヘルパーに `Minitest.load :test_prof` を追加して、TestProf プラグインを有効にする必要があります。

環境変数 `EVENT_PROF` にイベント名を指定します。

```sh
# すべてのスイートと example について SQL クエリの統計を収集する
EVENT_PROF='sql.active_record' rake test
```

CLI オプションを使うこともできます。

```sh
# CLI オプションを使って特定のファイルを実行する
ruby test/my_super_test.rb --event-prof=sql.active_record

# 使用できるオプションの一覧を表示する
ruby test/my_super_test.rb --help
```

### Minitest::Reporters と併用する

プロジェクトで `Minitest::Reporters` を使用している場合は、テストヘルパーのファイルで明示的に宣言する必要があります。

```sh
require 'minitest/reporters'
Minitest::Reporters.use! [YOUR_FAVORITE_REPORTERS]
```

#### 注意事項

`minitest-reporters` が gem としてインストールされているものの `Gemfile` には宣言されていない場合は、テストの実行コマンドの前に必ず `bundle exec` を付けてください (いつもそうしているとは思いますが)。
そうしないと、Minitest のプラグインシステムが原因でエラーになります。このシステムは `$LOAD_PATH` 内のすべてのエントリから `minitest/*_plugin.rb` を探すため、その場合に利用可能となる `minitest-reporters` プラグインの初期化が正しく行われません。

Rails を使用している場合、利用できるイベントの一覧は [Rails ガイド](http://guides.rubyonrails.org/active_support_instrumentation.html) を参照してください。

[rom-rb](http://rom-rb.org) を使用している場合は、`'sql.rom'` イベントのプロファイリングが役に立つかもしれません。

## 設定

デフォルトでは、EventProf はトップレベルのグループ (いわゆるスイート) についての情報のみを収集しますが、個々の example をプロファイリングすることもできます。次の設定オプションを指定するだけです。

```ruby
TestProf::EventProf.configure do |config|
  config.per_example = true
end
```

あるいは、環境変数 `EVENT_PROF_EXAMPLES=1` を指定します。

もうひとつの便利な設定パラメータが `rank_by` です。これは統計の並び順を決めるもので、イベントに費やした時間、または発生回数のどちらかで並べ替えます。

```sh
EVENT_PROF_RANK=count EVENT_PROF='instantiation.active_record' be rspec
```

## フォーマット

デフォルトでは、EventProf は結果を標準出力に表示します。環境変数 `EVENT_PROF_FORMAT` (または `config.format`) を設定すると、JSON として出力することもできます。

```sh
EVENT_PROF='sql.active_record' EVENT_PROF_FORMAT=json rspec ...
```

JSON の成果物は `tmp/test_prof/event-prof.json` に書き出されます (パスはグローバルの `output_dir` オプションで変更できます)。

Minitest では、対応する CLI オプションを使用できます。

```sh
ruby test/my_super_test.rb --event-prof=sql.active_record --event-prof-format=json
```

利用できるすべての設定オプションとその使い方については、[event_prof.rb](https://github.com/test-prof/test-prof/tree/master/lib/test_prof/event_prof.rb) を参照してください。

## RSpecStamp と併用する

EventProf を [RSpec Stamp](../recipes/rspec_stamp.md) と併用すると、_遅い_ example にカスタムタグを自動で付けることができます。たとえば次のようにします。

```sh
EVENT_PROF="sql.active_record" EVENT_PROF_STAMP="slow:sql" rspec ...
```

上のコマンドを実行すると、最も遅い example group (設定していれば example も) に `slow: :sql` タグが付きます。

## カスタムの計測

EventProf を独自の計測エンジンと一緒に使うには、次の 2 つの手順を行うだけです。

- 計測のラッパーを追加します。

```ruby
# 独自の計測に対するラッパー
module MyEventsWrapper
  # メソッドはこの 1 つだけを持つこと
  def self.subscribe(event)
    raise ArgumentError, "Block is required!" unless block_given?

    ::MyEvents.subscribe(event) do |start, finish, *|
      yield (finish - start)
    end
  end
end
```

- 設定で instrumenter を指定します。

```ruby
TestProf::EventProf.configure do |config|
  config.instrumenter = MyEventsWrapper
end
```

## カスタムイベント

### `"factory.create"`

FactoryBot は独自の計測 ('factory_bot.run_factory') を提供していますが、注意点があります。ネストした関連のためにファクトリを使う場合も含め、ファクトリが使われるたびにイベントが発火するのです。そのため二重に計上されてしまい、ファクトリに費やした合計時間を算出できません。

EventProf には FactoryBot 向けの小さなパッチが付属しており、トップレベルの `FactoryBot.create` の呼び出しだけを計測します。`"factory.create"` イベントを使うと自動で読み込まれます。

```sh
EVENT_PROF=factory.create bundle exec rspec
```

Fabrication もサポートしています (暗黙的・明示的な `Fabricate.create` の呼び出しを追跡します)。

### `"sidekiq.jobs"`

インラインで実行された Sidekiq ジョブの統計を収集します。

```sh
EVENT_PROF=sidekiq.jobs bundle exec rspec
```

**注意**: `rank_by` は自動的に `count` に設定されます (費やした時間の情報を集めても意味がないためです。下記を参照してください)。

### `"sidekiq.inline"`

インラインで実行された Sidekiq ジョブの統計を収集します (ネストしたジョブは除きます)。

```sh
EVENT_PROF=sidekiq.inline bundle exec rspec
```

Sidekiq ジョブの実行に費やした時間をプロファイリングするには、このイベントを使用してください。

### `"callback.run"`

[ActiveSupport のコールバック](https://api.rubyonrails.org/classes/ActiveSupport/Callbacks.html) の呼び出し (`before`/`after`) の統計を収集します。

```sh
EVENT_PROF=callback.run bundle exec rspec
```

`ActiveSupport::Callbacks` が読み込まれている必要があります (Rails 経由、または `require "active_support/callbacks"` など)。

レポートにはコールバックごとの内訳が含まれ、それぞれの時間と呼び出し回数が表示されます (`kind_name filter (Owner)`)。各コールバックイベントは `{label: "..."}` という形式のペイロードを持ち、イベントはそのラベルごとにまとめられます。

```
  before_save normalize (Order) → 00:00.012 (42)
  after_save audit (Order) → 00:00.008 (42)
```

**注意:** 追跡されるのは `before` と `after` のコールバックのみです。`around` コールバックは計測されません。

## 任意のメソッドをプロファイリングする

特定のメソッドをプロファイリングするために、独自のカスタムイベントを追加することもできます (たとえば、[RubyProf](./ruby_prof.md) や [StackProf](./stack_prof.md) でボトルネックになっている呼び出しを突き止めた後など)。

たとえば、重い処理を行うクラスがあるとします。

```ruby
class Work
  def do_smth(*args)
    # 何らかの処理を行う
  end
end
```

_モニター_ を追加することでプロファイリングできます。

```ruby
# クラス、イベント名、監視するメソッドを指定する
TestProf::EventProf.monitor(Work, "my.work", :do_smth)
```

あとは、いつもどおり EventProf を実行します。

```sh
EVENT_PROF=my.work bundle exec rake test
```

追加のオプションを指定することもできます。

- `top_level: true | false` (デフォルトは `false`): トップレベルの呼び出しだけを対象とし、このイベントのネストした発火を無視するかどうかを指定します ("factory.create" はこの方法で[実装](https://github.com/test-prof/test-prof/blob/master/lib/test_prof/event_prof/custom_events/factory_create.rb)されています)
- `guard: Proc` (デフォルトは `nil`): イベントの発火を抑止できる Proc を指定します。`guard` が `true` を返した場合にのみメソッドが計測されます。`guard` は `instance_exec` で実行され、メソッドの引数が渡されます。
- `payload: Proc` (デフォルトは `nil`): `Hash` を返す Proc を指定すると、各イベントにペイロードを付与できます (`ActiveSupport::Notifications` のペイロードとしてそのまま渡されます)。Hash に `:label` キーが含まれている場合、同じラベルを持つイベントが内訳として集計されます ([`"callback.run"`](#callbackrun) を参照)。Proc は `instance_exec` で評価され、メソッドの引数が渡されます。

たとえば次のようにします。

```ruby
TestProf::EventProf.monitor(
  Sidekiq::Client,
  "sidekiq.inline",
  :raw_push,
  top_level: true,
  guard: ->(*) { Sidekiq::Testing.inline? }
)
```

コードを `TestProf::EventProf::CustomEvents.register` メソッドで囲むと、モニターを _必要なときだけ_ (つまり、指定したイベントを追跡したいときにのみ) 追加できます。

```ruby
TestProf::EventProf::CustomEvents.register("my.work") do
  TestProf::EventProf.monitor(Work, "my.work", :do_smth)
end

# その後、指定されたイベントを渡して `activate_all` を呼び出す
TestProf::EventProf::CustomEvents.activate_all(TestProf::EventProf.config.event)
```

このブロックは、指定したイベントが EventProf で有効になっている場合にのみ評価されます。
