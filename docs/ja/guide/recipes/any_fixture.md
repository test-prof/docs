# AnyFixture

フィクスチャはテストスイートの性能を上げる優れた方法ですが、大規模なプロジェクトでは保守がとても難しくなります。

そこで私たちは、テストスイートの _グローバルな_ 状態を遅延生成する、より汎用的なアプローチである AnyFixture を提案します。

AnyFixture では、任意のコードブロックをデータ生成に使うことができ、実行の最後にそのデータを片付ける処理も AnyFixture が引き受けます。

次の例を考えます。

```ruby
# AnyFixture を使う一番良い方法は、RSpec の shared context を経由することです
RSpec.shared_context "account", account: true do
  # example 間で同じデータを再利用するために、
  # AnyFixture はトランザクションの外で呼び出す必要があります
  before(:all) do
    # 指定する名前 ("account") は一意でなければなりません。
    @account = TestProf::AnyFixture.register(:account) do
      # ここでは何をしても構いません。AnyFixture は影響を受けた DB テーブルを追跡します
      # たとえば、ここでファクトリを使うことができます
      FactoryBot.create(:account)

      # あるいは Fabrication を使う
      Fabricate(:account)

      # あるいは昔ながらの素の AR を使う
      Account.create!(name: "test")
    end
  end

  # フィクスチャのレコードを取得するには .cached を使います
  let(:account) { TestProf::AnyFixture.cached(:account) }
end

# 既存のデータベースのクリーニングを拡張することもできます。Post はフィクスチャのリセット前に削除されます
TestProf::AnyFixture.before_fixtures_reset do
  Post.delete_all
end

# あるいはリセットの後に
TestProf::AnyFixture.after_fixtures_reset do
  Post.delete_all
end

# そして、テストの中では

# タグを使ってこのフィクスチャを有効にします
describe UsersController, :account do
  # ...
end

# このテストも同じ account レコードを使います。
# 二重に作成されることはありません
describe PostsController, :account do
  # ...
end
```

