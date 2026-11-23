# FactoryDefault

_FactoryDefault_ は、関連レコードを再利用することで、_ファクトリカスケード_ ([FactoryProf](../profilers/factory_prof.md) を参照) に対処するのを助けるためのものです。

典型的な SaaS アプリケーション (あるいは階層構造を持つその他のデータ) を扱っているときに、とても役に立ちます。

例を考えてみましょう。次のようなファクトリがあるとします。

```ruby
factory :account do
end

factory :user do
  account
end

factory :project do
  account
  user
end

factory :task do
  account
  project
  user
end
```

Fabrication の場合は次のようになります。

```ruby
Fabricator(:account) do
end

Fabricator(:user) do
  account
end

# など
```

そして、`Task` モデルをテストしたいとします。

```ruby
describe "PATCH #update" do
  let(:task) { create(:task) }

  it "works" do
    patch :update, id: task.id, task: {completed: "t"}
    expect(response).to be_success
  end

  # ...
end
```

example ごとに user と account はいくつ作られるでしょうか？ それぞれ 2 つと 4 つです。

そしてこれでは、すべてのオブジェクトが同じ account に属するという前提が崩れてしまいます。

典型的な回避策は次のとおりです。

```ruby
describe "PATCH #update" do
  let(:account) { create(:account) }
  let(:project) { create(:project, account: account) }
  let(:task) { create(:task, project: project, account: account) }

  it "works" do
    patch :update, id: task.id, task: {completed: "t"}
    expect(response).to be_success
  end
end
```

これは動作します。しかし欠点もあります。少し冗長で、間違いを起こしやすいのです (何かを書き忘れやすい)。

FactoryDefault を使うと、次のように対処できます。

```ruby
describe "PATCH #update" do
  let(:account) { create_default(:account) }
  let(:project) { create_default(:project) }
  let(:task) { create(:task) }

  # 同じ親レコードを持つ project、user、task がさらに必要な場合は、
  # 単にこう書くだけです
  let(:another_project) { create(:project) } # 同じ account を使う
  let(:another_task) { create(:task) } # 同じ account を使う

  it "works" do
    patch :update, id: task.id, task: {completed: "t"}
    expect(response).to be_success
  end
end
```

**注意**: この機能はテストに少しばかりの _魔法_ を持ち込むので、注意して使ってください (テストは何よりもまず人間が読めるものであるべきだからです)。デフォルトは、最上位のエンティティ (マルチテナントアプリケーションにおけるテナントなど) にだけ使うのがよいでしょう。

## 使い方

`spec_helper.rb` に以下を追加してください。

```ruby
require "test_prof/recipes/rspec/factory_default"
```

これにより、FactoryBot と Fabrication の両方、またはいずれかに次のメソッドが追加されます。

- `FactoryBot#set_factory_default(factory, object)` / `Fabricate.set_fabricate_default(factory, object)` – `factory` で組み立てられる関連に対して、`object` をデフォルトとして使います。

例:

```ruby
let(:user) { create(:user) }

before { FactoryBot.set_factory_default(:user, user) }

# trait 付きでデフォルトのファクトリを設定することもできます
FactoryBot.set_factory_default([:user, :admin], admin)

# あるいは (v1.4 以降)
FactoryBot.set_factory_default(:user, :admin, admin)

# 特定の属性の上書きに対してデフォルトのレコードを登録することもできます
Fabricate.set_fabricate_default(:post, post, state: "draft")
```

- `FactoryBot#create_default(...)` / `Fabricate.create_default(...)` – `create` + `set_factory_default` のショートカットです。

- `FactoryBot#get_factory_default(factory)` / `Fabricate.get_fabricate_default(factory)` – `factory` のデフォルト値を取得します (v1.4 以降)。

```rb
# このメソッドは trait にも対応しています
admin = FactoryBot.get_factory_default(:user, :admin)
```

**重要:** デフォルトは、標準では (つまり `test_prof/recipes/rspec/factory_default` を使っている場合は) **各 example の後にクリーンアップされます**。

### `before_all` / `let_it_be` と一緒に使う

`before_all` と `let_it_be` の中で作られたデフォルトは、各 example の後にはリセットされず、対応する example group の終わりでのみリセットされます。そのため、追加の設定なしで `let_it_be` の中から `create_default` を呼び出すことができます。**RSpec のみ**

**重要:** この機能を動作させるには、BeforeAll を読み込んだ後で FactoryDefault を読み込む必要があります。

**注意**: 通常の `before(:all)` コールバックには対応していません。

