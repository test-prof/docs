# Factory Doctor

テストを遅くするよくある悪いパターンのひとつが、不要なデータベース操作です。次の _悪い_ 例を考えてみましょう。

```ruby
# FactoryBot の場合
it "validates name presence" do
  user = create(:user)
  user.name = ""
  expect(user).not_to be_valid
end

# Fabrication の場合
it "validates name presence" do
  user = Fabricate(:user)
  user.name = ""
  expect(user).not_to be_valid
end
```

ここでは新しい user レコードを作成し、すべてのコールバックとバリデーションを実行して、データベースに保存しています。これらはどれも必要ありません！ 次が _良い_ 例です。

```ruby
# FactoryBot の場合
it "validates name presence" do
  user = build_stubbed(:user)
  user.name = ""
  expect(user).not_to be_valid
end

# Fabrication の場合
it "validates name presence" do
  user = Fabricate.build(:user)
  user.name = ""
  expect(user).not_to be_valid
end
```

詳しくは [`build_stubbed`](https://thoughtbot.com/blog/use-factory-bots-build-stubbed-for-a-faster-test) についての記事を参照してください。

FactoryDoctor は、このような _悪い_ テスト、つまり不要なデータベースクエリを実行しているテストを特定するのに役立つツールです。

出力例:

```sh
[TEST PROF INFO] FactoryDoctor report

Total (potentially) bad examples: 2
Total wasted time: 00:13.165

User (./spec/models/user_spec.rb:3) (3 records created, 00:00.628)
  validates name (./spec/user_spec.rb:8) – 1 record created, 00:00.114
  validates email (./spec/user_spec.rb:8) – 2 records created, 00:00.514
```

**注意**: 「potentially (可能性のある)」という言葉に気づきましたか？ 残念ながら、FactoryDoctor は魔法使いではなく (まだ勉強中です)、偽陰性や偽陽性を出すこともあります。

FactoryDoctor がうまく動かないケースを見つけたら、ぜひ [issue](https://github.com/test-prof/test-prof/issues) を登録してください。

特定の example や group を無視するよう FactoryDoctor に伝えることもできます。`:fd_ignore` タグを付けるだけです。

```ruby
# 違反として報告されない
it "is ignored", :fd_ignore do
  user = create(:user)
  user.name = ""
  expect(user).not_to be_valid
end
```

## 使い方

FactoryDoctor は次のものをサポートしています。

- FactoryBot
- Fabrication.

### RSpec

FactoryDoctor を有効にするには、環境変数 `FDOC` を使用します。

```sh
FDOC=1 rspec ...
```

### RSpecStamp と併用する

FactoryDoctor を [RSpec Stamp](../recipes/rspec_stamp.md) と併用すると、_悪い_ example にカスタムタグを自動で付けることができます。たとえば次のようにします。

```sh
FDOC=1 FDOC_STAMP="fdoc:consider" rspec ...
```

上のコマンドを実行すると、悪い _可能性のある_ example のすべてに `fdoc: :consider` タグが付きます。

### Minitest

Minitest 6 以降では、まずテストヘルパーに `Minitest.load :test_prof` を追加して、TestProf プラグインを有効にする必要があります。

FactoryDoctor を有効にするには、環境変数 `FDOC` を使用します。

```sh
FDOC=1 ruby ...
```

あるいは、次のように CLI オプションを使用します。

```sh
ruby ... --factory-doctor
```

特定の example を Factory Doctor に無視させるオプションは、Minitest でも同じように使えます。
example の中で `fd_ignore` を使うだけです。

```ruby
# 違反として報告されない
it "is ignored" do
  fd_ignore

  @user.name = ""
  refute @user.valid?
end
```

### Minitest::Reporters と併用する

プロジェクトで `Minitest::Reporters` を使用している場合は、テストヘルパーのファイルで明示的に宣言する必要があります。

```sh
require 'minitest/reporters'
Minitest::Reporters.use! [YOUR_FAVORITE_REPORTERS]
```

**注意**: `minitest-reporters` が gem としてインストールされているものの `Gemfile` には宣言されていない場合は、テストの実行コマンドの前に必ず `bundle exec` を付けてください (いつもそうしているとは思いますが)。
そうしないと、Minitest のプラグインシステムが原因でエラーになります。このシステムは `$LOAD_PATH` 内のすべてのエントリから `minitest/*_plugin.rb` を探すため、その場合に利用可能となる `minitest-reporters` プラグインの初期化が正しく行われません。

## 設定

次の設定パラメータを利用できます (デフォルト値を示しています)。

```ruby
TestProf::FactoryDoctor.configure do |config|
  # example を「DB を汚した」とみなすために、example 内で追跡するイベント
  config.event = "sql.active_record"
  # DB での所要時間がしきい値より短ければ、結果を「良い」とみなす
  config.threshold = 0.01
end
```

対応する環境変数 `FDOC_EVENT` と `FDOC_THRESHOLD` も使用できます。
