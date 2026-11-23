# MemoryProf

MemoryProf は、テストスイートの実行中のメモリ使用量を追跡し、メモリの急増を引き起こす example や group を見つけるのに役立ちます。メモリのプロファイリングは、RSS、アロケーション、GC 時間というメトリクスをサポートしています。

出力例:

```sh
[TEST PROF INFO] MemoryProf results

Final RSS: 673KB

Top 5 groups (by RSS):

AnswersController (./spec/controllers/answers_controller_spec.rb:3) – +80KB (13.50%)
QuestionsController (./spec/controllers/questions_controller_spec.rb:3) – +32KB  (9.08%)
CommentsController (./spec/controllers/comments_controller_spec.rb:3) – +16KB (3.27%)

Top 5 examples (by RSS):

destroys question (./spec/controllers/questions_controller_spec.rb:38) – +144KB (24.38%)
change comments count (./spec/controllers/comments_controller_spec.rb:7) – +120KB (20.00%)
change Votes count (./spec/shared_examples/controllers/voted_examples.rb:23) – +90KB (16.36%)
change Votes count (./spec/shared_examples/controllers/voted_examples.rb:23) – +64KB (12.86%)
fails (./spec/shared_examples/controllers/invalid_examples.rb:3) – +32KB (5.00%)
```

この出力は、各 example とトップレベルの example group (通常はテストファイル) が使用したメモリの量を示しています。

## 使い方

MemoryProf を有効にする方法は次のとおりです。

### RSpec

環境変数 `TEST_MEM_PROF` で、使用するメトリクスを指定します。

```sh
TEST_MEM_PROF='rss' rspec ...
TEST_MEM_PROF='alloc' rake rspec ...
TEST_MEM_PROF='gc' rake rspec ...
```

### Minitest

Minitest 6 以降では、まずテストヘルパーに `Minitest.load :test_prof` を追加して、TestProf プラグインを有効にする必要があります。

環境変数 `TEST_MEM_PROF` で、使用するメトリクスを指定します。

```sh
TEST_MEM_PROF='rss' rake test
TEST_MEM_PROF='alloc' rake test
TEST_MEM_PROF='gc' rake test
```

CLI オプションを使うこともできます。

```sh
# CLI オプションを使って特定のファイルを実行する
ruby test/my_super_test.rb --mem-prof=rss

# 使用できるオプションの一覧を表示する
ruby test/my_super_test.rb --help
```

## 設定

デフォルトでは、MemoryProf はメモリ使用量の多い上位 5 件の example と group を追跡します。
表示する example や group の件数は、次のオプションで指定できます。

```sh
TEST_MEM_PROF='rss' TEST_MEM_PROF_COUNT=10 rspec ...
```

Minitest の場合は CLI オプションで指定します。

```sh
# CLI オプションを使って特定のファイルを実行する
ruby test/my_super_test.rb --mem-prof=rs --mem-prof-top-count=10
```

## サポートされる Ruby エンジンと OS

現在、アロケーションモードは JRuby ではサポートされていません。

RSS は OS に依存するため、MemoryProf は RSS の取得に OS ごとに異なる手段を使用します。

* Linux – `/proc/$pid/statm` ファイル
* macOS, Solaris, BSD – `ps`
* Windows – `Get-Process` (PowerShell がインストールされている必要があります)
