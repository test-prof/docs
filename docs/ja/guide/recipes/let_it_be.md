# Let It Be

少しばかりの魔法を持ち込んで、_共有_ のテストデータをセットアップする新しい方法を紹介しましょう。

次のようなセットアップがあるとします。

```ruby
describe BeatleWeightedSearchQuery do
  let!(:paul) { create(:beatle, name: "Paul") }
  let!(:ringo) { create(:beatle, name: "Ringo") }
  let!(:george) { create(:beatle, name: "George") }
  let!(:john) { create(:beatle, name: "John") }

  specify { expect(subject.call("john")).to contain_exactly(john) }

  # さらに example が続きます
end
```

example ごとに Fab Four を作り直す必要はありませんよね？

_繰り返し使える_ データを example ごとに作り直してしまう問題を解決するものとして、すでに [`before_all`](./before_all.md) があります。

```ruby
describe BeatleWeightedSearchQuery do
  before_all do
    @paul = create(:beatle, name: "Paul")
    # ...
  end

  specify { expect(subject.call("joh")).to contain_exactly(@john) }

  # ...
end
```

この手法はかなりうまく動作しますが、インスタンス変数を使い、すべてを一度に定義する必要があります。そのため、代わりに `let/let!` を使っている既存のテストをリファクタリングするのは簡単ではありません。

`let_it_be` を使うと、次のように書けます。

```ruby
describe BeatleWeightedSearchQuery do
  let_it_be(:paul) { create(:beatle, name: "Paul") }
  let_it_be(:ringo) { create(:beatle, name: "Ringo") }
  let_it_be(:george) { create(:beatle, name: "George") }
  let_it_be(:john) { create(:beatle, name: "John") }

  specify { expect(subject.call("john")).to contain_exactly(john) }

  # さらに example が続きます
end
```

これだけです！ `let!` を `let_it_be` に置き換えるだけです。これは `before_all` を使う方法と同等ですが、必要なリファクタリングは少なくて済みます。

