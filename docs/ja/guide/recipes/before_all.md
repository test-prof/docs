# Before All

Rails には `transactional_tests` という優れた機能があります。これは、各 example をトランザクションの中で実行し、最後にロールバックするというものです。

そのため、どの example もデータベースのグローバルな状態を汚しません。

しかし、共通のセットアップを持つ example がたくさんある場合はどうでしょうか？

もちろん、次のように書くことはできます。

```ruby
describe BeatleWeightedSearchQuery do
  before(:each) do
    @paul = create(:beatle, name: "Paul")
    @ringo = create(:beatle, name: "Ringo")
    @george = create(:beatle, name: "George")
    @john = create(:beatle, name: "John")
  end

  # そして、ここに 15 個ほどの example が並ぶ
end
```

あるいは `before(:all)` を試すこともできます。

```ruby
describe BeatleWeightedSearchQuery do
  before(:all) do
    @paul = create(:beatle, name: "Paul")
    # ...
  end

  # ...
end
```

しかしその場合は、データベースのクリーニングに対処しなければならず、これは厄介だったり遅かったりします。

もっと良い選択肢があります。example group 全体をトランザクションで包めばよいのです。
`before_all` はまさにそのように動作します。

```ruby
describe BeatleWeightedSearchQuery do
  before_all do
    @paul = create(:beatle, name: "Paul")
    # ...
  end

  # ...
end
```

これだけです！

**注意**: RSpec >= 3.3.0 が必要です。