### trait を扱う

関連の中で trait を使うことができます。たとえば次のとおりです。

```ruby
factory :comment do
  user
end

factory :post do
  association :user, factory: %i[user able_to_post]
end

factory :view do
  association :user, factory: %i[user unable_to_post_only_view]
end
```

`user` ファクトリにデフォルト値がある場合、trait に関係なくそれが使われます。これはロジックを壊してしまうかもしれません。

これを防ぐには、trait を区別するように FactoryDefault を設定してください。

```ruby
# グローバルに
TestProf::FactoryDefault.configure do |config|
  config.preserve_traits = true
end

# あるいは、その場で
create_default(:user, preserve_traits: true)
```

trait 付きでデフォルトを作成すると、次のように動作します。

```ruby
# trait 付きでデフォルトを作成する
user = create_default(:user_poster, :able_to_post)

# 関連に trait が指定されていない場合は、trait 付きのデフォルトが使われます
create(:comment).user == user #=> true
# 関連に一致する trait が指定されている場合も、デフォルトが使われます
create(:post).user == user #=> true
# 関連の trait が異なる場合、デフォルトはスキップされます
create(:view).user == user #=> false
```

### 属性の上書きを扱う

関連に対して属性の上書きを定義することができます。

```ruby
factory :post do
  association :user, name: "Poster"
end

factory :view do
  association :user, name: "Viewer"
end
```

FactoryDefault はこのような上書きを無視し、(作成済みであれば) デフォルトの `user` レコードを返します。属性を考慮する機能を有効にすると、上書きがデフォルトのオブジェクトの属性と一致しない場合に、デフォルトのレコードをスキップできます。

```ruby
# グローバルに
TestProf::FactoryDefault.configure do |config|
  config.preserve_attributes = true
end

# あるいは、その場で
create_default :user, preserve_attributes: true
```

**注意:** TestProf の将来のバージョンでは、`preserve_traits` と `preserve_attributes` の両方がデフォルトで true になります。この機能を使い始めたばかりであれば、これらを true に設定することをお勧めします。

### デフォルトのファクトリを無視する

コードを `skip_factory_default` メソッドで囲むことで、デフォルトの使用を一時的に無効にできます。

```ruby
account = create_default(:account)
another_account = skip_factory_default { create(:account) }

expect(another_account).not_to eq(account)
```

### 使用状況の統計を表示する

環境変数 `FACTORY_DEFAULT_SUMMARY=1` または `FACTORY_DEFAULT_STATS=1` を設定するか、設定値を指定することで、FactoryDefault の使用状況の統計を表示できます。

```ruby
TestProf::FactoryDefault.configure do |config|
  config.report_summary = true
  # report_stats は詳細な使用状況 (サマリーを含む) を出力します
  config.report_stats = true
end
```

たとえば次のとおりです。

```sh
$ FACTORY_DEFAULT_SUMMARY=1 bundle exec rspec

FactoryDefault summary: hit=11 miss=3
```

ここで `hit` は、関連が作られる際に、新しい値の代わりにデフォルトのファクトリの値が使われた回数を示します。`miss` は、trait や属性の不一致によってデフォルト値が無視された回数を示します。

## FactoryDefault のプロファイリング、あるいはデフォルトをいつ使うべきか

FactoryDefault にはプロファイラが付属しています。テストスイートの中で関連がどのように使われているかを確認できるので、`create_default` を使うかどうかを判断するのに役立ちます。

プロファイリングを有効にするには、`FACTORY_DEFAULT_PROF=1` を設定してテストを実行してください。

```sh
$ FACTORY_DEFAULT_PROF=1 bundle exec rspec spec/some/file_spec.rb

.....

[TEST PROF INFO] Factory associations usage:

               factory      count    total time

                  user         17     00:42.010
         user[traited]         15     00:31.560
  user{tag:"some tag"}          1     00:00.205

Total associations created: 33
Total uniq associations created: 3
Total time spent: 01:13.775
```

デフォルトのファクトリは通常、example group (またはテストクラス) ごとに登録されるので、このプロファイラは特定のファイルに対して実行することをお勧めします。そうすれば、`create_default` を追加できる箇所をすばやく見つけ、テストの速度を改善できます。

**注意:** このプロファイラは、`create_default` を追加した効果を測るためにも使えます。そのためには、FactoryDefault を有効にした場合と無効にした場合のプロファイラの実行結果を比較してください (環境変数 `FACTORY_DEFAULT_DISABLED=1` を渡すことで無効にできます)。