**注意**: `before_all` がもたらす大いなる力には、大いなる責任が伴います。
詳細については、このドキュメントの[注意点のセクション](#caveats)を必ず確認してください。

## 使い方

`rails_helper.rb` または `spec_helper.rb` に以下を追加してください。

```ruby
require "test_prof/recipes/rspec/let_it_be"
```

テストでは次のように書きます。

```ruby
describe MySuperDryService do
  let_it_be(:user) { create(:user) }

  # ...
end
```

`let_it_be` は、example の間でデータベースを自動的に以前の状態へ戻すことはしません。
それを行うのは example group の間だけです。
Rails 標準の `use_transactional_tests` (Rails < 5.1 では `use_transactional_fixtures`)、
RSpec Rails の `use_transactional_fixtures`、DatabaseCleaner、あるいは
各テストの前にトランザクションを開始し、後でロールバックする独自のコードを使ってください。

## 注意点 {#caveats}

### データベースは元の状態にロールバックされるが、オブジェクトはされない

`let_it_be` ブロックの中で生成したオブジェクトを example の中で変更する場合、それらを再初期化する必要があるかもしれません。
そのために、組み込みの _モディファイア_ を用意しています。

### テストの間でデータベースはロールバックされない

データベースは RSpec の example の間ではロールバックされず、example group の間でのみロールバックされます。
私たちは車輪の再発明をしたくないので、これを標準で提供している他のツールを
使うことをお勧めします。

RSpec Rails を使っている場合は、`spec/rails_helper.rb` で `RSpec.configuration.use_transactional_fixtures` を有効にしてください。

```ruby
RSpec.configure do |config|
  config.use_transactional_fixtures = true # 使用している Rails のバージョンに応じて、RSpec が `use_transactional_tests` と `use_transactional_fixtures` を使い分けてくれます
end
```

Minitest を使っている場合は、`use_transactional_tests` (Rails < 5.1 では `use_transactional_fixtures`) を必ず `true` に設定してください。

DatabaseCleaner を使っている場合は、テストの間でデータベースがロールバックされるようにしてください。

## エイリアス

名前を付けるのは難しいものです。(上で述べたような) エッジケースを扱うのもやっかいです。

これを解決するために、あらかじめ決めたオプションを持つ `let_it_be` のエイリアスを定義する方法を用意しています。

```ruby
# rails_helper.rb
TestProf::LetItBe.configure do |config|
  # デフォルトで `refind: true` となるエイリアスを定義する
  config.alias_to :let_it_be_with_refind, refind: true
end

# そして、テストの中でそれを使う
describe "smth" do
  let_it_be_with_refind(:foo) { Foo.create }

  # それでも refind は上書きできる
  let_it_be_with_refind(:bar, refind: false) { Bar.create }
end
```

## モディファイア

`let_it_be` ブロックの中で生成したオブジェクトを example の中で変更する場合、example 間で状態が持ち越されるのを避けるために、それらを再初期化する必要があるかもしれません。
データベースが元の状態にロールバックされても、モデル自体は元に戻らないことを覚えておいてください。

モデルを元の状態に戻すために、組み込みの _モディファイア_ を用意しています。

```ruby
# reload: true オプションを使うと、example ごとに user オブジェクトを
# リロードします (ActiveRecord のインスタンスであることを想定)
let_it_be(:user, reload: true) { create(:user) }

# これは次のコードとほぼ同等です
before_all { @user = create(:user) }
let(:user) { @user.reload }

# refind: true オプションを指定して、レコードを完全に読み込み直すこともできます
let_it_be(:user, refind: true) { create(:user) }

# これは次のコードとほぼ同等です
before_all { @user = create(:user) }
let(:user) { User.find(@user.id) }
```

**注意:** `let_it_be` は、必ず `active_record` が読み込まれた後で require してください (たとえば、`rails_helper.rb` の中で Rails アプリケーションを require した**後**)。そうしないと、`refind` と `reload` のモディファイアは有効になりません。

モディファイアは、`create_list` のような配列の値に対しても使えます。

```ruby
let_it_be(:posts, reload: true) { create_list(:post, 3) }

# これは次のコードと同じです
before_all { @posts = create_list(:post, 3) }
let(:posts) { @posts.map(&:reload) }
```

### カスタムモディファイア

`reload` と `refind` だけでは足りない場合は、独自のモディファイアを追加できます。

```ruby
# rails_helper.rb
TestProf::LetItBe.configure do |config|
  # example の中でレコードに最初にアクセスしたときに呼び出されるブロックを定義します。
  # 第 1 引数は初期化済みのレコード、
  # 第 2 引数はモディファイアの値です。
  #
  # `reload` モディファイアは次のように定義されています
  config.register_modifier :reload do |record, val|
    # `reload: false` の場合は無視する
    next record unless val
    # ActiveRecord 以外のオブジェクトは無視する
    next record unless record.is_a?(::ActiveRecord::Base)
    record.reload
  end
end
```

### デフォルトのモディファイア

すべての `let_it_be` の呼び出しで使われるデフォルトのモディファイアを設定できます。

- グローバルに:

```ruby
TestProf::LetItBe.configure do |config|
  # refind をデフォルトで有効にする
  config.default_modifiers[:refind] = true
end
```

- タグを使って特定のコンテキストに対して:

```ruby
context "with let_it_be reload", let_it_be_modifiers: {reload: true} do
  # example
end
```

**注意:** ネストしたコンテキストのタグはマージされず、上書きされます。

```ruby
TestProf::LetItBe.configure do |config|
  config.default_modifiers[:freeze] = false
end

context "with reload", let_it_be_modifiers: {reload: true} do
  # ここでは freeze: false, reload: true が使われる

  context "with freeze", let_it_be_modifiers: {freeze: true} do
    # freeze: true だけが使われる (reload: true は新しいメタデータで上書きされる)
  end
end
```

## 状態の持ち越しの検出

[`rspec-rails` のドキュメント](https://relishapp.com/rspec/rspec-rails/v/3-9/docs/transactions)には、トランザクションと `before(:context)` について次のように書かれています。

> Even though database updates in each example will be rolled back, the object won't know about those rollbacks so the object and its backing data can easily get out of sync.
>
> (各 example でのデータベースの更新はロールバックされますが、オブジェクトはそのロールバックを知らないため、オブジェクトとその裏にあるデータは簡単に食い違ってしまいます。)

`let_it_be` は内部的に `before(:context)` フックの中でオブジェクトを初期化するので、この問題の影響を受けます。つまり、example の間で共有されているモデルをコードが変更してしまうかもしれません (その結果、_共有状態の持ち越し_ が起こります)。これは意図せずに起こることがあります。たとえば、テスト対象のコードがモデルを変更する場合 (`updated_at` 属性を変更するなど) です。あるいは意図的に起こることもあります。最初から適切な状態でモデルを作る代わりに、`before` フックや example 自体の中でモデルを更新する場合です。

この状態の持ち越しは、暗黙の依存関係や実行順序への依存といった、他の example に対する有害になりうる副作用を伴います。

多くの example の間で多くのモデルが共有されていると、モデルを変更している example とコード上の正確な場所を突き止めるのは困難です。

変更を検出するために、`let_it_be` で定義したオブジェクトは (`#freeze` で) フリーズされ、変更しようとすると `FrozenError` が発生します。

```ruby
# この機能を有効にするには freeze: true モディファイアを使います
let_it_be(:user, freeze: true) { create(:user) }

# これは次のコードとほぼ同等です
before_all { @user = create(:user).freeze }
let(:user) { @user }
```

`FrozenError` を修正するには、次のようにします。

- `reload: true`/`refind: true` を追加する。これにより検出のエラーが出なくなり、状態の持ち越しそのものも防げます。通常、各 example の前にモデルをゼロから作り直すよりも、リロードするほうがはるかに高速です (場合によっては 2 桁、あるいは 3 桁も速くなります)。
- 問題のあるテストコードを書き直す。

この機能はオプトインです。spec の中で相当な数の持ち越しが見つかり、それらを一度にすべて修正するのは大きな負担になりうるからです。
次のようにすることで、spec の一部 (たとえばモデルだけ) に対して段階的に有効にできます。

```ruby
# spec/spec_helper.rb
RSpec.configure do |config|
  # ...
  config.define_derived_metadata(let_it_be_frost: true) do |metadata|
    metadata[:let_it_be_modifiers] ||= {freeze: true}
  end
end
```

そのうえで、コンテキストや example に `:let_it_be_frost` タグを付けて、この機能を有効にします。

あるいは、`freeze` モディファイアを明示的に指定する (`let_it_be(freeze: true)`) か、エイリアスを設定することもできます。

## 重複のレポート

私たちは `let!` の代わりに `let_it_be` を使うことを提案していますが、重要な違いが 1 つあります。`let!` の定義は同じコンテキストやネストしたコンテキストで上書きでき、その場合は後者だけが呼び出されます。一方、`let_it_be` の定義も上書きできますが、上書きされた側のレコードも作られます。たとえば次のとおりです。

```ruby
context "A" do
  let!(:user) { create(:user, name: "a") }
  let_it_be(:post) { create(:post, title: "A") }

  specify { expect(User.all.pluck(:name)).to eq ["a"] }
  specify { expect(Post.all.pluck(:title)).to eq ["A"] }

  context "B" do
    let!(:user) { create(:user, name: "b") }
    let_it_be(:post) { create(:post, title: "B") }

    specify { expect(User.all.pluck(:name)).to eq ["b"] }
    specify { expect(Post.all.pluck(:title)).to eq ["B"] } # post が 2 つあるため失敗する
  end
end
```

そこで、let_it_be が上書きされたときの振る舞いを設定できるようにしています。

```ruby
TestProf::LetItBe.configure do |config|
  config.report_duplicates = :warn # Rspec.warn_with
  config.report_duplicates = :raise # Kernel.raise
end
```

デフォルトでは、このパラメータは無効になっています。警告を出すか、例外を発生させるかの振る舞いを設定できます。