実際の[使用例](http://bit.ly/any-fixture)もご覧ください。

## 使い方

### RSpec

`spec_helper.rb` (`rails_helper.rb` がある場合はそちら) に次の記述を追加してください。

```ruby
require "test_prof/recipes/rspec/any_fixture"
```

これで、テストの中で `TestProf::AnyFixture` を使えるようになります。

### Minitest

AnyFixture を Minitest で使う場合は、テスト実行後のデータベースのクリーニングを自分で行う必要があります。たとえば次のようにします。

```ruby
# test_helper.rb

require "test_prof/any_fixture"

at_exit { TestProf::AnyFixture.clean }
```

## DSL

フィクスチャの定義やコールバックの利用を簡単にするために、(Refinement を通じて) 任意で使える _シンタックスシュガー_ を用意しています。

```ruby
require "test_prof/any_fixture/dsl"

# RSpec で DSL を有効にする
RSpec.configure do |config|
  config.include TestProf::AnyFixture::DSL
end

# Minitest
class MyBaseTestCase < Minitest::Test
  include TestProf::AnyFixture::DSL
end

# これで `fixture` メソッド (`TestProf::AnyFixture.register` の単なるエイリアス) を使えます
before(:all) { fixture(:account) { create(:account) } }

# (インスタンス変数に保存する代わりに) レコードの取得にも使えます
let(:account) { fixture(:account) }

# `before_fixtures_reset` や `after_fixtures_reset` コールバックもそのまま使えます
before_fixtures_reset { Post.delete_all }
after_fixtures_reset { Post.delete_all }
```

なお、`#fixture` メソッドは読み出し時に Active Record オブジェクトを _再検索_ します。つまり、次の 2 つの式は同じように動作します。

```ruby
let(:account) { fixture(:account) }

# 次と同様

let(:account) { Account.find(TestProf::AnyFixture.cached(:account).id) }
```

## フィクスチャを一時的に無効にする

テストの中には _クリーンなデータベース_ に依存するものがあるかもしれません。そうしたテストを AnyFixture に依存するテストと一緒に実行すると、失敗することがあります。

`:with_clean_fixture` shared context を使うと、指定した example や example group の実行中、作成済みのフィクスチャをすべて無効にする (削除する) ことができます。

```ruby
context "global state", :with_clean_fixture do
  # あるいは明示的に include する
  # include_context "any_fixture:clean"

  specify "table is empty or smth like this" do
    # ...
  end
end
```

どのような仕組みでしょうか？ これは example group を ([`before_all`](./before_all.md) を使って) トランザクションで包み、example の実行前に `TestProf::AnyFixture.clean` と `TestProf::AnyFixture.disable!` を呼び出し、コンテキストを抜けるときに `TestProf::AnyFixture.enable!` を呼び出します。`disable!` / `enable!` メソッドはキャッシュの状態を切り替えます。これにより、登録時に渡したブロックを、AnyFixture が存在しないかのように再利用できます。

```ruby
# AnyFixture が無効になっている場合、ここで新しい account を作成します
let(:account) { fixture(:account) { create(:account) } }
```

フィクスチャのリセット (つまり、影響を受けたテーブルからのデータ削除) は _重い_ 処理になることがあります。そのような状況は避け、グローバルな状態に依存しない spec を書くようにしてください。

## 使用状況のレポート

`AnyFixture` はテストの実行中に使用状況の情報を収集し、最後にそれをレポートすることができます。

```sh
[TEST PROF INFO] AnyFixture usage stats:

       key    build time  hit count    saved time

      user     00:00.004          4     00:00.017
      post     00:00.002          1     00:00.002

Total time spent: 00:00.006
Total time saved: 00:00.019
Total time wasted: 00:00.000
```

レポートはデフォルトではオフになっています。有効にするには `TestProf::AnyFixture.config.reporting_enabled = true` を設定してください (あるいは `TestProf::AnyFixture.report_stats` を通じて手動で呼び出すこともできます)。

環境変数 `ANYFIXTURE_REPORT=1` でレポートを有効にすることもできます。

## 自動生成された SQL ダンプを使う

> @since v1.0, experimental

AnyFixture は、テストスイートの実行 1 回につき 1 度だけデータを生成する (そして最後にクリーンアップする) ように設計されています。それでも (システムテストやパフォーマンステストなどでは) 時間がかかることがあるため、さらに最適化したくなります。

そこで、テストデータの準備を高速化するもう 1 つの方法として `#register_dump` を用意しています。初回の実行では `#register` と同じように動作します。つまり、コードブロックを受け取り、その中で発行された SQL クエリを追跡します。そして、その呼び出しの中で作成または変更されたデータを表す素の SQL ダンプを生成し、以降のテスト実行ではこのダンプを使ってデータベースの状態を復元します。

例を見てみましょう。

```ruby
RSpec.shared_context "account", account: true do
  # example 間で同じデータを再利用するために、
  # AnyFixture はトランザクションの外で呼び出す必要があります
  before(:all) do
    # このブロックはテスト実行 1 回につき 1 度だけ呼び出されます (#register と同様)
    TestProf::AnyFixture.register_dump("account") do
      # ここでは何をしても構いません。AnyFixture は影響を受けた DB テーブルを追跡します
      # たとえば、ここでファクトリを使うことができます
      account = FactoryBot.create(:account, name: "test")

      # あるいは Fabrication を使う
      account = Fabricate(:account, name: "test")

      # あるいは昔ながらの素の AR を使う
      account = Account.create!(name: "test")

      # 更新も追跡されます
      account.update!(tag: "sql-dump")
    end
  end

 # ここでは、レコードを取得する独自の方法を使わなければなりません。データは
 # 素の SQL ダンプから復元されるため、Ruby オブジェクトについては何も分からないからです
  let(:account) { Account.find_by!(name: "test") }
end
```

そして、テストを実行すると次のようなことが起こります。

```sh
# 1 回目の実行
$ bundle exec rspec

# AnyFixture.register_dump が呼び出される:
# - SQL ダンプは存在するか？ いいえ
# - ブロックを実行し、データを変更するすべてのクエリを新しい SQL ダンプに書き出す
# AnyFixture.clean が呼び出される:
# - 影響を受けたすべてのテーブルをクリーンアップする

# 2 回目の実行
$ bundle exec rspec

# AnyFixture.register_dump が呼び出される:
# - SQL ダンプは存在するか？ はい
# - ダンプを復元する (ブロックは実行しない)
# AnyFixture.clean が呼び出される:
# - 影響を受けたすべてのテーブルをクリーンアップする
```

### 要件

現在サポートされているのは PostgreSQL 12 以上と SQLite3 のみです。

### ダンプの無効化

生成されたダンプは、データベーススキーマの変更やフィクスチャのブロックの更新など、さまざまな理由で古くなることがあります。
古くなったダンプを使わないようにするため、ファイル内容のダイジェストを _キャッシュキー_ (ダンプファイル名のサフィックス) として使っています。

デフォルトでは、AnyFixture は `db/schema.rb`、`db/structure.sql`、および `#register_dump` を呼び出しているファイルを _監視_ します。

デフォルトの監視対象ファイルの一覧は、設定パラメータ `default_dump_watch_paths` を変更することで更新できます。

```ruby
TestProf::AnyFixture.configure do |config|
  # 正確なファイルパスや glob を使えます
  config.default_dump_watch_paths << Rails.root.join("spec/factories/**/*")
end
```

また、`watch` オプションを使って、特定の `#register_dump` の呼び出しに監視対象ファイルを追加できます。

```ruby
TestProf::AnyFixture.register_dump("account", watch: ["app/models/account.rb", "app/models/account/**/*,rb"]) do
  # ...
end
```

**注意:** `watch` オプションを使う場合、現在のファイルは監視リストに追加されません。追加するには `__FILE__` を明示的に指定してください。

最後に、ダンプを強制的に再生成したい場合は、環境変数 `ANYFIXTURE_FORCE_DUMP` を使えます。

- `ANYFIXTURE_FORCE_DUMP=1` は、すべてのダンプを強制的に再生成します。
- `ANYFIXTURE_FORCE_DUMP=account` は、マッチするダンプ (つまり `/account/` にマッチするもの) だけを強制的に再生成します。

#### キャッシュキー

ダイジェストの一部として使われる独自のキャッシュキーを指定することもできます。

```ruby
# cache_key には、#to_s に応答するものならほぼ何でも指定できます
TestProf::AnyFixture.register_dump("account", cache_key: ["str", 1, {key: :val}]) do
  # ...
end
```

### フック

#### `before` / `after`

before フックは、フィクスチャのブロックを呼び出す前、またはダンプを復元する前に呼び出されます。
具体的なユースケースの 1 つは、マルチテナントアプリケーションでテナントを作り直すことです。

```ruby
TestProf::AnyFixture.register_dump(
  "account",
  before: proc do
    begin
      Apartment::Tenant.create("test")
    rescue
      nil
    end
    Apartment::Tenant.create("test")
  end
) do
  # ...
end
```

同様に、after フックは、フィクスチャのブロックを呼び出した後、またはダンプを復元した後に呼び出されます。

グローバルな before フックと after フックを指定することもできます。

```ruby
TestProf::AnyFixture.configure do |config|
  config.before_dump do |dump:, import:|
    # dump はダンプに関する情報 (例: dump.digest) を持つオブジェクトです
    # import は、ダンプを復元している場合は true、そうでなければ false です
    # 何か処理を行う
  end

  config.after_dump do |dump:, import:|
    # ...
  end
end
```

**注意**: after コールバックは、ダンプの作成に失敗した場合でも必ず実行されます。データ生成が成功したかどうかは `dump.success?` メソッドで判定できます。

#### `skip_if`

このコールバックは `#register_dump` のオプションとしてのみ利用でき、フィクスチャを完全に無視するために使えます。テスト実行をまたいでデータベースの状態を保持したい (つまり DB をクリーンアップしない) 場合に便利です。

完全な例を次に示します。

```ruby
TestProf::AnyFixture.register_dump(
  "account",
  # AnyFixture.clean のためのテーブル追跡を行わない (ただし、他のフィクスチャが影響することはあります)
  clean: false,
  skip_if: proc do |dump:|
    Apartment::Tenant.switch!("test")
    # 現在の account がマッチする meta を持っていれば、データベースは最新の状態です
    Account.find_by!(name: "test").meta["dump-version"] == dump.digest
  end,
  before: proc do
    begin
      Apartment::Tenant.create("test")
    rescue
      nil
    end
    Apartment::Tenant.create("test")
  end,
  after: proc do |dump:, import:|
    # ダンプに失敗した場合やデータを復元している場合は、ダンプのバージョンを保存しない
    next if import || !dump.success?

    Account.find_by!(name: "test").then do |account|
      account.meta["dump-version"] = dump.digest
      account.save!
    end
  end
) do
  # ...
end
```

### 設定

ほかにもいくつかの設定オプションがあります。

```ruby
TestProf::AnyFixture.configure do |config|
  # ダンプの保存先 (デフォルトは TestProf.artifact_path + '/any_dumps')
  config.dumps_dir = "any_dumps"
  # (INSERT/UPDATE/DELETE クエリに加えて) マッチするクエリをダンプに含める
  config.dump_matching_queries = /^$/
  # ダンプの復元に psql や sqlite3 などの CLI ツールを使おうとするかどうか (false の場合は代わりに ActiveRecord を使う)
  config.import_dump_via_cli = false
end
```

**注意:** CLI ツールを使ってダンプを復元する場合、影響を受けたテーブルを追跡できないため、`AnyFixture.clean` でクリーンアップすることはできません。
