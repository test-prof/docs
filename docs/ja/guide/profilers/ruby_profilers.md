# Ruby プロファイラと組み合わせて使う

TestProf を使うと、プロファイリング用のコードを自分で書かなくても、一般的な Ruby プロファイラでテストスイートをプロファイリングできます。
プロファイラのライブラリをインストールして、テストを実行するだけです！

サポートされているプロファイラ:

- [StackProf](#stackprof)
- [Vernier](#vernier)
- [RubyProf](#rubyprof)

## StackProf

[StackProf][] は Ruby 用のサンプリング方式のコールスタックプロファイラです。

依存関係に `stackprof` が含まれていることを確認してください:

```ruby
# Gemfile
group :development, :test do
  gem "stackprof", ">= 0.2.9", require: false
end
```

### StackProf でテストスイート全体をプロファイリングする

**注意:** プロファイリングのレポートを小さくするために、[テストのサンプリング](../recipes/tests_sampling.md)を使用することをお勧めします。

環境変数 `TEST_STACK_PROF` を設定すると、StackProf によるプロファイリングを有効にできます:

```sh
TEST_STACK_PROF=1 bundle exec rake test

# RSpec の場合
TEST_STACK_PROF=1 bundle exec rspec ...
```

テストの実行が終わると、生成されたレポート (StackProf の raw 形式と JSON) のパスを含む TestProf からのメッセージが表示されます:

```sh
...

[TEST PROF INFO] StackProf report generated: tmp/test_prof/stack-prof-report-wall-raw-total.dump
[TEST PROF INFO] StackProf JSON report generated: tmp/test_prof/stack-prof-report-wall-raw-total.json
```

JSON レポートを [Speedscope][] にアップロードして、フレームグラフを分析することをお勧めします。もちろん、`stackprof` の CLI
を使って raw レポートを扱っても構いません。

### StackProf で個々の example をプロファイリングする

TestProf は、example を個別にプロファイリングするための RSpec 用の組み込み shared context を提供しています:

```ruby
it "is doing heavy stuff", :sprof do
  # ...
end
```

**注意:** グローバルな (スイート単位の) プロファイリングが有効になっている場合、example 単位のプロファイリングは動作しません。

### StackProf でアプリケーションの起動をプロファイリングする

アプリケーションの起動時間もテストを遅くする要因になりえます。次のコマンドを使って、起動処理を StackProf でプロファイリングしてみてください:

```sh
# 適当な spec を選びます (1 つで十分です)
$ TEST_STACK_PROF=boot bundle exec rspec ./spec/some_spec.rb

...
[TEST PROF INFO] StackProf report generated: tmp/test_prof/stack-prof-report-wall-raw-boot.dump
[TEST PROF INFO] StackProf JSON report generated: tmp/test_prof/stack-prof-report-wall-raw-boot.json
```

### StackProf の設定

StackProf のモード (デフォルトは `wall`) は、環境変数 `TEST_STACK_PROF_MODE` で変更できます。

StackProf のインターバルも、環境変数 `TEST_STACK_PROF_INTERVAL` で変更できます。
`wall` モードと `cpu` モードでは、`TEST_STACK_PROF_INTERVAL` はマイクロ秒を表し、デフォルトは `stackprof` と同じ 1000 です。
`object` モードでは、`TEST_STACK_PROF_INTERVAL` はアロケーション数を表し、デフォルトは `stackprof` と同じ 1 です。

環境変数 `TEST_STACK_PROF_IGNORE_GC` を設定すると、ガベージコレクションのフレームを無効にできます。
ガベージコレクションの時間はプロファイルに含まれたままですが、専用のフレームとして
明示されなくなります。

利用可能なすべての設定オプションとその使い方については、[stack_prof.rb](https://github.com/test-prof/test-prof/tree/master/lib/test_prof/stack_prof.rb) を参照してください。

## Vernier

[Vernier][] は Ruby 用の次世代のサンプリングプロファイラです。ぜひ試してみて、テストの性能のボトルネックを特定するのに役立つか確かめてください！

依存関係に `vernier` が含まれていることを確認してください:

```ruby
# Gemfile
group :development, :test do
  gem "vernier", ">= 0.3.0", require: false
end
```

### Vernier でテストスイート全体をプロファイリングする

**注意:** プロファイリングのレポートを小さくするために、[テストのサンプリング](../recipes/tests_sampling.md)を使用することをお勧めします。

環境変数 `TEST_VERNIER` を設定すると、Vernier によるプロファイリングを有効にできます:

```sh
TEST_VERNIER=1 bundle exec rake test

# RSpec の場合
TEST_VERNIER=1 bundle exec rspec ...
```

テストの実行が終わると、生成されたレポートのパスを含む TestProf からのメッセージが表示されます:

```sh
...

[TEST PROF INFO] Vernier report generated: tmp/test_prof/vernier-report-wall-raw-total.json
```

[profile-viewer](https://github.com/tenderlove/profiler/tree/ruby) gem を使うか、プロファイルを [vernier.prof](https://vernier.prof) にアップロードしてください。あるいは、profile-viewer のフォーク元である [profiler.firefox.com](https://profiler.firefox.com) を使うこともできます。

### Vernier で個々の example をプロファイリングする

TestProf は、example を個別にプロファイリングするための RSpec 用の組み込み shared context を提供しています:

```ruby
it "is doing heavy stuff", :vernier do
  # ...
end
```

**注意:** グローバルな (スイート単位の) プロファイリングが有効になっている場合、example 単位のプロファイリングは動作しません。

### Vernier でアプリケーションの起動をプロファイリングする

アプリケーションの起動処理をプロファイリングすることもできます:

```sh
# 適当な spec を選びます (1 つで十分です)
TEST_VERNIER=boot bundle exec rspec ./spec/some_spec.rb
```

### Active Support Notifications からマーカーを追加する

Active Support Notifications のイベントマーカーを追加すると、生成されるレポートからより多くの知見を得られます:

```sh
TEST_VERNIER=1 TEST_VERNIER_HOOKS=rails bundle exec rake test

# RSpec の場合
TEST_VERNIER=1 TEST_VERNIER_HOOKS=rails bundle exec rspec ...
```

あるいは、`Vernier` の設定で hooks パラメータを指定することもできます:

```ruby
TestProf::Vernier.configure do |config|
  config.hooks = :rails
end
```

## RubyProf

[ruby-prof](https://github.com/ruby-prof/ruby-prof) の力を、テストスイートに簡単に組み込めます。

`ruby-prof` がインストールされていることを確認してください:

```ruby
# Gemfile
group :development, :test do
  gem "ruby-prof", ">= 1.4.0", require: false
end
```

### RubyProf でテストスイート全体をプロファイリングする

**注意:** プロファイリングのレポートを小さくし、テストの実行が遅くなるのを避けるために、[テストのサンプリング](../recipes/tests_sampling.md)を使用することを強くお勧めします (RubyProf にはかなりのオーバーヘッドがあります)。

環境変数 `TEST_RUBY_PROF` を使うと、グローバルなプロファイリングを有効にできます:

```sh
TEST_RUBY_PROF=1 bundle exec rake test

# RSpec の場合
TEST_RUBY_PROF=1 bundle exec rspec ...
```

テストの実行が終わると、生成されたレポートのパスを含む TestProf からのメッセージが表示されます:

```sh
[TEST PROF INFO] RubyProf report generated: tmp/test_prof/ruby-prof-report-flat-wall-total.txt
```

#### テストスイートの起動を除外する

**注意:** RSpec のみ対応しています。

アプリケーションの起動とテストの読み込みを RubyProf のレポートから除外し、実行されるテストだけを分析できると便利なことがあります (そうすれば、`Kernel#require` が最も遅いメソッドの上位に入ることもありません)。

そのためには、環境変数 `TEST_RUBY_PROF_BOOT=false` (または "0"、"f") を指定します:

```sh
$ TEST_RUBY_PROF=1 TEST_RUBY_PROF_BOOT=0 bundle exec rspec ...

[TEST PROF] RubyProf enabled for examples

...
```

### RubyProf で個々の example をプロファイリングする

TestProf は、example を個別にプロファイリングするための RSpec 用の組み込み shared context を提供しています:

```ruby
it "is doing heavy stuff", :rprof do
  # ...
end
```

**注意:** グローバルなプロファイリングが有効になっている場合、example 単位のプロファイリングは動作しません。

### RubyProf の設定

最も便利な設定オプションは `printer` です。これにより、RubyProf の [printer](https://github.com/ruby-prof/ruby-prof#printers) を指定できます。

printer は環境変数 `TEST_RUBY_PROF` で指定できます:

```sh
TEST_RUBY_PROF=call_stack bundle exec rake test
```

あるいは、コードの中で指定します:

```ruby
TestProf::RubyProf.configure do |config|
  config.printer = :call_stack
end
```

デフォルトでは `FlatPrinter` を使用します。

**注意:** example 単位のプロファイルの printer を指定するには、環境変数 `TEST_RUBY_PROF_PRINTER` を使用してください (`TEST_RUBY_PROF` を使うとグローバルなプロファイリングが有効になってしまうためです)。

また、RubyProf のモード (`wall`、`cpu` など) は環境変数 `TEST_RUBY_PROF_MODE` で指定できます。

利用可能なすべての設定オプションとその使い方については、[ruby_prof.rb](https://github.com/test-prof/test-prof/tree/master/lib/test_prof/ruby_prof.rb) を参照してください。

アプリケーションのコードだけに集中するために、一部のメソッドをプロファイルから除外すると便利です。

TestProf はデフォルトで RubyProf の [`exclude_common_methods!`](https://github.com/ruby-prof/ruby-prof/blob/e087b7d7ca11eecf1717d95a5c5fea1e36ea3136/lib/ruby-prof/profile/exclude_common_methods.rb) を使用します (`config.exclude_common_methods = false` で無効にできます)。

そのほかの一般的なメソッドや RSpec 固有の内部メソッドも、デフォルトで除外しています。
TestProf が定義している除外設定を無効にするには、`config.test_prof_exclusions_enabled = false` を設定してください。

`config.custom_exclusions` で独自の除外設定を指定できます。例:

```ruby
TestProf::RubyProf.configure do |config|
  config.custom_exclusions = {User => %i[save save!]}
end
```

[StackProf]: https://github.com/tmm1/stackprof
[Speedscope]: https://www.speedscope.app
[Vernier]: https://github.com/jhawthorn/vernier
