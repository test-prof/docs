# 詳細なロギング

何が起きているのかを突き止めるには、ログを掘り返すのが一番よい方法であることがあります。

テストスイートを実行しても、デフォルトではログは出力されません (`test.log` には書き込まれていますが、誰が気にするでしょうか？)。

特定の example や group に対して詳細なロギングを有効にするレシピを用意しています。

**注意:** Rails のみ。

## 使い方

`rails_helper.rb` / `spec_helper.rb` / `test_helper.rb` などに、次の 1 行を追加してください。

```ruby
require "test_prof/recipes/logging"
```

### すべてをログに出力する

ロギングをグローバルに有効にするには、環境変数 `LOG` を使います。

```sh
# すべてを標準出力にログ出力する
LOG=all rspec ...

# あるいは
LOG=all rake test

# Active Record のステートメントだけをログ出力する
LOG=ar rspec ...
```

### example ごとのロギング

**注意:** RSpec のみ。

特別なタグ `:log` を追加して、ロギングを有効にします。

```ruby
# タグを追加すると、コンソールに興味深いものがたくさん表示されます
it "does smthng weird", :log do
  # ...
end

# あるいは、group に対して
describe "GET #index", :log do
  # ...
end
```

Active Record のログだけを有効にするには、`log: :ar` タグを使います。

```ruby
describe "GET #index", log: :ar do
  # ...
end
```

### ロギングのヘルパー

より細かく制御するには、`with_logging` (すべてをログ出力する) と
`with_ar_logging` (Active Record をログ出力する) のヘルパーを使えます。

```ruby
it "does somthing" do
  do_smth
  # ブロック内のコードについてのみログを表示する
  with_logging do
    # ...
  end
end
```

**注意:** これらのヘルパーを Minitest で使うには、`TestProf::Rails::LoggingHelpers` モジュールを手動で include する必要があります。

```ruby
class MyLoggingTest < Minitest::Test
  include TestProf::Rails::LoggingHelpers
end
```