**注意**: `before_all` がもたらす大いなる力には、大いなる責任が伴います。
詳細については、このドキュメントの[注意点のセクション](#caveats)を必ず確認してください。

## 使い方

### 複数データベースのサポート

ActiveRecord の BeforeAll アダプタは、ActiveRecord::Base のコネクションを使ってのみトランザクションを開始します。
`before_all` で複数のコネクションを使えるようにしたい場合は、`before_all` を使う前に
コネクションクラスがロードされているようにする必要があります。

たとえば、`ApplicationRecord` と、ユーザーアカウント用の別のデータベースがあるとします。

```ruby
class Users < AccountsRecord
  # ...
end

class Articles < ApplicationRecord
  # ...
end
```

この場合、テストを実行する前に、これら 2 つのコネクションクラスをロードしておく必要があります。

```ruby

# コネクションクラスが確実にロードされるようにする
ApplicationRecord
AccountsRecord
```

このコードは `rails_helper.rb` や、Minitest を実行する rake タスクに追加できます。

### RSpec

`rails_helper.rb` (または `spec_helper.rb` の *ActiveRecord* がロードされた後) に次の記述を追加してください。

```ruby
require "test_prof/recipes/rspec/before_all"
```

**注意**: `before_all` (およびそれに依存する `let_it_be`) は、個々のテストを
独自のデータベーストランザクションで包むことはしません。Rails ネイティブの `use_transactional_tests`
(Rails < 5.1 では `use_transactional_fixtures`)、RSpec Rails の `use_transactional_fixtures`、
DatabaseCleaner、あるいは各テストの前にトランザクションを開始して後でロールバックする
独自のコードを使ってください。

### Minitest

`before_all` は Minitest でも使うことができます。

```ruby
require "test_prof/recipes/minitest/before_all"

class MyBeatlesTest < Minitest::Test
  include TestProf::BeforeAll::Minitest

  before_all do
    @paul = create(:beatle, name: "Paul")
    @ringo = create(:beatle, name: "Ringo")
    @george = create(:beatle, name: "George")
    @john = create(:beatle, name: "John")
  end

  # `before_all` の中で定義したオブジェクトにアクセスできるテストを定義する
end
```

`before_all` に加えて、TestProf は `after_all` コールバックも提供しています。これは、`before_all` が開いたトランザクションが閉じられる直前、つまりテストクラスの最後の example が完了した後に呼び出されます。

## データベースアダプタ

`before_all` は、(標準でサポートされている) ActiveRecord だけでなく、他のデータベースツールでも使うことができます。

必要なのは、カスタムアダプタを作成し、それを使うように `before_all` を設定することだけです。

```ruby
class MyDBAdapter
  # before_all のアダプタは次の 2 つのメソッドを実装しなければなりません:
  # - begin_transaction
  # - rollback_transaction
  def begin_transaction
    # ...
  end

  def rollback_transaction
    # ...
  end
end

# そして `BeforeAll` モジュールにアダプタを設定する
TestProf::BeforeAll.adapter = MyDBAdapter.new
```

## フック

`before_all` がトランザクションを開く前後、およびロールバックする前後に実行されるコールバックを登録できます。

```ruby
TestProf::BeforeAll.configure do |config|
  config.before(:begin) do
    # トランザクションが開く前に何か処理を行う
  end
  # after(:begin) も利用できます

  config.after(:rollback) do
    # トランザクションが閉じた後に何か処理を行う
  end
  # before(:rollback) も利用できます
end
```

[Discourse](https://github.com/discourse/discourse/blob/4a1755b78092d198680c2fe8f402f236f476e132/spec/rails_helper.rb#L81-L141) での使用例をご覧ください。

## 注意点 {#caveats}

### データベースは元の状態にロールバックされるが、オブジェクトはされない

`before_all` ブロックの中で生成したオブジェクトを example の中で変更する場合、オブジェクトを初期化し直す必要があるかもしれません。

```ruby
before_all do
  @user = create(:user)
end

let(:user) { @user }

it "when user is admin" do
  # オブジェクトをその場で変更してしまった！
  user.update!(role: 1)
  expect(user).to be_admin
end

it "when user is regular" do
  # こうなると @user の状態は spec の実行順序に依存する！
  expect(user).not_to be_admin
end
```

これを解決する最も簡単な方法は、example ごとにレコードをリロードすることです (それでも新しく作成するよりずっと高速です)。

```ruby
before_all do
  @user = create(:user)
end

# @user.reload では不十分な場合があることに注意してください。
# 関連付けがリセットされないためです
let(:user) { User.find(@user.id) }

# あるいは Minitest の場合
def setup
  @user = User.find(@user.id)
end
```

### データベースはテスト間ではロールバックされない

`before_all` がデータベースをロールバックするのは example group の間だけで、RSpec の example の間ではロールバックしません。
私たちは車輪の再発明をしたくないので、この機能を標準で提供している
他のツールを使うことをお勧めします。

RSpec Rails を使っている場合は、`spec/rails_helper.rb` で `RSpec.configuration.use_transactional_fixtures` を有効にしてください。

```ruby
RSpec.configure do |config|
  config.use_transactional_fixtures = true # RSpec は、使用している Rails のバージョンに応じて `use_transactional_tests` と `use_transactional_fixtures` を使い分けてくれます
end
```

Minitest を使っている場合は、`use_transactional_tests` (Rails < 5.1 では `use_transactional_fixtures`) を必ず `true` に設定してください。

DatabaseCleaner を使っている場合は、テスト間でデータベースがロールバックされるようになっていることを確認してください。

## Isolator と併用する

[Isolator](https://github.com/palkan/isolator) は、DB トランザクション内でアトミック性が破られる可能性のある箇所 (HTTP 呼び出しやバックグラウンドジョブのエンキューなど) を実行時に検出するツールです。

TestProf は Isolator を標準で認識し、`before_all` のトランザクションを無視させます。

必要なのは、`before_all` (または `let_it_be`) をロードする前に `isolator` を require しておくことだけです。

あるいは、パッチを明示的にロードすることもできます。

```ruby
# before_all や let_it_be をロードした後に
require "test_prof/before_all/isolator"
```

## Rails のフィクスチャを使う (_実験的_)

`before_all` フックの中でフィクスチャを使いたい場合は、`setup_fixture:` オプションで明示的にオプトインする必要があります。

```ruby
before_all(setup_fixtures: true) do
  @user = users(:john)
  @post = create(:post, user: user)
end
```

Minitest と RSpec の両方で動作します。

フィクスチャをグローバルに (つまり、すべての `before_all` フックで) 有効にすることもできます。

```ruby
TestProf::BeforeAll.configure do |config|
  config.setup_fixtures = true
end
```

## グローバルタグ

タグを使って、特定の RSpec の example group に対するコールバックを登録できます。

```ruby
TestProf::BeforeAll.configure do |config|
  config.before(:begin, reset_sequences: true, foo: :bar) do
    warn <<~MESSAGE
      Do NOT create objects outside of transaction
      because all db sequences will be reset to 1
      in every single example, so that IDs of new objects
      can get into conflict with the long-living ones.
    MESSAGE
  end
end
```
